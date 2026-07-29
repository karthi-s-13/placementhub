from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import Notification, User, Opportunity, Announcement, FCMToken
from app.services.fcm_service import send_fcm_notification
import logging

logger = logging.getLogger(__name__)


def create_notification(
    db: Session,
    user_id: int,
    type: str,
    title: str,
    message: str,
    reference_id: int = None,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        reference_id=reference_id,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def _get_user_fcm_tokens(db: Session, user_ids: list[int]) -> dict[int, list[str]]:
    """Return a dict of {user_id: [token, ...]} for users who have FCM tokens."""
    rows = db.query(FCMToken).filter(FCMToken.user_id.in_(user_ids)).all()
    result: dict[int, list[str]] = {}
    for row in rows:
        result.setdefault(row.user_id, []).append(row.token)
    return result


async def notify_all_students_new_opportunity(
    opportunity_id: int,
    poster_name: str,
):
    """Create in-app notifications and send FCM push for all students when a new opportunity is posted."""
    db: Session = SessionLocal()
    try:
        opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
        if not opp:
            return

        students = db.query(User).filter(
            User.is_active == True,
            User.id != opp.posted_by
        ).all()

        # Bulk-insert in-app notifications
        notifications = [
            Notification(
                user_id=student.id,
                type="new_opportunity",
                title=f"🎯 New Opportunity: {opp.company or opp.title}",
                message=f"{poster_name} posted a new drive for {opp.title}. Check eligibility and application details now.",
                reference_id=opp.id,
            )
            for student in students
        ]
        db.add_all(notifications)
        db.commit()

        # Send FCM push to students who opted in and have a registered token
        opted_in_ids = [s.id for s in students if s.email_notifications]
        if opted_in_ids:
            token_map = _get_user_fcm_tokens(db, opted_in_ids)
            all_tokens = [t for tokens in token_map.values() for t in tokens]
            if all_tokens:
                await send_fcm_notification(
                    tokens=all_tokens,
                    title=f"🎯 New Opportunity: {opp.company or opp.title}",
                    body=f"{poster_name} posted: {opp.title}. Tap to view details.",
                    data={"type": "new_opportunity", "reference_id": str(opp.id)},
                )
    except Exception as e:
        logger.error(f"Error in notify_all_students_new_opportunity: {e}")
        db.rollback()
    finally:
        db.close()


async def notify_all_students_announcement(
    announcement_id: int,
    creator_name: str,
):
    """Notify all students about a new announcement."""
    db: Session = SessionLocal()
    try:
        ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
        if not ann:
            return

        students = db.query(User).filter(
            User.is_active == True,
            User.id != ann.created_by
        ).all()

        preview_text = ann.content[:80] + ("..." if len(ann.content) > 80 else "")
        notifications = [
            Notification(
                user_id=student.id,
                type="announcement",
                title=f"📢 Announcement: {ann.title}",
                message=f"{creator_name} published an update: \"{preview_text}\". Click to view full details.",
                reference_id=ann.id,
            )
            for student in students
        ]
        db.add_all(notifications)
        db.commit()

        opted_in_ids = [s.id for s in students if s.email_notifications]
        if opted_in_ids:
            token_map = _get_user_fcm_tokens(db, opted_in_ids)
            all_tokens = [t for tokens in token_map.values() for t in tokens]
            if all_tokens:
                await send_fcm_notification(
                    tokens=all_tokens,
                    title=f"📢 {ann.title}",
                    body=preview_text,
                    data={"type": "announcement", "reference_id": str(ann.id)},
                )
    except Exception as e:
        logger.error(f"Error in notify_all_students_announcement: {e}")
        db.rollback()
    finally:
        db.close()


async def notify_comment_reply(
    opportunity_id: int,
    replying_user_name: str,
    original_user_id: int,
    comment_content: str,
):
    """Notify the original commenter when someone replies to their comment."""
    db: Session = SessionLocal()
    try:
        create_notification(
            db=db,
            user_id=original_user_id,
            type="comment_reply",
            title=f"{replying_user_name} replied to your comment",
            message=comment_content[:100],
            reference_id=opportunity_id,
        )

        # Also send FCM push for the reply
        token_map = _get_user_fcm_tokens(db, [original_user_id])
        all_tokens = [t for tokens in token_map.values() for t in tokens]
        if all_tokens:
            await send_fcm_notification(
                tokens=all_tokens,
                title=f"💬 {replying_user_name} replied",
                body=comment_content[:100],
                data={"type": "comment_reply", "reference_id": str(opportunity_id)},
            )
    except Exception as e:
        logger.error(f"Error in notify_comment_reply: {e}")
        db.rollback()
    finally:
        db.close()
