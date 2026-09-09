"""
Recommendation service — "You may also like" and "Artisans near you".
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product, ProductStatus
from app.models.artisan import Artisan
from app.models.user import User
from app.services.embedding_service import embedding_service
from app.services.maps_service import maps_service
from typing import Optional


class RecommendationService:
    """Product and artisan recommendations via embeddings + proximity."""

    async def similar_products(
        self, db: AsyncSession, product_id: str, top_k: int = 6
    ) -> list[dict]:
        """Find products similar to the given one (via embedding similarity)."""
        # Get the product's text for embedding
        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()
        if not product:
            return []

        query_text = f"{product.title} {product.description} {product.category}"
        similar = embedding_service.search_similar(query_text, top_k=top_k + 1)

        # Exclude the product itself
        similar_ids = [pid for pid, _ in similar if pid != product_id][:top_k]

        if not similar_ids:
            # Fallback: same category products
            stmt = (
                select(Product)
                .where(Product.status == ProductStatus.PUBLISHED)
                .where(Product.category == product.category)
                .where(Product.id != product_id)
                .limit(top_k)
            )
            result = await db.execute(stmt)
            products = result.scalars().all()
        else:
            stmt = (
                select(Product)
                .where(Product.id.in_(similar_ids))
                .where(Product.status == ProductStatus.PUBLISHED)
            )
            result = await db.execute(stmt)
            products = result.scalars().all()

        return [
            {
                "id": p.id,
                "title": p.title,
                "price": p.price,
                "images": p.images or [],
                "slug": p.slug,
                "category": p.category,
            }
            for p in products
        ]

    async def nearby_artisans(
        self,
        db: AsyncSession,
        lat: float,
        lng: float,
        radius_km: float = 100,
        limit: int = 10,
    ) -> list[dict]:
        """Find artisans near the given coordinates."""
        stmt = (
            select(Artisan, User.full_name, User.avatar_url)
            .join(User, Artisan.user_id == User.id)
            .where(User.is_active == True)
            .where(Artisan.latitude.is_not(None))
            .where(Artisan.longitude.is_not(None))
        )
        result = await db.execute(stmt)
        rows = result.all()

        artisans_with_distance = []
        for artisan, name, avatar in rows:
            if artisan.latitude and artisan.longitude:
                dist = maps_service.calculate_distance(lat, lng, artisan.latitude, artisan.longitude)
                if dist <= radius_km:
                    artisans_with_distance.append({
                        "id": artisan.id,
                        "name": name,
                        "avatar_url": avatar,
                        "craft_specialty": artisan.craft_specialty,
                        "address": artisan.address,
                        "rating": artisan.rating,
                        "distance_km": round(dist, 1),
                    })

        artisans_with_distance.sort(key=lambda x: x["distance_km"])
        return artisans_with_distance[:limit]


recommendation_service = RecommendationService()
