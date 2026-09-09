"""
Transaction / Enquiry schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class EnquiryCreate(BaseModel):
    product_id: Optional[str] = None
    message: str = Field(min_length=1, max_length=2000)
    type: str = Field(default="enquiry", pattern="^(enquiry|order)$")


class EnquiryResponse(BaseModel):
    id: str
    product_id: str
    product_title: Optional[str] = None
    buyer_id: int
    buyer_name: Optional[str] = None
    type: str
    status: str
    message: Optional[str] = None
    response_message: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class EnquiryReply(BaseModel):
    response_message: str = Field(min_length=1, max_length=2000)
    status: str = Field(default="responded", pattern="^(responded|accepted|rejected)$")


class EnquiryListResponse(BaseModel):
    enquiries: list[EnquiryResponse]
    total: int
