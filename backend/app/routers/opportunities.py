from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app.config import settings
from app.models.models import (
    Opportunity, OpportunityView, ApplicationStatus,
    SavedOpportunity, Comment, User, Notification
)
from app.schemas.schemas import (
    OpportunityCreate, OpportunityUpdate, OpportunityOut,
    OpportunityListOut, ApplicationStatusPoll
)
from app.utils.auth import get_current_user, require_faculty_or_super_admin
from app.services.notification_service import notify_all_students_new_opportunity

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])


def _build_opportunity_out(
    opp: Opportunity,
    current_user: User,
    view_count: int = 0,
    comment_count: int = 0,
    is_saved: bool = False,
    is_viewed: bool = False,
    statuses: list = None,
) -> OpportunityOut:
    statuses = statuses or []
    poll = ApplicationStatusPoll(
        interested=sum(1 for s in statuses if s.status in ("interested", "planning", "applied")),
        not_interested=sum(1 for s in statuses if s.status == "not_interested"),
        applied=sum(1 for s in statuses if s.status == "applied"),
        planning=sum(1 for s in statuses if s.status == "planning"),
        not_eligible=sum(1 for s in statuses if s.status == "not_eligible"),
        total=len(statuses),
    )
    my_status = next((s.status for s in statuses if s.user_id == current_user.id), None)
    poll.my_status = my_status

    return OpportunityOut(
        id=opp.id,
        title=opp.title,
        company=opp.company,
        application_link=opp.application_link,
        description=opp.description,
        batch_filter=opp.batch_filter,
        deadline=opp.deadline,
        posted_by=opp.posted_by,
        poster_name=opp.poster.name if opp.poster else "Placement Cell",
        poster_role=opp.poster.role if opp.poster else "faculty",
        status=opp.status,
        is_pinned=opp.is_pinned,
        view_count=view_count,
        comment_count=comment_count,
        is_saved=is_saved,
        is_viewed=is_viewed,
        poll=poll,
        created_at=opp.created_at,
        updated_at=opp.updated_at,
    )


def _get_single_opportunity_out(opp: Opportunity, db: Session, current_user: User) -> OpportunityOut:
    view_count = db.query(func.count(OpportunityView.id)).filter(
        OpportunityView.opportunity_id == opp.id
    ).scalar() or 0

    comment_count = db.query(func.count(Comment.id)).filter(
        Comment.opportunity_id == opp.id, Comment.parent_id == None
    ).scalar() or 0

    is_saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.opportunity_id == opp.id,
        SavedOpportunity.user_id == current_user.id
    ).first() is not None

    is_viewed = db.query(OpportunityView).filter(
        OpportunityView.opportunity_id == opp.id,
        OpportunityView.user_id == current_user.id
    ).first() is not None

    statuses = db.query(ApplicationStatus).filter(
        ApplicationStatus.opportunity_id == opp.id
    ).all()

    return _build_opportunity_out(
        opp=opp,
        current_user=current_user,
        view_count=view_count,
        comment_count=comment_count,
        is_saved=is_saved,
        is_viewed=is_viewed,
        statuses=statuses,
    )


