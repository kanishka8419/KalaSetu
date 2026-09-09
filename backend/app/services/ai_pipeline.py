"""
AI Pipeline orchestrator — chains CV → Gemini → Pricing → Embeddings.
This is the core differentiator of KalaSetu.
"""

import asyncio
from typing import Optional
from app.services.cv_service import cv_service
from app.services.gemini_service import gemini_service
from app.services.cloudinary_service import cloudinary_service
from app.services.embedding_service import embedding_service


class AIPipeline:
    """
    Orchestrates the full AI cataloguing pipeline:
    1. Upload image to Cloudinary
    2. Run CV analysis (CLIP + YOLO)
    3. Generate catalogue with Gemini
    4. Generate embeddings for search
    """

    async def process_images(
        self,
        images: list[tuple[bytes, str]],  # (file_data, filename) pairs
        artisan_keywords: Optional[str] = None,
    ) -> dict:
        """
        Full AI cataloguing pipeline for one or more images.
        Returns AI-drafted catalogue JSON (not yet saved).
        """
        # Step 1: Upload all images to Cloudinary
        upload_tasks = [
            cloudinary_service.upload_image(data, name)
            for data, name in images
        ]
        upload_results = await asyncio.gather(*upload_tasks)
        image_urls = [r["secure_url"] for r in upload_results]
        thumbnail_urls = [r["thumbnail_url"] for r in upload_results]

        # Step 2: Run CV analysis on the first image (primary)
        primary_image_data = images[0][0]
        cv_analysis = await cv_service.analyze_image(
            primary_image_data, images[0][1], artisan_keywords=artisan_keywords
        )

        # Step 3: Generate catalogue with Gemini
        catalogue = await gemini_service.generate_catalogue(
            cv_analysis, artisan_keywords
        )

        # Step 4: Combine all results
        result = {
            **catalogue,
            "images": [
                {"url": url, "thumbnail": thumb}
                for url, thumb in zip(image_urls, thumbnail_urls)
            ],
            "detected_materials": cv_analysis["materials"],
            "detected_colors": cv_analysis["colors"],
            "style_tags": cv_analysis["style_tags"],
            "cv_confidence": cv_analysis["confidence"],
            "ai_generated_fields": {
                "title": True,
                "description": True,
                "short_description": True,
                "category": True,
                "subcategory": True,
                "tags": True,
                "price": True,
                "seo_meta_description": True,
            },
        }

        return result

    async def regenerate_field(
        self, field: str, product_data: dict, context: Optional[str] = None
    ) -> dict:
        """Re-run AI on a specific field for fresh suggestions."""
        new_value = await gemini_service.regenerate_field(field, product_data, context)
        return {"field": field, "value": new_value}


ai_pipeline = AIPipeline()
