from sqlalchemy.orm import Session
from app.models.models import Notification, User, Opportunity
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
    db: Session,
    opportunity: Opportunity,
    poster_name: str,
):
    """Create in-app notifications and send emails for all students when a new opportunity is posted."""
    students = db.query(User).filter(
        User.is_active == True,
        User.id != opportunity.posted_by
    ).all()

    for student in students:
        create_notification(
            db=db,
            user_id=student.id,
            type="new_opportunity",
            title=f"New: {opportunity.title}",
            message=f"{poster_name} posted a new opportunity{'from ' + opportunity.company if opportunity.company else ''}.",
            reference_id=opportunity.id,
        )

    # Send emails to students who opted in
    email_students = [s for s in students if s.email_notifications]
    if email_students:
        emails = [s.email for s in email_students]
        html = build_new_opportunity_email(
            opportunity.title,
            opportunity.company or "",
            opportunity.application_link,
            poster_name,
        )
        await send_email(emails, f"[{opportunity.company or 'New'}] {opportunity.title} — PlacementHub", html)


async def notify_all_students_announcement(
    db: Session,
    announcement,
    creator_name: str,
):
    """Notify all students about a new announcement."""
    students = db.query(User).filter(
        User.is_active == True,
        User.id != announcement.created_by
    ).all()

    for student in students:
        create_notification(
            db=db,
            user_id=student.id,
            type="announcement",
            title=f"📢 {announcement.title}",
            message=announcement.content[:100] + ("..." if len(announcement.content) > 100 else ""),
            reference_id=announcement.id,
        )

    email_students = [s for s in students if s.email_notifications]
    if email_students:
        emails = [s.email for s in email_students]
        html = build_announcement_email(
            announcement.title,
            announcement.content,
            str(announcement.event_date) if announcement.event_date else "",
            announcement.event_location or "",
        )
        await send_email(emails, f"[Announcement] {announcement.title} — PlacementHub", html)


async def notify_comment_reply(
    db: Session,
    opportunity: Opportunity,
    replying_user_name: str,
    original_user_id: int,
    comment_content: str,
):
    """Notify the original commenter when someone replies to their comment."""
    create_notification(
        db=db,
        user_id=original_user_id,
        type="comment_reply",
        title=f"{replying_user_name} replied to your comment",
        message=comment_content[:100],
        reference_id=opportunity.id,
    )
