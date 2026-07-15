import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class RSVP(Base):
    __tablename__ = "rsvps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    username = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
