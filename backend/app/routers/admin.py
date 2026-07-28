import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.models import (
    User, RegisterNumber, Opportunity,
    ApplicationStatus, SavedOpportunity
)
from app.schemas.schemas import RegisterNumberCreate, StudentListOut
from app.utils.auth import require_super_admin
from app.config import settings

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/register-numbers", status_code=201)
def add_register_numbers(
    payload: RegisterNumberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    added = 0
    skipped = 0
    target = payload.target_role or "student"
    for rn in payload.register_numbers:
        if not re.match(settings.REGISTER_NUMBER_REGEX, rn):
            skipped += 1
            continue
        existing = db.query(RegisterNumber).filter(
            RegisterNumber.register_number == rn
        ).first()
        if existing:
            skipped += 1
            continue
        db.add(RegisterNumber(register_number=rn, target_role=target, added_by=current_user.id))
        added += 1
    db.commit()
    return {"added": added, "skipped": skipped, "total": added + skipped, "target_role": target}


@router.get("/register-numbers")
def list_register_numbers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    numbers = db.query(RegisterNumber).order_by(RegisterNumber.created_at.desc()).all()
    return [
        {
            "id": rn.id,
            "register_number": rn.register_number,
            "target_role": getattr(rn, "target_role", "student"),
            "is_used": rn.is_used,
            "created_at": rn.created_at,
        }
        for rn in numbers
    ]


@router.delete("/register-numbers/{rn_id}", status_code=204)
def delete_register_number(
    rn_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    rn = db.query(RegisterNumber).filter(RegisterNumber.id == rn_id).first()
    if not rn:
        raise HTTPException(404, "Register number not found")
    db.delete(rn)
    db.commit()


@router.get("/students", response_model=List[StudentListOut])
def list_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    users = db.query(User).order_by(User.name).all()
    if not users:
        return []

    user_ids = [u.id for u in users]

    apps_counts = dict(
        db.query(ApplicationStatus.user_id, func.count(ApplicationStatus.id))
        .filter(ApplicationStatus.user_id.in_(user_ids))
        .group_by(ApplicationStatus.user_id)
        .all()
    )

    saved_counts = dict(
        db.query(SavedOpportunity.user_id, func.count(SavedOpportunity.id))
        .filter(SavedOpportunity.user_id.in_(user_ids))
        .group_by(SavedOpportunity.user_id)
        .all()
    )

    posts_counts = dict(
        db.query(Opportunity.posted_by, func.count(Opportunity.id))
        .filter(Opportunity.posted_by.in_(user_ids))
        .group_by(Opportunity.posted_by)
        .all()
    )

    return [
        StudentListOut(
            id=s.id,
            name=s.name,
            email=s.email,
            register_number=s.register_number,
            department=s.department,
            batch=s.batch,
            role=s.role,
            applications_count=apps_counts.get(s.id, 0),
            saved_count=saved_counts.get(s.id, 0),
            posts_count=posts_counts.get(s.id, 0),
            created_at=s.created_at,
        )
        for s in users
    ]


@router.patch("/students/{user_id}/role")
def change_student_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    if role not in ("student", "faculty", "super_admin"):
        raise HTTPException(400, "Role must be 'student', 'faculty', or 'super_admin'")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.role = role
    db.commit()
    return {"message": f"Role updated to {role}", "user_id": user_id}


@router.delete("/students/{user_id}", status_code=204)
def deactivate_student(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = False
    db.commit()

