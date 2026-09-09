from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.product import Product, ProductStatus
from app.models.artisan import Artisan
from app.models.buyer import Buyer
from app.models.transaction import TransactionEnquiry, TransactionStatus
from app.schemas.product import (
    AICatalogueResponse, ProductCreate, ProductUpdate,
    ProductResponse, ProductListResponse, RegenerateRequest,
)
from app.schemas.transaction import EnquiryCreate, EnquiryResponse
from app.middleware.auth import get_current_user, require_role, get_optional_user
from app.services.ai_pipeline import ai_pipeline
from app.services.embedding_service import embedding_service
from app.utils.slug import generate_slug

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/ai-catalogue", response_model=AICatalogueResponse)
async def ai_catalogue(
    images: list[UploadFile] = File(...),
    artisan_keywords: Optional[str] = Form(None),
    current_user: User = Depends(require_role("artisan")),
):
    """
    Upload images and run the AI cataloguing pipeline.
    Returns AI-drafted catalogue JSON — NOT saved to DB yet.
    Artisan reviews and edits before publishing.
    """
    if not images:
        raise HTTPException(status_code=400, detail="At least one image required")

    if len(images) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 images allowed")

    # Read image data
    image_pairs = []
    for img in images:
        data = await img.read()
        image_pairs.append((data, img.filename or "image.jpg"))

    # Run AI pipeline
    result = await ai_pipeline.process_images(image_pairs, artisan_keywords)

    return AICatalogueResponse(
        title=result["title"],
        description=result["description"],
        short_description=result["short_description"],
        category=result["category"],
        subcategory=result.get("subcategory"),
        tags=result["tags"],
        seo_meta_description=result["seo_meta_description"],
        suggested_price_min=result["suggested_price_min"],
        suggested_price_max=result["suggested_price_max"],
        suggested_price=result["suggested_price"],
        price_rationale=result["price_rationale"],
        detected_materials=result["detected_materials"],
        detected_colors=result["detected_colors"],
        style_tags=result["style_tags"],
        images=[img["url"] for img in result["images"]],
    )


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(require_role("artisan")),
    db: AsyncSession = Depends(get_db),
):
    """Save a new product (after AI review or manual entry)."""
    # Get artisan profile
    result = await db.execute(
        select(Artisan).where(Artisan.user_id == current_user.id)
    )
    artisan = result.scalar_one_or_none()
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan profile not found")

    slug = generate_slug(product_data.title)

    product = Product(
        artisan_id=artisan.id,
        title=product_data.title,
        description=product_data.description,
        short_description=product_data.short_description,
        category=product_data.category,
        subcategory=product_data.subcategory,
        tags=product_data.tags,
        price=product_data.price,
        images=product_data.images,
        slug=slug,
        status=product_data.status,
        seo_meta=product_data.seo_meta or {
            "title": product_data.title,
            "description": product_data.short_description or product_data.description[:160],
        },
        ai_generated_fields=product_data.ai_generated_fields,
        ai_suggested_price_min=product_data.ai_suggested_price_min,
        ai_suggested_price_max=product_data.ai_suggested_price_max,
    )
    db.add(product)
    await db.flush()

    # Add to FAISS index
    embed_text = f"{product.title} {product.description} {product.category} {' '.join(product.tags or [])}"
    embedding_id = embedding_service.add_to_index(product.id, embed_text)
    product.embedding_id = embedding_id
    await db.flush()

    return ProductResponse(
        id=product.id,
        artisan_id=product.artisan_id,
        title=product.title,
        description=product.description,
        short_description=product.short_description,
        category=product.category,
        subcategory=product.subcategory,
        tags=product.tags or [],
        price=product.price,
        ai_suggested_price_min=product.ai_suggested_price_min,
        ai_suggested_price_max=product.ai_suggested_price_max,
        ai_generated_fields=product.ai_generated_fields,
        images=product.images or [],
        slug=product.slug,
        seo_meta=product.seo_meta,
        status=product.status,
        view_count=product.view_count,
        enquiry_count=product.enquiry_count,
        created_at=product.created_at,
        updated_at=product.updated_at,
        artisan_name=current_user.full_name,
    )


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: User = Depends(require_role("artisan", "admin")),
    db: AsyncSession = Depends(get_db),
):
    """Update a product (artisan owner or admin only)."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check ownership (unless admin)
    if current_user.role != "admin":
        artisan_result = await db.execute(
            select(Artisan).where(Artisan.user_id == current_user.id)
        )
        artisan = artisan_result.scalar_one_or_none()
        if not artisan or product.artisan_id != artisan.id:
            raise HTTPException(status_code=403, detail="Not your product")

    # Update fields
    update_data = product_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    # Update slug if title changed
    if "title" in update_data:
        product.slug = generate_slug(update_data["title"])

    # Update embedding if content changed
    if any(k in update_data for k in ["title", "description", "tags", "category"]):
        embed_text = f"{product.title} {product.description} {product.category} {' '.join(product.tags or [])}"
        embedding_service.add_to_index(product.id, embed_text)

    await db.flush()

    return ProductResponse(
        id=product.id,
        artisan_id=product.artisan_id,
        title=product.title,
        description=product.description,
        short_description=product.short_description,
        category=product.category,
        subcategory=product.subcategory,
        tags=product.tags or [],
        price=product.price,
        ai_suggested_price_min=product.ai_suggested_price_min,
        ai_suggested_price_max=product.ai_suggested_price_max,
        ai_generated_fields=product.ai_generated_fields,
        images=product.images or [],
        slug=product.slug,
        seo_meta=product.seo_meta,
        status=product.status,
        view_count=product.view_count,
        enquiry_count=product.enquiry_count,
        created_at=product.created_at,
        updated_at=product.updated_at,
    )


@router.post("/{product_id}/regenerate")
async def regenerate_field(
    product_id: str,
    request: RegenerateRequest,
    current_user: User = Depends(require_role("artisan")),
    db: AsyncSession = Depends(get_db),
):
    """Re-run AI on a specific field for fresh suggestions."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product_data = {
        "title": product.title,
        "description": product.description,
        "category": product.category,
        "subcategory": product.subcategory,
        "tags": product.tags,
        "materials": (product.ai_generated_fields or {}).get("materials", []),
        "colors": (product.ai_generated_fields or {}).get("colors", []),
        "styles": (product.ai_generated_fields or {}).get("styles", []),
    }

    regenerated = await ai_pipeline.regenerate_field(
        request.field, product_data, request.context
    )
    return regenerated


