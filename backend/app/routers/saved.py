from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import SavedOpportunity, Opportunity, User
from app.utils.auth import get_current_user
from app.routers.opportunities import _build_opportunity_out

router = APIRouter(prefix="/api/saved", tags=["saved"])


@router.get("/")
def get_saved_opportunities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.user_id == current_user.id
    ).order_by(SavedOpportunity.saved_at.desc()).all()

    result = []
    for s in saved:
        opp = db.query(Opportunity).filter(Opportunity.id == s.opportunity_id).first()
        if opp:
            result.append(_build_opportunity_out(opp, db, current_user))

    return {"items": result, "total": len(result)}


@router.post("/{opportunity_id}", status_code=201)
def save_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(404, "Opportunity not found")

    existing = db.query(SavedOpportunity).filter(
        SavedOpportunity.opportunity_id == opportunity_id,
        SavedOpportunity.user_id == current_user.id,
    ).first()
    if existing:
        return {"message": "Already saved"}

    db.add(SavedOpportunity(opportunity_id=opportunity_id, user_id=current_user.id))
    db.commit()
    return {"message": "Saved successfully"}


@router.delete("/{opportunity_id}", status_code=204)
def unsave_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.opportunity_id == opportunity_id,
        SavedOpportunity.user_id == current_user.id,
    ).first()
    if saved:
        db.delete(saved)
        db.commit()
    return Response(status_code=204)
