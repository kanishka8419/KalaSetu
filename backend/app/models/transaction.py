"""Transaction / Enquiry model — buyer-artisan interactions."""

import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class TransactionType(str, enum.Enum):
    ENQUIRY = "enquiry"
    ORDER = "order"


class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    RESPONDED = "responded"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"


class TransactionEnquiry(Base):
    __tablename__ = "transactions_enquiries"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    product_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    buyer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("buyers.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(
        SAEnum(TransactionType, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        SAEnum(TransactionStatus, values_callable=lambda x: [e.value for e in x]),
        default=TransactionStatus.PENDING,
        nullable=False,
    )
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    product = relationship("Product", back_populates="transactions")
    buyer = relationship("Buyer", back_populates="transactions")
