"""
Product endpoint tests.
"""

import pytest
from httpx import AsyncClient


async def create_artisan(client: AsyncClient, email: str = "prodartisan@test.com"):
    """Helper: register an artisan and return token."""
    reg = await client.post("/auth/register", json={
        "email": email,
        "password": "testpass123",
        "full_name": "Product Artisan",
        "role": "artisan",
        "craft_specialty": "pottery",
    })
    return reg.json()["access_token"]


@pytest.mark.asyncio
async def test_create_product(client: AsyncClient):
    """Test product creation by artisan."""
    token = await create_artisan(client, "create@test.com")

    response = await client.post("/products", json={
        "title": "Test Handmade Bowl",
        "description": "A beautiful handmade ceramic bowl crafted with love.",
        "category": "pottery",
        "price": 1500.0,
        "tags": ["pottery", "handmade", "ceramic"],
        "images": ["https://picsum.photos/seed/test/800/800"],
        "status": "draft",
    }, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Handmade Bowl"
    assert data["status"] == "draft"
    assert "slug" in data


@pytest.mark.asyncio
async def test_create_product_unauthenticated(client: AsyncClient):
    """Test that unauthenticated product creation fails."""
    response = await client.post("/products", json={
        "title": "Unauthorized Product",
        "description": "Should not be created.",
        "category": "pottery",
        "price": 1000.0,
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_product_buyer_forbidden(client: AsyncClient):
    """Test that buyers cannot create products."""
    reg = await client.post("/auth/register", json={
        "email": "buyercreate@test.com",
        "password": "testpass123",
        "full_name": "Buyer User",
        "role": "buyer",
    })
    token = reg.json()["access_token"]

    response = await client.post("/products", json={
        "title": "Buyer Product",
        "description": "Buyers should not create products.",
        "category": "pottery",
        "price": 1000.0,
    }, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_products(client: AsyncClient):
    """Test public product listing."""
    response = await client.get("/products")
    assert response.status_code == 200
    data = response.json()
    assert "products" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_update_product(client: AsyncClient):
    """Test product update by owner artisan."""
    token = await create_artisan(client, "update@test.com")

    # Create product
    create_resp = await client.post("/products", json={
        "title": "Original Title",
        "description": "Original description for the product test.",
        "category": "pottery",
        "price": 1000.0,
        "status": "draft",
    }, headers={"Authorization": f"Bearer {token}"})
    product_id = create_resp.json()["id"]

    # Update
    response = await client.put(f"/products/{product_id}", json={
        "title": "Updated Title",
        "price": 1200.0,
        "status": "published",
    }, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"
    assert response.json()["price"] == 1200.0


@pytest.mark.asyncio
async def test_ai_catalogue_endpoint(client: AsyncClient):
    """Test AI catalogue endpoint accepts file upload."""
    token = await create_artisan(client, "ai@test.com")

    # Create a simple test image (1x1 pixel PNG)
    import io
    from PIL import Image
    img = Image.new("RGB", (100, 100), color="red")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    response = await client.post(
        "/products/ai-catalogue",
        files={"images": ("test.png", buf, "image/png")},
        data={"artisan_keywords": "traditional pottery"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "description" in data
    assert "category" in data
    assert "suggested_price" in data
    assert "tags" in data
    assert len(data["images"]) > 0
