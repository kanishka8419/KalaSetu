"""
Slug generation utility for SEO-friendly URLs.
"""

from slugify import slugify
import uuid


def generate_slug(title: str, existing_slugs: list[str] | None = None) -> str:
    """
    Generate a URL-friendly slug from a title.
    Appends a short UUID suffix to ensure uniqueness.
    """
    base_slug = slugify(title, max_length=80)
    if not base_slug:
        base_slug = "product"

    # Always add a short unique suffix
    short_id = str(uuid.uuid4())[:8]
    slug = f"{base_slug}-{short_id}"

    return slug