@router.get("/", response_model=OpportunityListOut)
def list_opportunities(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query("active"),
    company: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Opportunity)

    # Super admin and faculty can filter status if specified; students see active
    if current_user.role not in ("super_admin", "faculty"):
        query = query.filter(Opportunity.status == "active")
    elif status:
        query = query.filter(Opportunity.status == status)

    if search:
        like = f"%{search}%"
        query = query.filter(
            (Opportunity.title.ilike(like)) |
            (Opportunity.company.ilike(like)) |
            (Opportunity.description.ilike(like))
        )
    if company:
        query = query.filter(Opportunity.company.ilike(f"%{company}%"))

    total = query.count()
    opps = (
        query.order_by(desc(Opportunity.is_pinned), desc(Opportunity.created_at))
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    if not opps:
        return OpportunityListOut(items=[], total=total, page=page, per_page=per_page)

    opp_ids = [o.id for o in opps]

    # Batch Query 1: View Counts per Opportunity
    view_counts = dict(
        db.query(OpportunityView.opportunity_id, func.count(OpportunityView.id))
        .filter(OpportunityView.opportunity_id.in_(opp_ids))
        .group_by(OpportunityView.opportunity_id)
        .all()
    )

    # Batch Query 2: Comment Counts per Opportunity
    comment_counts = dict(
        db.query(Comment.opportunity_id, func.count(Comment.id))
        .filter(Comment.opportunity_id.in_(opp_ids), Comment.parent_id == None)
        .group_by(Comment.opportunity_id)
        .all()
    )

    # Batch Query 3: Saved Opportunity IDs for current user
    saved_ids = {
        s.opportunity_id for s in db.query(SavedOpportunity.opportunity_id)
        .filter(SavedOpportunity.opportunity_id.in_(opp_ids), SavedOpportunity.user_id == current_user.id)
        .all()
    }

    # Batch Query 4: Viewed Opportunity IDs for current user
    viewed_ids = {
        v.opportunity_id for v in db.query(OpportunityView.opportunity_id)
        .filter(OpportunityView.opportunity_id.in_(opp_ids), OpportunityView.user_id == current_user.id)
        .all()
    }

    # Batch Query 5: Application Statuses per Opportunity
    all_statuses = db.query(ApplicationStatus).filter(
        ApplicationStatus.opportunity_id.in_(opp_ids)
    ).all()

    statuses_by_opp = {}
    for st in all_statuses:
        statuses_by_opp.setdefault(st.opportunity_id, []).append(st)

    items = [
        _build_opportunity_out(
            opp=o,
            current_user=current_user,
            view_count=view_counts.get(o.id, 0),
            comment_count=comment_counts.get(o.id, 0),
            is_saved=o.id in saved_ids,
            is_viewed=o.id in viewed_ids,
            statuses=statuses_by_opp.get(o.id, []),
        )
        for o in opps
    ]
    return OpportunityListOut(items=items, total=total, page=page, per_page=per_page)


@router.post("/", response_model=OpportunityOut, status_code=201)
async def create_opportunity(
    payload: OpportunityCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Posts are published immediately without requiring approval
    opp = Opportunity(
        title=payload.title,
        company=payload.company,
        application_link=str(payload.application_link),
        description=payload.description,
        batch_filter=payload.batch_filter,
        deadline=payload.deadline,
        posted_by=current_user.id,
        status="active",
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)

    background_tasks.add_task(
        notify_all_students_new_opportunity,
        opp.id, current_user.name
    )

    return _get_single_opportunity_out(opp, db, current_user)


@router.get("/{opportunity_id}", response_model=OpportunityOut)
def get_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(404, "Opportunity not found")

    # Mark as viewed
    existing_view = db.query(OpportunityView).filter(
        OpportunityView.opportunity_id == opportunity_id,
        OpportunityView.user_id == current_user.id,
    ).first()
    if not existing_view:
        view = OpportunityView(opportunity_id=opportunity_id, user_id=current_user.id)
        db.add(view)
        db.commit()

    return _get_single_opportunity_out(opp, db, current_user)


@router.patch("/{opportunity_id}", response_model=OpportunityOut)
def update_opportunity(
    opportunity_id: int,
    payload: OpportunityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(404, "Opportunity not found")
    if current_user.role not in ("super_admin", "faculty") and opp.posted_by != current_user.id:
        raise HTTPException(403, "Not authorized to modify this post")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(opp, field, value)
    db.commit()
    db.refresh(opp)
    return _get_single_opportunity_out(opp, db, current_user)


@router.delete("/{opportunity_id}", status_code=204)
def delete_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(404, "Opportunity not found")
    if current_user.role not in ("super_admin", "faculty") and opp.posted_by != current_user.id:
        raise HTTPException(403, "Not authorized to delete this post")
    db.delete(opp)
    db.commit()


@router.post("/{opportunity_id}/approve", response_model=OpportunityOut)
async def approve_opportunity(
    opportunity_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty_or_super_admin),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(404, "Opportunity not found")
    if opp.status != "pending":
        raise HTTPException(400, "Opportunity is not in pending state")
    opp.status = "active"
    db.commit()
    db.refresh(opp)
    background_tasks.add_task(
        notify_all_students_new_opportunity,
        opp.id, opp.poster.name
    )
    return _get_single_opportunity_out(opp, db, current_user)


@router.post("/{opportunity_id}/status")
def set_application_status(
    opportunity_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    valid = {"interested", "not_interested", "applied", "planning", "not_eligible"}
    if status not in valid:
        raise HTTPException(400, f"Status must be one of: {valid}")

    existing = db.query(ApplicationStatus).filter(
        ApplicationStatus.opportunity_id == opportunity_id,
        ApplicationStatus.user_id == current_user.id,
    ).first()

    if existing:
        existing.status = status
    else:
        db.add(ApplicationStatus(
            opportunity_id=opportunity_id,
            user_id=current_user.id,
            status=status,
        ))
    db.commit()
    return {"message": "Status updated", "status": status}


@router.get("/{opportunity_id}/views")
def get_opportunity_views(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(404, "Opportunity not found")

    if current_user.role not in ("super_admin", "faculty") and opp.posted_by != current_user.id:
        raise HTTPException(403, "Not authorized to view post analytics")

    all_students = db.query(User).filter(User.is_active == True, User.role == "student").all()
    viewed_ids = {
        v.user_id for v in db.query(OpportunityView).filter(
            OpportunityView.opportunity_id == opportunity_id
        ).all()
    }

    viewed = [{"id": s.id, "name": s.name, "register_number": s.register_number, "department": s.department, "batch": s.batch}
              for s in all_students if s.id in viewed_ids]
    not_viewed = [{"id": s.id, "name": s.name, "register_number": s.register_number, "email": s.email, "department": s.department, "batch": s.batch}
                  for s in all_students if s.id not in viewed_ids]

    # Application statuses breakdown with student details
    statuses = db.query(ApplicationStatus).filter(
        ApplicationStatus.opportunity_id == opportunity_id
    ).all()
    
    status_map = {s.user_id: s.status for s in statuses}
    
    interested = [{"id": s.id, "name": s.name, "register_number": s.register_number, "department": s.department}
                  for s in all_students if status_map.get(s.id) in ("interested", "planning")]
    applied = [{"id": s.id, "name": s.name, "register_number": s.register_number, "department": s.department}
               for s in all_students if status_map.get(s.id) == "applied"]
    not_interested = [{"id": s.id, "name": s.name, "register_number": s.register_number, "department": s.department}
                      for s in all_students if status_map.get(s.id) == "not_interested"]

    # Generate WhatsApp message
    wa_message = (
        f"📢 *{opp.title}* has been posted on PlacementHub!\n\n"
        f"Please check the portal and update your application status.\n"
        f"🔗 {opp.application_link}"
    )
    import urllib.parse
    wa_link = f"https://wa.me/?text={urllib.parse.quote(wa_message)}"

    return {
        "opportunity_id": opportunity_id,
        "title": opp.title,
        "viewed_count": len(viewed),
        "not_viewed_count": len(not_viewed),
        "total_students": len(all_students),
        "viewed_students": viewed,
        "not_viewed_students": not_viewed,
        "interested_students": interested,
        "applied_students": applied,
        "not_interested_students": not_interested,
        "whatsapp_reminder_link": wa_link,
        "whatsapp_message": wa_message,
    }


@router.post("/{opportunity_id}/send-mail-reminder")
async def send_mail_reminder_to_unread(
    opportunity_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(404, "Opportunity not found")

    if current_user.role not in ("super_admin", "faculty") and opp.posted_by != current_user.id:
        raise HTTPException(403, "Not authorized to send reminders for this post")

    all_students = db.query(User).filter(User.is_active == True, User.role == "student").all()
    viewed_ids = {
        v.user_id for v in db.query(OpportunityView).filter(
            OpportunityView.opportunity_id == opportunity_id
        ).all()
    }

    unread_students = [s for s in all_students if s.id not in viewed_ids]
    if not unread_students:
        return {"message": "All students have already viewed this opportunity!"}

    # Add in-app notifications
    notifications = [
        Notification(
            user_id=student.id,
            title=f"⏰ Reminder: {opp.title}",
            message=f"{current_user.name} sent a reminder to check {opp.title}.",
            type="new_opportunity",
            reference_id=opp.id,
        )
        for student in unread_students
    ]
    db.add_all(notifications)
    db.commit()

    # Send email reminders via background task
    emails = [s.email for s in unread_students if s.email]
    if emails:
        link = f"{settings.FRONTEND_URL}/opportunity/{opp.id}"
        html = build_new_opportunity_email(opp.title, opp.company or "Placement Drive", link, current_user.name)
        background_tasks.add_task(send_email, emails, f"⏰ Reminder: Check {opp.title}", html)

    return {"message": f"Email & portal reminder sent to {len(unread_students)} unread students!"}
