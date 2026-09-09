"""
Search schemas — request/response models for hybrid search.
"""

from pydantic import BaseModel, Field
from typing import Optional


class SearchRequest(BaseModel):
    q: str = Field(default="", max_length=500)
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    material: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius_km: Optional[float] = Field(default=50.0, le=500)
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)
    sort_by: str = Field(default="relevance", pattern="^(relevance|price_asc|price_desc|newest|popular)$")


class SearchResult(BaseModel):
    id: str
    title: str
    short_description: Optional[str] = None
    category: str
    price: float
    images: list = []
    slug: str
    artisan_name: Optional[str] = None
    artisan_location: Optional[str] = None
    relevance_score: float = 0.0


class SearchResponse(BaseModel):
    results: list[SearchResult]
    total: int
    page: int
    per_page: int
    query: str
    suggestions: list[str] = []
