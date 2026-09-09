"""
Users router — profile management.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.artisan import Artisan
from app.models.buyer import Buyer
from app.models.product import Product
from app.models.transaction import TransactionEnquiry
from app.schemas.user import UserProfileResponse, UpdateProfileRequest
from app.schemas.transaction import EnquiryResponse, EnquiryListResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full profile for authenticated user (includes role-specific data)."""
    profile = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "avatar_url": current_user.avatar_url,
        "is_active": current_user.is_active,
    }

    if current_user.role == "artisan":
        result = await db.execute(
            select(Artisan).where(Artisan.user_id == current_user.id)
        )
        artisan = result.scalar_one_or_none()
        if artisan:
            profile.update({
                "bio": artisan.bio,
                "craft_specialty": artisan.craft_specialty,
                "latitude": artisan.latitude,
                "longitude": artisan.longitude,
                "address": artisan.address,
                "rating": artisan.rating,
                "total_sales": artisan.total_sales,
                "is_verified": artisan.is_verified,
            })
    elif current_user.role == "buyer":
        result = await db.execute(
            select(Buyer).where(Buyer.user_id == current_user.id)
        )
        buyer = result.scalar_one_or_none()
        if buyer:
            profile.update({
                "phone": buyer.phone,
                "shipping_address": buyer.shipping_address,
            })

    return UserProfileResponse(**profile)


@router.put("/me", response_model=UserProfileResponse)
async def update_profile(
    update_data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile."""
    data = update_data.model_dump(exclude_unset=True)

    # Update User-level fields
    user_fields = {"full_name", "avatar_url"}
    for key in user_fields:
        if key in data:
            setattr(current_user, key, data[key])

    # Update role-specific fields
    if current_user.role == "artisan":
        result = await db.execute(
            select(Artisan).where(Artisan.user_id == current_user.id)
        )
        artisan = result.scalar_one_or_none()
        if artisan:
            artisan_fields = {"bio", "craft_specialty", "latitude", "longitude", "address"}
            for key in artisan_fields:
                if key in data:
                    setattr(artisan, key, data[key])

    elif current_user.role == "buyer":
        result = await db.execute(
            select(Buyer).where(Buyer.user_id == current_user.id)
        )
        buyer = result.scalar_one_or_none()
        if buyer:
            buyer_fields = {"phone", "shipping_address"}
            for key in buyer_fields:
                if key in data:
                    setattr(buyer, key, data[key])

    await db.flush()

    # Return updated profile
    return await get_profile(current_user=current_user, db=db)


@router.get("/me/enquiries", response_model=EnquiryListResponse)
async def my_sent_enquiries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get enquiries and order requests sent by the current user to artisans."""
    buyer_res = await db.execute(select(Buyer).where(Buyer.user_id == current_user.id))
    buyer = buyer_res.scalar_one_or_none()
    if not buyer:
        buyer = Buyer(user_id=current_user.id)
        db.add(buyer)
        await db.flush()

    stmt = (
        select(TransactionEnquiry, Product.title, User.full_name)
        .join(Product, TransactionEnquiry.product_id == Product.id)
        .outerjoin(Artisan, Product.artisan_id == Artisan.id)
        .outerjoin(User, Artisan.user_id == User.id)
        .where(TransactionEnquiry.buyer_id == buyer.id)
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
            buyer_name=artisan_name or "Artisan",
            type=e.type,
            status=e.status,
            message=e.message,
            response_message=e.response_message,
            created_at=e.created_at,
        )
        for e, title, artisan_name in rows
    ]

    return EnquiryListResponse(enquiries=enquiries, total=len(enquiries))
