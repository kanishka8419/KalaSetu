"""
Artisans router — artisan-specific views: products, enquiries, analytics.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.user import User
from app.models.artisan import Artisan
from app.models.product import Product
from app.models.buyer import Buyer
from app.models.transaction import TransactionEnquiry
from app.schemas.product import ProductResponse, ProductListResponse
from app.schemas.transaction import EnquiryResponse, EnquiryReply, EnquiryListResponse
from app.schemas.user import ArtisanPublicProfile
from app.middleware.auth import get_current_user, require_role
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/artisans", tags=["Artisans"])


@router.get("/me/products", response_model=ProductListResponse)
async def my_products(
    page: int = 1,
    per_page: int = 20,
    status_filter: str = None,
    current_user: User = Depends(require_role("artisan")),
    db: AsyncSession = Depends(get_db),
):
    """Get authenticated artisan's products."""
    result = await db.execute(
        select(Artisan).where(Artisan.user_id == current_user.id)
    )
    artisan = result.scalar_one_or_none()
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan profile not found")

    stmt = select(Product).where(Product.artisan_id == artisan.id)
    if status_filter:
        stmt = stmt.where(Product.status == status_filter)
    stmt = stmt.order_by(Product.created_at.desc())

    # Count
    count_stmt = select(func.count()).select_from(Product).where(Product.artisan_id == artisan.id)
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    products = result.scalars().all()

    return ProductListResponse(
        products=[
            ProductResponse(
                id=p.id, artisan_id=p.artisan_id, title=p.title,
                description=p.description, short_description=p.short_description,
                category=p.category, subcategory=p.subcategory,
                tags=p.tags or [], price=p.price, images=p.images or [],
                slug=p.slug, seo_meta=p.seo_meta, status=p.status,
                view_count=p.view_count, enquiry_count=p.enquiry_count,
                created_at=p.created_at, updated_at=p.updated_at,
                artisan_name=current_user.full_name,
            )
            for p in products
        ],
        total=total, page=page, per_page=per_page,
        total_pages=(total + per_page - 1) // per_page if per_page > 0 else 0,
    )


@router.get("/me/enquiries", response_model=EnquiryListResponse)
async def my_enquiries(
    current_user: User = Depends(require_role("artisan")),
    db: AsyncSession = Depends(get_db),
):
    """Get enquiries received by the artisan."""
    result = await db.execute(
        select(Artisan).where(Artisan.user_id == current_user.id)
    )
    artisan = result.scalar_one_or_none()
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan profile not found")

    stmt = (
        select(TransactionEnquiry, Product.title, User.full_name)
        .join(Product, TransactionEnquiry.product_id == Product.id)
        .outerjoin(Buyer, TransactionEnquiry.buyer_id == Buyer.id)
        .outerjoin(User, Buyer.user_id == User.id)
        .where(Product.artisan_id == artisan.id)
        .order_by(TransactionEnquiry.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    enquiries = [
        EnquiryResponse(
            id=e.id,
            product_id=e.product_id,
            product_title=title,
            buyer_id=e.buyer_id,
            buyer_name=buyer_name or "Interested Buyer",
            type=e.type,
            status=e.status,
            message=e.message,
            response_message=e.response_message,
            created_at=e.created_at,
        )
        for e, title, buyer_name in rows
    ]

    return EnquiryListResponse(enquiries=enquiries, total=len(enquiries))


@router.put("/enquiries/{enquiry_id}/reply")
async def reply_to_enquiry(
    enquiry_id: str,
    reply: EnquiryReply,
    current_user: User = Depends(require_role("artisan")),
    db: AsyncSession = Depends(get_db),
):
    """Reply to a buyer's enquiry."""
    result = await db.execute(
        select(TransactionEnquiry).where(TransactionEnquiry.id == enquiry_id)
    )
    enquiry = result.scalar_one_or_none()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    enquiry.response_message = reply.response_message
    enquiry.status = reply.status
    await db.flush()

    return {"message": "Reply sent successfully"}


@router.get("/me/analytics")
async def my_analytics(
    current_user: User = Depends(require_role("artisan")),
    db: AsyncSession = Depends(get_db),
):
    """Get artisan's sales/engagement analytics."""
    result = await db.execute(
        select(Artisan).where(Artisan.user_id == current_user.id)
    )
    artisan = result.scalar_one_or_none()
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan profile not found")

    # Product stats
    products_result = await db.execute(
        select(
            func.count(Product.id),
            func.sum(Product.view_count),
            func.sum(Product.enquiry_count),
        ).where(Product.artisan_id == artisan.id)
    )
    stats = products_result.first()

    # Status breakdown
    status_result = await db.execute(
        select(Product.status, func.count(Product.id))
        .where(Product.artisan_id == artisan.id)
        .group_by(Product.status)
    )
    status_breakdown = {s: c for s, c in status_result.all()}

    return {
        "total_products": stats[0] or 0,
        "total_views": stats[1] or 0,
        "total_enquiries": stats[2] or 0,
        "rating": artisan.rating,
        "total_sales": artisan.total_sales,
        "status_breakdown": status_breakdown,
    }


@router.get("/{artisan_id}", response_model=ArtisanPublicProfile)
async def get_artisan_profile(
    artisan_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get public artisan profile."""
    result = await db.execute(
        select(Artisan, User.full_name, User.avatar_url)
        .join(User, Artisan.user_id == User.id)
        .where(Artisan.id == artisan_id)
        .where(User.is_active == True)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Artisan not found")

    artisan, full_name, avatar_url = row

    # Count products
    count_result = await db.execute(
        select(func.count()).select_from(Product)
        .where(Product.artisan_id == artisan.id)
        .where(Product.status == "published")
    )
    product_count = count_result.scalar() or 0

    return ArtisanPublicProfile(
        id=artisan.id,
        full_name=full_name,
        avatar_url=avatar_url,
        bio=artisan.bio,
        craft_specialty=artisan.craft_specialty,
        address=artisan.address,
        rating=artisan.rating,
        total_sales=artisan.total_sales,
        is_verified=artisan.is_verified,
        product_count=product_count,
    )


@router.get("/nearby")
async def nearby_artisans(
    lat: float,
    lng: float,
    radius_km: float = 100,
    db: AsyncSession = Depends(get_db),
):
    """Find artisans near a location."""
    results = await recommendation_service.nearby_artisans(
        db=db, lat=lat, lng=lng, radius_km=radius_km
    )
    return {"artisans": results}
