"""
Admin router — user management, moderation, analytics.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.user import User
from app.models.artisan import Artisan
from app.models.product import Product, ProductStatus
from app.models.transaction import TransactionEnquiry
from app.middleware.auth import require_role

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
async def list_users(
    page: int = 1,
    per_page: int = 50,
    role: str = None,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    stmt = select(User).order_by(User.created_at.desc())
    if role:
        stmt = stmt.where(User.role == role)

    count_stmt = select(func.count()).select_from(User)
    if role:
        count_stmt = count_stmt.where(User.role == role)
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    users = result.scalars().all()

    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "is_active": u.is_active,
                "created_at": str(u.created_at),
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Approve or suspend a user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = is_active
    await db.flush()

    action = "activated" if is_active else "suspended"
    return {"message": f"User {action} successfully"}


@router.get("/moderation")
async def moderation_queue(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Products pending moderation (draft or flagged)."""
    stmt = (
        select(Product, User.full_name)
        .join(Artisan, Product.artisan_id == Artisan.id)
        .join(User, Artisan.user_id == User.id)
        .where(Product.status.in_([ProductStatus.DRAFT, ProductStatus.FLAGGED]))
        .order_by(Product.created_at.desc())
        .limit(50)
    )
    result = await db.execute(stmt)
    rows = result.all()

    return {
        "items": [
            {
                "id": p.id,
                "title": p.title,
                "category": p.category,
                "status": p.status,
                "images": p.images or [],
                "artisan_name": name,
                "created_at": str(p.created_at),
                "ai_generated_fields": p.ai_generated_fields,
            }
            for p, name in rows
        ],
        "total": len(rows),
    }


@router.put("/products/{product_id}/moderate")
async def moderate_product(
    product_id: str,
    action: str,  # "approve" or "reject"
    reason: str = None,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Approve or reject a product."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if action == "approve":
        product.status = ProductStatus.PUBLISHED
    elif action == "reject":
        product.status = ProductStatus.FLAGGED
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    await db.flush()
    return {"message": f"Product {action}d successfully"}


@router.get("/analytics")
async def platform_analytics(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Platform-wide analytics."""
    # User stats
    user_count = await db.execute(select(func.count()).select_from(User))
    artisan_count = await db.execute(
        select(func.count()).select_from(User).where(User.role == "artisan")
    )
    buyer_count = await db.execute(
        select(func.count()).select_from(User).where(User.role == "buyer")
    )

    # Product stats
    product_count = await db.execute(select(func.count()).select_from(Product))
    published_count = await db.execute(
        select(func.count()).select_from(Product)
        .where(Product.status == ProductStatus.PUBLISHED)
    )

    # Category breakdown
    category_result = await db.execute(
        select(Product.category, func.count(Product.id))
        .where(Product.status == ProductStatus.PUBLISHED)
        .group_by(Product.category)
        .order_by(func.count(Product.id).desc())
    )
    categories = {cat: count for cat, count in category_result.all()}

    # Total views & enquiries
    view_result = await db.execute(select(func.sum(Product.view_count)))
    enquiry_result = await db.execute(select(func.sum(Product.enquiry_count)))

    # Transaction stats
    transaction_count = await db.execute(
        select(func.count()).select_from(TransactionEnquiry)
    )

    return {
        "total_users": user_count.scalar() or 0,
        "total_artisans": artisan_count.scalar() or 0,
        "total_buyers": buyer_count.scalar() or 0,
        "total_products": product_count.scalar() or 0,
        "published_products": published_count.scalar() or 0,
        "total_views": view_result.scalar() or 0,
        "total_enquiries": enquiry_result.scalar() or 0,
        "total_transactions": transaction_count.scalar() or 0,
        "category_breakdown": categories,
        "ai_pipeline_health": {
            "cv_service": "operational",
            "gemini_service": "operational (mock)",
            "embedding_service": "operational",
            "cloudinary_service": "operational (mock)",
        },
    }
