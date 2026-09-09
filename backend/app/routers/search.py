"""
Search router — hybrid keyword + semantic search endpoint.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.schemas.search import SearchResponse
from app.services.search_service import search_service

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("", response_model=SearchResponse)
async def search(
    q: str = Query(default="", max_length=500),
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    sort_by: str = Query(default="relevance"),
    db: AsyncSession = Depends(get_db),
):
    """
    Hybrid search: keyword (PostgreSQL) + semantic (FAISS).
    Public endpoint — no auth required for browsing.
    """
    results = await search_service.hybrid_search(
        db=db,
        query=q,
        category=category,
        min_price=min_price,
        max_price=max_price,
        page=page,
        per_page=per_page,
        sort_by=sort_by,
    )

    return SearchResponse(**results)
