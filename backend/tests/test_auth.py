"""
Auth endpoint tests.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_artisan(client: AsyncClient):
    """Test artisan registration."""
    response = await client.post("/auth/register", json={
        "email": "testartisan@test.com",
        "password": "testpass123",
        "full_name": "Test Artisan",
        "role": "artisan",
        "craft_specialty": "pottery",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testartisan@test.com"
    assert data["user"]["role"] == "artisan"


@pytest.mark.asyncio
async def test_register_buyer(client: AsyncClient):
    """Test buyer registration."""
    response = await client.post("/auth/register", json={
        "email": "testbuyer@test.com",
        "password": "testpass123",
        "full_name": "Test Buyer",
        "role": "buyer",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["role"] == "buyer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Test that duplicate email registration fails."""
    await client.post("/auth/register", json={
        "email": "dup@test.com",
        "password": "testpass123",
        "full_name": "First User",
        "role": "buyer",
    })
    response = await client.post("/auth/register", json={
        "email": "dup@test.com",
        "password": "testpass123",
        "full_name": "Second User",
        "role": "buyer",
    })
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Test successful login."""
    await client.post("/auth/register", json={
        "email": "login@test.com",
        "password": "testpass123",
        "full_name": "Login User",
        "role": "buyer",
    })
    response = await client.post("/auth/login", json={
        "email": "login@test.com",
        "password": "testpass123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login@test.com"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    """Test login with wrong password."""
    await client.post("/auth/register", json={
        "email": "wrong@test.com",
        "password": "testpass123",
        "full_name": "Wrong Pass",
        "role": "buyer",
    })
    response = await client.post("/auth/login", json={
        "email": "wrong@test.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient):
    """Test authenticated user info endpoint."""
    reg = await client.post("/auth/register", json={
        "email": "me@test.com",
        "password": "testpass123",
        "full_name": "Me User",
        "role": "artisan",
    })
    token = reg.json()["access_token"]

    response = await client.get("/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert response.json()["email"] == "me@test.com"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    """Test that unauthenticated access to /auth/me fails."""
    response = await client.get("/auth/me")
    assert response.status_code == 401
