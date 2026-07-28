from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Comment, Opportunity, User
from app.schemas.schemas import CommentCreate, CommentOut
from app.utils.auth import get_current_user
from app.services.notification_service import notify_comment_reply
from typing import List

router = APIRouter(prefix="/api/opportunities/{opportunity_id}/comments", tags=["comments"])


def _build_comment_out(c: Comment) -> CommentOut:
    return CommentOut(
        id=c.id,
        opportunity_id=c.opportunity_id,
        user_id=c.user_id,
        user_name=c.user.name,
        user_avatar_color=c.user.avatar_color,
        content=c.content,
        parent_id=c.parent_id,
        replies=[_build_comment_out(r) for r in (c.replies or [])],
        created_at=c.created_at,
    )


@router.get("/", response_model=List[CommentOut])
def get_comments(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(404, "Opportunity not found")

    top_level = db.query(Comment).filter(
        Comment.opportunity_id == opportunity_id,
        Comment.parent_id == None,
    ).order_by(Comment.created_at).all()

    return [_build_comment_out(c) for c in top_level]


@router.post("/", response_model=CommentOut, status_code=201)
async def add_comment(
    opportunity_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(404, "Opportunity not found")

    # Validate parent exists if this is a reply
    parent_user_id = None
    if payload.parent_id:
        parent = db.query(Comment).filter(Comment.id == payload.parent_id).first()
        if not parent:
            raise HTTPException(404, "Parent comment not found")
        parent_user_id = parent.user_id

    comment = Comment(
        opportunity_id=opportunity_id,
        user_id=current_user.id,
        content=payload.content,
        parent_id=payload.parent_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Notify the original commenter if this is a reply
    if parent_user_id and parent_user_id != current_user.id:
        await notify_comment_reply(
            opportunity_id=opp.id,
            replying_user_name=current_user.name,
            original_user_id=parent_user_id,
            comment_content=payload.content,
        )

    return _build_comment_out(comment)


@router.delete("/{comment_id}", status_code=204)
def delete_comment(
    opportunity_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.opportunity_id == opportunity_id,
    ).first()
    if not comment:
        raise HTTPException(404, "Comment not found")
    if current_user.role not in ("super_admin", "faculty") and comment.user_id != current_user.id:
        raise HTTPException(403, "Not authorized to delete this comment")
    db.delete(comment)
    db.commit()
