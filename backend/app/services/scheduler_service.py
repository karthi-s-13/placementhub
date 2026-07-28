from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import Opportunity, User
from app.services.email_service import send_email, build_deadline_reminder_email
from app.services.notification_service import create_notification
import logging

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def archive_expired_opportunities():
    """Move past-deadline opportunities to 'expired' status."""
    db: Session = SessionLocal()
    try:
        now = datetime.utcnow()
        expired = db.query(Opportunity).filter(
            Opportunity.deadline < now,
            Opportunity.status == "active"
        ).all()
        for opp in expired:
            opp.status = "expired"
            logger.info(f"Archived expired opportunity: {opp.title}")
        db.commit()
    except Exception as e:
        logger.error(f"Error archiving opportunities: {e}")
        db.rollback()
    finally:
        db.close()


async def send_deadline_reminders():
    """Send reminders for opportunities expiring in the next 24 hours."""
    db: Session = SessionLocal()
    try:
        now = datetime.utcnow()
        tomorrow = now + timedelta(hours=24)
        expiring = db.query(Opportunity).filter(
            Opportunity.deadline >= now,
            Opportunity.deadline <= tomorrow,
            Opportunity.status == "active"
        ).all()

        students = db.query(User).filter(User.is_active == True).all()

        for opp in expiring:
            for student in students:
                create_notification(
                    db=db,
                    user_id=student.id,
                    type="deadline",
                    title=f"⏰ Deadline Tomorrow: {opp.title}",
                    message=f"The application deadline for {opp.title} is approaching!",
                    reference_id=opp.id,
                )

            email_students = [s for s in students if s.email_notifications]
            if email_students:
                emails = [s.email for s in email_students]
                html = build_deadline_reminder_email(
                    opp.title,
                    opp.company or "",
                    opp.deadline.strftime("%d %B %Y, %I:%M %p"),
                    opp.application_link,
                )
                await send_email(
                    emails,
                    f"⏰ Deadline Tomorrow: {opp.title} — PlacementHub",
                    html,
                )
        db.commit()
    except Exception as e:
        logger.error(f"Error sending deadline reminders: {e}")
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    # Run every day at midnight to archive expired posts
    scheduler.add_job(
        archive_expired_opportunities,
        CronTrigger(hour=0, minute=0),
        id="archive_expired",
        replace_existing=True,
    )
    # Run every day at 9 AM to send deadline reminders
    scheduler.add_job(
        send_deadline_reminders,
        CronTrigger(hour=9, minute=0),
        id="deadline_reminders",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started: archive_expired + deadline_reminders")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