@router.get("/{slug}", response_model=ProductResponse)
async def get_product_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a product by its SEO-friendly slug (public endpoint)."""
    result = await db.execute(
        select(Product, User.full_name, Artisan.address)
        .join(Artisan, Product.artisan_id == Artisan.id)
        .join(User, Artisan.user_id == User.id)
        .where(Product.slug == slug)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    product, artisan_name, artisan_location = row

    # Increment view count
    product.view_count += 1
    await db.flush()

    return ProductResponse(
        id=product.id,
        artisan_id=product.artisan_id,
        title=product.title,
        description=product.description,
        short_description=product.short_description,
        category=product.category,
        subcategory=product.subcategory,
        tags=product.tags or [],
        price=product.price,
        ai_suggested_price_min=product.ai_suggested_price_min,
        ai_suggested_price_max=product.ai_suggested_price_max,
        ai_generated_fields=product.ai_generated_fields,
        images=product.images or [],
        slug=product.slug,
        seo_meta=product.seo_meta,
        status=product.status,
        view_count=product.view_count,
        enquiry_count=product.enquiry_count,
        created_at=product.created_at,
        updated_at=product.updated_at,
        artisan_name=artisan_name,
        artisan_location=artisan_location,
    )


@router.get("", response_model=ProductListResponse)
async def list_products(
    page: int = 1,
    per_page: int = 20,
    category: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List published products with optional filtering (public endpoint)."""
    stmt = (
        select(Product)
        .where(Product.status == ProductStatus.PUBLISHED)
        .order_by(Product.created_at.desc())
    )

    if category:
        stmt = stmt.where(Product.category.ilike(f"%{category}%"))

    # Count
    count_stmt = select(func.count()).select_from(Product).where(Product.status == ProductStatus.PUBLISHED)
    if category:
        count_stmt = count_stmt.where(Product.category.ilike(f"%{category}%"))
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    # Paginate
    stmt = stmt.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    products = result.scalars().all()

    return ProductListResponse(
        products=[
            ProductResponse(
                id=p.id,
                artisan_id=p.artisan_id,
                title=p.title,
                description=p.description,
                short_description=p.short_description,
                category=p.category,
                subcategory=p.subcategory,
                tags=p.tags or [],
                price=p.price,
                images=p.images or [],
                slug=p.slug,
                seo_meta=p.seo_meta,
                status=p.status,
                view_count=p.view_count,
                enquiry_count=p.enquiry_count,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
            for p in products
        ],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page if per_page > 0 else 0,
    )


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: User = Depends(require_role("artisan", "admin")),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a product (artisan owner or admin)."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if current_user.role != "admin":
        artisan_result = await db.execute(
            select(Artisan).where(Artisan.user_id == current_user.id)
        )
        artisan = artisan_result.scalar_one_or_none()
        if not artisan or product.artisan_id != artisan.id:
            raise HTTPException(status_code=403, detail="Not your product")

    product.status = ProductStatus.DRAFT  # Soft delete = move to draft
    await db.flush()
    embedding_service.remove_from_index(product_id)

    return {"message": "Product removed"}


@router.post("/{product_id}/enquiry", response_model=EnquiryResponse, status_code=status.HTTP_201_CREATED)
async def create_enquiry(
    product_id: str,
    enquiry_data: EnquiryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit an enquiry or buy request for a product."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get or create buyer profile for current_user
    buyer_res = await db.execute(select(Buyer).where(Buyer.user_id == current_user.id))
    buyer = buyer_res.scalar_one_or_none()
    if not buyer:
        buyer = Buyer(user_id=current_user.id)
        db.add(buyer)
        await db.flush()

    enquiry = TransactionEnquiry(
        product_id=product.id,
        buyer_id=buyer.id,
        type=enquiry_data.type or "enquiry",
        status=TransactionStatus.PENDING,
        message=enquiry_data.message,
    )
    db.add(enquiry)

    # Increment enquiry count on product
    product.enquiry_count = (product.enquiry_count or 0) + 1
    await db.flush()

    return EnquiryResponse(
        id=enquiry.id,
        product_id=enquiry.product_id,
        product_title=product.title,
        buyer_id=buyer.id,
        buyer_name=current_user.full_name,
        type=enquiry.type,
        status=enquiry.status,
        message=enquiry.message,
        response_message=enquiry.response_message,
        created_at=enquiry.created_at,
    )
