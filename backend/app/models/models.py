from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text,
    Enum, ForeignKey, Date, Time
)
from sqlalchemy.orm import relationship
from app.database import Base


class RegisterNumber(Base):
    __tablename__ = "register_numbers"

    id = Column(Integer, primary_key=True, index=True)
    register_number = Column(String(20), unique=True, nullable=False, index=True)
    target_role = Column(String(20), default="student", nullable=False)
    is_used = Column(Boolean, default=False)
    added_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    register_number = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=True)
    batch = Column(String(10), nullable=True)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(30), default="student", nullable=False)
    avatar_color = Column(String(10), default="#3B82F6")
    is_active = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    opportunities = relationship("Opportunity", back_populates="poster", foreign_keys="Opportunity.posted_by")
    views = relationship("OpportunityView", back_populates="user")
    application_statuses = relationship("ApplicationStatus", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    saved_opportunities = relationship("SavedOpportunity", back_populates="user")
    announcements = relationship("Announcement", back_populates="creator")
    chat_messages = relationship("ChatMessage", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    company = Column(String(100), nullable=True)
    application_link = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    batch_filter = Column(String(100), nullable=True)
    deadline = Column(DateTime, nullable=True)
    posted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(
        Enum("active", "pending", "archived", "expired", name="opportunity_status_enum"),
        default="active",
        nullable=False
    )
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    poster = relationship("User", back_populates="opportunities", foreign_keys=[posted_by])
    views = relationship("OpportunityView", back_populates="opportunity", cascade="all, delete-orphan")
    application_statuses = relationship("ApplicationStatus", back_populates="opportunity", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="opportunity", cascade="all, delete-orphan")
    saved_by = relationship("SavedOpportunity", back_populates="opportunity", cascade="all, delete-orphan")


class OpportunityView(Base):
    __tablename__ = "opportunity_views"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    viewed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    opportunity = relationship("Opportunity", back_populates="views")
    user = relationship("User", back_populates="views")


class ApplicationStatus(Base):
    __tablename__ = "application_statuses"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(
        String(30),
        nullable=False
    )
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    opportunity = relationship("Opportunity", back_populates="application_statuses")
    user = relationship("User", back_populates="application_statuses")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    opportunity = relationship("Opportunity", back_populates="comments")
    user = relationship("User", back_populates="comments")
    replies = relationship("Comment", backref="parent", remote_side="Comment.id")


class SavedOpportunity(Base):
    __tablename__ = "saved_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    opportunity = relationship("Opportunity", back_populates="saved_by")
    user = relationship("User", back_populates="saved_opportunities")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    event_date = Column(Date, nullable=True)
    event_time = Column(Time, nullable=True)
    event_location = Column(String(200), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_pinned = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="announcements")


class ChatChannel(Base):
    __tablename__ = "chat_channels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    messages = relationship("ChatMessage", back_populates="channel", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(Integer, ForeignKey("chat_channels.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    file_url = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_type = Column(String(50), nullable=True)
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    channel = relationship("ChatChannel", back_populates="messages")
    user = relationship("User", back_populates="chat_messages")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(
        Enum("new_opportunity", "announcement", "comment_reply", "deadline", "approval", "general", name="notification_type_enum"),
        nullable=False
    )
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    reference_id = Column(Integer, nullable=True)  # opportunity_id or announcement_id
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")


class DirectMessage(Base):
    __tablename__ = "direct_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    file_url = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_type = Column(String(50), nullable=True)
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

