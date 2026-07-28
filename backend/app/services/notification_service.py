from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import Notification, User, Opportunity, Announcement
from app.services.email_service import (
    send_email,
    build_new_opportunity_email,
    build_announcement_email,
    build_deadline_reminder_email,
)
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


async def notify_all_students_new_opportunity(
    opportunity_id: int,
    poster_name: str,
):
    """Create in-app notifications and send emails for all students when a new opportunity is posted."""
    db: Session = SessionLocal()
    try:
        opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
        if not opp:
            return

        students = db.query(User).filter(
            User.is_active == True,
            User.id != opp.posted_by
        ).all()

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

        # Send emails to students who opted in
        email_students = [s for s in students if s.email_notifications]
        if email_students:
            emails = [s.email for s in email_students]
            html = build_new_opportunity_email(
                opp.title,
                opp.company or "",
                opp.application_link,
                poster_name,
            )
            await send_email(emails, f"[New Placement Drive] {opp.company or 'New'} – {opp.title}", html)
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

        email_students = [s for s in students if s.email_notifications]
        if email_students:
            emails = [s.email for s in email_students]
            html = build_announcement_email(
                ann.title,
                ann.content,
                str(ann.event_date) if ann.event_date else "",
                ann.event_location or "",
            )
            await send_email(emails, f"[Placement Update] {ann.title} — PlacementHub", html)
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
    except Exception as e:
        logger.error(f"Error in notify_comment_reply: {e}")
        db.rollback()
    finally:
        db.close()
