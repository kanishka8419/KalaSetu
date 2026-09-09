"""Product model — the heart of the marketplace."""

import uuid
from datetime import datetime
from sqlalchemy import String, Float, Text, DateTime, Integer, ForeignKey, Enum as SAEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class ProductStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    SOLD = "sold"
    FLAGGED = "flagged"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    artisan_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("artisans.id", ondelete="CASCADE"), nullable=False
    )
    # Core fields
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    subcategory: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tags: Mapped[dict | None] = mapped_column(JSON, default=list)

    # Pricing
    price: Mapped[float] = mapped_column(Float, nullable=False)
    ai_suggested_price_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_suggested_price_max: Mapped[float | None] = mapped_column(Float, nullable=True)

    # AI transparency — tracks which fields were AI-generated
    ai_generated_fields: Mapped[dict | None] = mapped_column(JSON, default=dict)

    # Media
    images: Mapped[dict | None] = mapped_column(JSON, default=list)

    # SEO
    slug: Mapped[str] = mapped_column(String(600), unique=True, nullable=False, index=True)
    seo_meta: Mapped[dict | None] = mapped_column(JSON, default=dict)

    # Status
    status: Mapped[str] = mapped_column(
        SAEnum(ProductStatus, values_callable=lambda x: [e.value for e in x]),
        default=ProductStatus.DRAFT,
        nullable=False,
        index=True,
    )

    # Metrics
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    enquiry_count: Mapped[int] = mapped_column(Integer, default=0)

    # Embedding reference (FAISS index key)
    embedding_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    artisan = relationship("Artisan", back_populates="products")
    transactions = relationship("TransactionEnquiry", back_populates="product", cascade="all, delete-orphan")
