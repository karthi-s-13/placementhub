from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Announcement, User
from app.schemas.schemas import AnnouncementCreate, AnnouncementOut
from app.utils.auth import get_current_user, require_faculty_or_super_admin
from app.services.notification_service import notify_all_students_announcement

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


def _build_out(ann: Announcement) -> AnnouncementOut:
    return AnnouncementOut(
        id=ann.id,
        title=ann.title,
        content=ann.content,
        event_date=ann.event_date,
        event_time=ann.event_time,
        event_location=ann.event_location,
        created_by=ann.created_by,
        creator_name=ann.creator.name,
        is_pinned=ann.is_pinned,
        created_at=ann.created_at,
    )


@router.get("/", response_model=List[AnnouncementOut])
def list_announcements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    announcements = db.query(Announcement).order_by(
        Announcement.is_pinned.desc(),
        Announcement.created_at.desc(),
    ).all()
    return [_build_out(a) for a in announcements]


@router.post("/", response_model=AnnouncementOut, status_code=201)
async def create_announcement(
    payload: AnnouncementCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty_or_super_admin),
):
    ann = Announcement(
        title=payload.title,
        content=payload.content,
        event_date=payload.event_date,
        event_time=payload.event_time,
        event_location=payload.event_location,
        created_by=current_user.id,
        is_pinned=payload.is_pinned,
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)

    background_tasks.add_task(
        notify_all_students_announcement, ann.id, current_user.name
    )
    return _build_out(ann)


@router.delete("/{announcement_id}", status_code=204)
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(404, "Announcement not found")
    if current_user.role not in ("super_admin", "faculty") and ann.created_by != current_user.id:
        raise HTTPException(403, "Not authorized to delete this announcement")
    db.delete(ann)
    db.commit()
