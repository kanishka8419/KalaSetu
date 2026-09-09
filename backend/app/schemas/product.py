"""
Product schemas — Pydantic v2 models for product CRUD and AI cataloguing.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AICatalogueRequest(BaseModel):
    """Request to run AI cataloguing pipeline on uploaded images."""
    artisan_keywords: Optional[str] = None


class AICatalogueResponse(BaseModel):
    """AI-generated catalogue draft — all fields editable by artisan."""
    title: str
    description: str
    short_description: str
    category: str
    subcategory: Optional[str] = None
    tags: list[str] = []
    seo_meta_description: str
    suggested_price_min: float
    suggested_price_max: float
    suggested_price: float
    price_rationale: str
    detected_materials: list[str] = []
    detected_colors: list[str] = []
    style_tags: list[str] = []
    images: list[str] = []  # Cloudinary URLs


class ProductCreate(BaseModel):
    """Create/publish a product (after AI review or manual entry)."""
    title: str = Field(min_length=3, max_length=500)
    description: str = Field(min_length=10)
    short_description: Optional[str] = Field(None, max_length=500)
    category: str = Field(min_length=2, max_length=100)
    subcategory: Optional[str] = None
    tags: list[str] = []
    price: float = Field(gt=0)
    images: list[str] = []
    status: str = Field(default="draft", pattern="^(draft|published)$")
    seo_meta: Optional[dict] = None
    ai_generated_fields: Optional[dict] = None
    ai_suggested_price_min: Optional[float] = None
    ai_suggested_price_max: Optional[float] = None


class ProductUpdate(BaseModel):
    """Update an existing product — all fields optional."""
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    tags: Optional[list[str]] = None
    price: Optional[float] = None
    images: Optional[list[str]] = None
    status: Optional[str] = None
    seo_meta: Optional[dict] = None
    ai_generated_fields: Optional[dict] = None


class ProductResponse(BaseModel):
    """Full product detail response."""
    id: str
    artisan_id: int
    title: str
    description: str
    short_description: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    tags: list = []
    price: float
    ai_suggested_price_min: Optional[float] = None
    ai_suggested_price_max: Optional[float] = None
    ai_generated_fields: Optional[dict] = None
    images: list = []
    slug: str
    seo_meta: Optional[dict] = None
    status: str
    view_count: int = 0
    enquiry_count: int = 0
    created_at: datetime
    updated_at: datetime
    artisan_name: Optional[str] = None
    artisan_location: Optional[str] = None

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    """Paginated product listing."""
    products: list[ProductResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class RegenerateRequest(BaseModel):
    """Request to regenerate a specific AI field."""
    field: str = Field(pattern="^(title|description|short_description|tags|price|category)$")
    context: Optional[str] = None
