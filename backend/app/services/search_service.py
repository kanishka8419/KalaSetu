"""
Search service — hybrid keyword + semantic search with ranking fusion.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, cast, String
from app.models.product import Product, ProductStatus
from app.models.artisan import Artisan
from app.models.user import User
from app.services.embedding_service import embedding_service
from typing import Optional


class SearchService:
    """
    Hybrid search combining PostgreSQL full-text and FAISS semantic search.
    Uses reciprocal rank fusion to merge results.
    """

    async def hybrid_search(
        self,
        db: AsyncSession,
        query: str,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        page: int = 1,
        per_page: int = 20,
        sort_by: str = "relevance",
    ) -> dict:
        """Execute hybrid search and return ranked results."""

        # --- Keyword search (PostgreSQL LIKE / basic filtering) ---
        stmt = (
            select(Product, User.full_name, Artisan.address)
            .join(Artisan, Product.artisan_id == Artisan.id)
            .join(User, Artisan.user_id == User.id)
            .where(Product.status == ProductStatus.PUBLISHED)
        )

        if query:
            search_pattern = f"%{query}%"
            stmt = stmt.where(
                or_(
                    Product.title.ilike(search_pattern),
                    Product.description.ilike(search_pattern),
                    Product.category.ilike(search_pattern),
                    cast(Product.tags, String).ilike(search_pattern),
                )
            )

        if category:
            cat_clean = category.lower().strip()
            cat_alt = cat_clean.replace("_", " ") if "_" in cat_clean else cat_clean.replace(" ", "_")
            stmt = stmt.where(
                or_(
                    Product.category.ilike(f"%{cat_clean}%"),
                    Product.category.ilike(f"%{cat_alt}%"),
                )
            )

        if min_price is not None:
            stmt = stmt.where(Product.price >= min_price)

        if max_price is not None:
            stmt = stmt.where(Product.price <= max_price)

        # Sorting
        if sort_by == "price_asc":
            stmt = stmt.order_by(Product.price.asc())
        elif sort_by == "price_desc":
            stmt = stmt.order_by(Product.price.desc())
        elif sort_by == "newest":
            stmt = stmt.order_by(Product.created_at.desc())
        elif sort_by == "popular":
            stmt = stmt.order_by(Product.view_count.desc())
        else:
            stmt = stmt.order_by(Product.created_at.desc())

        # Count total
        count_stmt = (
            select(func.count())
            .select_from(Product)
            .where(Product.status == ProductStatus.PUBLISHED)
        )
        if query:
            search_pattern = f"%{query}%"
            count_stmt = count_stmt.where(
                or_(
                    Product.title.ilike(search_pattern),
                    Product.description.ilike(search_pattern),
                    Product.category.ilike(search_pattern),
                    cast(Product.tags, String).ilike(search_pattern),
                )
            )
        if category:
            cat_clean = category.lower().strip()
            cat_alt = cat_clean.replace("_", " ") if "_" in cat_clean else cat_clean.replace(" ", "_")
            count_stmt = count_stmt.where(
                or_(
                    Product.category.ilike(f"%{cat_clean}%"),
                    Product.category.ilike(f"%{cat_alt}%"),
                )
            )
        if min_price is not None:
            count_stmt = count_stmt.where(Product.price >= min_price)
        if max_price is not None:
            count_stmt = count_stmt.where(Product.price <= max_price)

        total_result = await db.execute(count_stmt)
        total = total_result.scalar() or 0

        # Pagination
        offset = (page - 1) * per_page
        stmt = stmt.offset(offset).limit(per_page)

        result = await db.execute(stmt)
        rows = result.all()

        # --- Semantic search boost (if query is non-empty) ---
        semantic_scores: dict[str, float] = {}
        if query:
            semantic_results = embedding_service.search_similar(query, top_k=50)
            for pid, score in semantic_results:
                semantic_scores[pid] = score

        # Merge results with semantic scores
        results = []
        for i, row in enumerate(rows):
            product, artisan_name, artisan_location = row
            keyword_rank = offset + i + 1
            semantic_score = semantic_scores.get(product.id, 0.0)

            # Reciprocal rank fusion
            rrf_score = 1.0 / (60 + keyword_rank)  # Constant k=60
            if semantic_score > 0:
                rrf_score += semantic_score * 0.3  # Weighted semantic boost

            tags_list = product.tags if isinstance(product.tags, list) else []
            match_tags = [product.category] + tags_list[:2]
            match_reason = f"matches: {', '.join(match_tags)}"

            results.append({
                "id": product.id,
                "title": product.title,
                "short_description": product.short_description,
                "category": product.category,
                "price": product.price,
                "images": product.images or [],
                "slug": product.slug,
                "artisan_name": artisan_name,
                "artisan_location": artisan_location,
                "relevance_score": round(rrf_score, 4),
                "match_reason": match_reason,
            })

        # Sort by relevance score if in relevance mode
        if sort_by == "relevance" and query:
            results.sort(key=lambda x: x["relevance_score"], reverse=True)

        return {
            "results": results,
            "total": total,
            "page": page,
            "per_page": per_page,
            "query": query,
            "suggestions": self._generate_suggestions(query),
        }

    def _generate_suggestions(self, query: str) -> list[str]:
        """Generate search suggestions based on query."""
        if not query:
            return ["pottery", "handwoven textiles", "silver jewelry", "carved wood", "brass lamp"]
        suggestions = [
            f"{query} handmade",
            f"{query} traditional",
            f"artisan {query}",
            f"{query} from Rajasthan",
        ]
        return suggestions[:4]


search_service = SearchService()
