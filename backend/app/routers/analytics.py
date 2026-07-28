from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.database import get_db
from app.models.models import (
    User, Opportunity, OpportunityView,
    ApplicationStatus, Comment
)
from app.utils.auth import require_super_admin
from app.config import settings

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    total_opps = db.query(func.count(Opportunity.id)).scalar() or 0
    active_opps = db.query(func.count(Opportunity.id)).filter(
        Opportunity.status == "active"
    ).scalar() or 0
    pending_posts = db.query(func.count(Opportunity.id)).filter(
        Opportunity.status == "pending"
    ).scalar() or 0
    total_students = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    total_views = db.query(func.count(OpportunityView.id)).scalar() or 0
    total_applied = db.query(func.count(ApplicationStatus.id)).filter(
        ApplicationStatus.status == "applied"
    ).scalar() or 0

    # Most active student (most applications)
    most_active = db.query(
        User.name,
        func.count(ApplicationStatus.id).label("count")
    ).join(ApplicationStatus, User.id == ApplicationStatus.user_id).group_by(User.id).order_by(
        desc("count")
    ).first()

    # Most viewed company
    most_viewed_company = db.query(
        Opportunity.company,
        func.count(OpportunityView.id).label("views")
    ).join(OpportunityView, Opportunity.id == OpportunityView.opportunity_id).filter(
        Opportunity.company != None
    ).group_by(Opportunity.company).order_by(desc("views")).first()

    # Weekly digest (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly = db.query(Opportunity).filter(Opportunity.created_at >= week_ago, Opportunity.status == "active").all()

    # Categorize by title keywords (simple heuristic)
    def categorize(opp: Opportunity) -> str:
        t = (opp.title + " " + (opp.description or "")).lower()
        if any(x in t for x in ["intern", "internship"]):
            return "internships"
        if any(x in t for x in ["full-time", "fulltime", "fte", "placement"]):
            return "fulltime"
        if any(x in t for x in ["hackathon", "hack"]):
            return "hackathons"
        if any(x in t for x in ["workshop", "webinar", "seminar"]):
            return "workshops"
        return "other"

    weekly_digest = {"internships": 0, "fulltime": 0, "hackathons": 0, "workshops": 0, "other": 0}
    for opp in weekly:
        cat = categorize(opp)
        weekly_digest[cat] += 1

    return {
        "total_opportunities": total_opps,
        "active_opportunities": active_opps,
        "total_students": total_students,
        "batch_size": settings.BATCH_SIZE,
        "total_views": total_views,
        "total_applied": total_applied,
        "pending_posts": pending_posts,
        "most_active_student": most_active[0] if most_active else None,
        "most_viewed_company": most_viewed_company[0] if most_viewed_company else None,
        "weekly_digest": weekly_digest,
    }


@router.get("/opportunities/{opportunity_id}")
def get_opportunity_analytics(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        from fastapi import HTTPException
        raise HTTPException(404, "Opportunity not found")

    all_students = db.query(User).filter(User.is_active == True).all()
    viewed_ids = {
        v.user_id for v in db.query(OpportunityView).filter(
            OpportunityView.opportunity_id == opportunity_id
        ).all()
    }
    statuses = db.query(ApplicationStatus).filter(
        ApplicationStatus.opportunity_id == opportunity_id
    ).all()

    poll = {
        "applied": sum(1 for s in statuses if s.status == "applied"),
        "planning": sum(1 for s in statuses if s.status == "planning"),
        "not_eligible": sum(1 for s in statuses if s.status == "not_eligible"),
        "not_interested": sum(1 for s in statuses if s.status == "not_interested"),
        "total": len(statuses),
    }

    return {
        "opportunity_id": opportunity_id,
        "title": opp.title,
        "company": opp.company,
        "view_count": len(viewed_ids),
        "not_viewed_count": len(all_students) - len(viewed_ids),
        "total_students": len(all_students),
        "viewed_students": [
            {"id": s.id, "name": s.name, "register_number": s.register_number}
            for s in all_students if s.id in viewed_ids
        ],
        "not_viewed_students": [
            {"id": s.id, "name": s.name, "register_number": s.register_number, "email": s.email}
            for s in all_students if s.id not in viewed_ids
        ],
        "poll": poll,
    }
