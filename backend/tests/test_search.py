"""
Search endpoint tests.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_search_empty_query(client: AsyncClient):
    """Test search with empty query returns results structure."""
    response = await client.get("/search")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "total" in data
    assert "suggestions" in data


@pytest.mark.asyncio
async def test_search_with_query(client: AsyncClient):
    """Test search with keyword."""
    response = await client.get("/search?q=pottery")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert data["query"] == "pottery"


@pytest.mark.asyncio
async def test_search_with_filters(client: AsyncClient):
    """Test search with category and price filters."""
    response = await client.get("/search?q=handmade&category=pottery&min_price=100&max_price=5000")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_search_pagination(client: AsyncClient):
    """Test search pagination parameters."""
    response = await client.get("/search?q=artisan&page=1&per_page=5")
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["per_page"] == 5
