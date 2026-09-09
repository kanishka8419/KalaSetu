"""Buyer profile — extends User for marketplace shoppers."""

from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Buyer(Base):
    __tablename__ = "buyers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    shipping_address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    wishlist: Mapped[dict | None] = mapped_column(JSON, default=list)
    saved_searches: Mapped[dict | None] = mapped_column(JSON, default=list)

    # Relationships
    user = relationship("User", back_populates="buyer_profile")
    transactions = relationship("TransactionEnquiry", back_populates="buyer", cascade="all, delete-orphan")
