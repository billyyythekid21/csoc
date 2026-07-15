import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organizer_id = Column(String, nullable=False)
    organizer_username = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False)
    starts_at = Column(DateTime, nullable=False)
    tags = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
