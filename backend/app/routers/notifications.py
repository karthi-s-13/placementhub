from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Notification, User, FCMToken
from app.schemas.schemas import NotificationOut
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


# ─── FCM Token Management ──────────────────────────────────────────────────────

class FCMTokenRequest(BaseModel):
    token: str


@router.post("/fcm-token", status_code=204)
def register_fcm_token(
    body: FCMTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register (or refresh) a browser FCM push token for the current user."""
    existing = db.query(FCMToken).filter(FCMToken.token == body.token).first()
    if existing:
        # Token already registered (possibly for another user — re-assign)
        existing.user_id = current_user.id
        db.commit()
        return

    fcm = FCMToken(user_id=current_user.id, token=body.token)
    db.add(fcm)
    db.commit()


@router.delete("/fcm-token", status_code=204)
def unregister_fcm_token(
    body: FCMTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a browser FCM push token (call on logout)."""
    db.query(FCMToken).filter(
        FCMToken.token == body.token,
        FCMToken.user_id == current_user.id,
    ).delete(synchronize_session=False)
    db.commit()


# ─── In-app Notifications ──────────────────────────────────────────────────────

@router.get("/", response_model=List[NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()
    return notifications


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).count()
    return {"count": count}


@router.patch("/{notification_id}/read", status_code=204)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    if not notif:
        raise HTTPException(404, "Notification not found")
    notif.is_read = True
    db.commit()


@router.patch("/read-all", status_code=204)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()


@router.delete("/clear-all", status_code=204)
def clear_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).delete(synchronize_session=False)
    db.commit()
