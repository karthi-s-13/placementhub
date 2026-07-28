import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import Opportunity, User, DirectMessage
from app.services.email_service import send_email, build_deadline_reminder_email
from app.services.notification_service import create_notification

logger = logging.getLogger(__name__)

try:
    # pyrefly: ignore [missing-import]
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    # pyrefly: ignore [missing-import]
    from apscheduler.triggers.cron import CronTrigger
    scheduler = AsyncIOScheduler()
    HAS_APSCHEDULER = True
except (ImportError, ModuleNotFoundError):
    scheduler = None
    HAS_APSCHEDULER = False
    logger.warning("APScheduler library not found in Python environment. Scheduled background jobs disabled.")



async def purge_expired_direct_messages():
    """Delete 1-on-1 direct messages older than 24 hours (24-Hour Ephemeral Messaging)."""
    db: Session = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(hours=24)
        deleted = db.query(DirectMessage).filter(DirectMessage.created_at < cutoff).delete(synchronize_session=False)
        if deleted > 0:
            db.commit()
            logger.info(f"Purged {deleted} direct messages older than 24 hours.")
    except Exception as e:
        logger.error(f"Error purging expired direct messages: {e}")
        db.rollback()
    finally:
        db.close()


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
    if not HAS_APSCHEDULER or not scheduler:
        logger.warning("APScheduler library unavailable. Skipping background scheduler startup.")
        return

    # Run every hour to purge direct messages older than 24h
    scheduler.add_job(
        purge_expired_direct_messages,
        CronTrigger(minute=0),
        id="purge_direct_messages",
        replace_existing=True,
    )
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
    logger.info("Scheduler started: purge_direct_messages + archive_expired + deadline_reminders")


def stop_scheduler():
    if HAS_APSCHEDULER and scheduler and getattr(scheduler, "running", False):
        scheduler.shutdown()


