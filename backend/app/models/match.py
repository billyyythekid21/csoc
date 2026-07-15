import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class MatchRecord(Base):
    __tablename__ = "match_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_user_id = Column(String, nullable=False)
    to_user_id = Column(String, nullable=False)
    action = Column(String, nullable=False)  # "like" or "pass"
    created_at = Column(DateTime, default=datetime.utcnow)
