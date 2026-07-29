# pyrefly: ignore [missing-import]
import resend
from typing import List
import logging
from app.config import settings

logger = logging.getLogger(__name__)


async def send_email(to_emails: List[str], subject: str, html_body: str):
    """Send an HTML email via Resend (HTTPS-based, works on Render free tier)."""
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured. Skipping email.")
        return

    resend.api_key = settings.RESEND_API_KEY

    try:
        params: resend.Emails.SendParams = {
            "from": settings.EMAIL_FROM,
            "to": to_emails,
            "subject": subject,
            "html": html_body,
        }
        response = resend.Emails.send(params)
        logger.info(f"Email sent to {len(to_emails)} recipients: {subject} (id={response.get('id')})")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")


def build_new_opportunity_email(opportunity_title: str, company: str, link: str, poster: str) -> str:
    return f"""
    <html><body style="font-family: Arial, sans-serif; background: #f0f4ff; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">🎯 New Opportunity Posted!</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1e3a8a; margin-top: 0;">{opportunity_title}</h2>
          <p style="color: #64748b;">Posted by <strong>{poster}</strong></p>
          {"<p style='display:inline-block; background:#eff6ff; color:#2563eb; padding:4px 12px; border-radius:20px; font-weight:600;'>🏢 " + company + "</p>" if company else ""}
          <div style="margin: 24px 0;">
            <a href="{link}" style="background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Apply Now →
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 13px;">
            Visit <a href="{settings.FRONTEND_URL}" style="color: #2563eb;">{settings.APP_NAME}</a> to view all opportunities, track your applications, and chat with classmates.
          </p>
        </div>
      </div>
    </body></html>
    """


def build_announcement_email(title: str, content: str, event_date: str, location: str) -> str:
    event_info = ""
    if event_date:
        event_info = f"<p style='background:#eff6ff; padding:12px; border-radius:8px; color:#1e40af;'>📅 <strong>{event_date}</strong>"
        if location:
            event_info += f" &nbsp;|&nbsp; 📍 {location}"
        event_info += "</p>"

    return f"""
    <html><body style="font-family: Arial, sans-serif; background: #f0f4ff; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">📢 Announcement</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1e3a8a; margin-top: 0;">{title}</h2>
          {event_info}
          <p style="color: #374151; line-height: 1.6;">{content}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 13px;">
            Visit <a href="{settings.FRONTEND_URL}" style="color: #2563eb;">{settings.APP_NAME}</a> for more details.
          </p>
        </div>
      </div>
    </body></html>
    """


def build_deadline_reminder_email(opportunity_title: str, company: str, deadline: str, link: str) -> str:
    return f"""
    <html><body style="font-family: Arial, sans-serif; background: #f0f4ff; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">⏰ Application Deadline Tomorrow!</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1e3a8a; margin-top: 0;">{opportunity_title}</h2>
          {"<p style='display:inline-block; background:#fef2f2; color:#dc2626; padding:4px 12px; border-radius:20px; font-weight:600;'>🏢 " + company + "</p>" if company else ""}
          <p style="color: #64748b;">Deadline: <strong style="color: #dc2626;">{deadline}</strong></p>
          <div style="margin: 24px 0;">
            <a href="{link}" style="background: #dc2626; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Apply Before It's Too Late →
            </a>
          </div>
        </div>
      </div>
    </body></html>
    """
