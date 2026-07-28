from datetime import datetime, date, time
from typing import Optional, List
from pydantic import BaseModel, EmailStr, validator, field_serializer
import re


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    register_number: str
    name: str
    email: EmailStr
    department: Optional[str] = None
    batch: Optional[str] = None
    password: str

    @validator("register_number")
    def validate_register_number(cls, v):
        if not re.match(r"^[a-zA-Z0-9-]{3,20}$", v):
            raise ValueError("Register number must be 3-20 alphanumeric characters")
        return v

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


# ─── User Schemas ─────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    register_number: str
    department: Optional[str]
    batch: Optional[str]
    role: str
    avatar_color: str
    email_notifications: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[str] = None
    avatar_color: Optional[str] = None
    email_notifications: Optional[bool] = None


# ─── Opportunity Schemas ───────────────────────────────────────────────────────

class OpportunityCreate(BaseModel):
    title: str
    company: Optional[str] = None
    application_link: str
    description: Optional[str] = None
    batch_filter: Optional[str] = None
    deadline: Optional[datetime] = None


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    application_link: Optional[str] = None
    description: Optional[str] = None
    batch_filter: Optional[str] = None
    deadline: Optional[datetime] = None
    is_pinned: Optional[bool] = None
    status: Optional[str] = None


class ApplicationStatusPoll(BaseModel):
    interested: int = 0
    not_interested: int = 0
    applied: int = 0
    planning: int = 0
    not_eligible: int = 0
    total: int = 0
    my_status: Optional[str] = None


class OpportunityOut(BaseModel):
    id: int
    title: str
    company: Optional[str]
    application_link: str
    description: Optional[str]
    batch_filter: Optional[str]
    deadline: Optional[datetime]
    posted_by: int
    poster_name: str
    poster_role: str
    status: str
    is_pinned: bool
    view_count: int
    comment_count: int
    is_saved: bool
    is_viewed: bool
    poll: ApplicationStatusPoll
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OpportunityListOut(BaseModel):
    items: List[OpportunityOut]
    total: int
    page: int
    per_page: int


# ─── Application Status Schemas ────────────────────────────────────────────────

class ApplicationStatusRequest(BaseModel):
    status: str

    @validator("status")
    def validate_status(cls, v):
        valid = {"applied", "planning", "not_eligible", "not_interested"}
        if v not in valid:
            raise ValueError(f"Status must be one of: {valid}")
        return v


# ─── Comment Schemas ───────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None


class CommentOut(BaseModel):
    id: int
    opportunity_id: int
    user_id: int
    user_name: str
    user_avatar_color: str
    content: str
    parent_id: Optional[int]
    replies: List["CommentOut"] = []
    created_at: datetime

    class Config:
        from_attributes = True


CommentOut.model_rebuild()


# ─── Announcement Schemas ──────────────────────────────────────────────────────

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    event_date: Optional[date] = None
    event_time: Optional[time] = None
    event_location: Optional[str] = None
    is_pinned: bool = True


class AnnouncementOut(BaseModel):
    id: int
    title: str
    content: str
    event_date: Optional[date]
    event_time: Optional[time]
    event_location: Optional[str]
    created_by: int
    creator_name: str
    is_pinned: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Chat Schemas ──────────────────────────────────────────────────────────────

class ChatChannelOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    message_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    content: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None


class ChatMessageOut(BaseModel):
    id: int
    channel_id: int
    user_id: int
    user_name: str
    user_avatar_color: Optional[str] = "#0F2B5C"
    content: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    is_edited: bool = False
    is_deleted: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageHistory(BaseModel):
    items: List[ChatMessageOut]
    total: int
    channel: ChatChannelOut


# ─── Notification Schemas ──────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: int
    type: str
    title: str
    message: str
    reference_id: Optional[int]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Admin & Chat Schemas ─────────────────────────────────────────────────────────

class RegisterNumberCreate(BaseModel):
    register_numbers: List[str]
    target_role: Optional[str] = "student"

    @validator("register_numbers", each_item=True)
    def validate_each(cls, v):
        if not re.match(r"^[a-zA-Z0-9-]{3,20}$", v):
            raise ValueError(f"'{v}' is not a valid register number (must be 3-20 alphanumeric characters)")
        return v

    @validator("target_role")
    def validate_target_role(cls, v):
        if v not in ("student", "faculty"):
            raise ValueError("target_role must be 'student' or 'faculty'")
        return v


class DirectMessageCreate(BaseModel):
    content: str
    receiver_id: Optional[int] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None


class DirectMessageOut(BaseModel):
    id: int
    sender_id: int
    sender_name: str
    receiver_id: int
    receiver_name: str
    content: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    is_edited: bool = False
    is_deleted: bool = False
    is_read: bool
    created_at: datetime

    @field_serializer('created_at')
    def serialize_created_at(self, dt: datetime) -> str:
        if dt is None:
            return None
        iso = dt.isoformat()
        return iso + "Z" if not iso.endswith("Z") else iso

    class Config:
        from_attributes = True


class ChatUserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: Optional[str] = None
    avatar_color: str
    unread_count: int = 0


class AnalyticsOverview(BaseModel):
    total_opportunities: int
    active_opportunities: int
    total_students: int
    total_views: int
    total_applied: int
    pending_posts: int
    most_active_student: Optional[str]
    most_viewed_company: Optional[str]
    weekly_digest: dict


class OpportunityAnalytics(BaseModel):
    opportunity_id: int
    title: str
    company: Optional[str]
    view_count: int
    not_viewed_count: int
    viewed_students: List[dict]
    not_viewed_students: List[dict]
    poll: ApplicationStatusPoll


class StudentListOut(BaseModel):
    id: int
    name: str
    email: str
    register_number: str
    department: Optional[str]
    batch: Optional[str]
    role: str
    applications_count: int
    saved_count: int
    posts_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# Allow TokenResponse to reference UserOut
TokenResponse.model_rebuild()
