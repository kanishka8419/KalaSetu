"""
User schemas — profile views and updates.
"""

from pydantic import BaseModel
from typing import Optional


class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    is_active: bool
    # Artisan-specific
    bio: Optional[str] = None
    craft_specialty: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    rating: Optional[float] = None
    total_sales: Optional[int] = None
    is_verified: Optional[bool] = None
    # Buyer-specific
    phone: Optional[str] = None
    shipping_address: Optional[str] = None

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    craft_specialty: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    shipping_address: Optional[str] = None


class ArtisanPublicProfile(BaseModel):
    id: int
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    craft_specialty: Optional[str] = None
    address: Optional[str] = None
    rating: float = 0.0
    total_sales: int = 0
    is_verified: bool = False
    product_count: int = 0

    model_config = {"from_attributes": True}


class AdminUserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: str

    model_config = {"from_attributes": True}
