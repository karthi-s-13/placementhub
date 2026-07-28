import os
import uuid
import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from app.database import get_db, SessionLocal
from app.models.models import ChatChannel, ChatMessage, DirectMessage, User
from app.schemas.schemas import (
    ChatChannelOut, ChatMessageOut, ChatMessageHistory,
    ChatUserOut, DirectMessageOut, DirectMessageCreate
)
from app.utils.auth import get_current_user, decode_token
from app.websocket.manager import manager

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/upload")
async def upload_chat_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a resume (PDF/Doc) or image screenshot for chat attachments.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = {".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".webp"}
    if ext not in allowed_exts:
        raise HTTPException(400, "Unsupported file format. Allowed: PDF, DOC, DOCX, PNG, JPG, WEBP")

    file_type = "pdf" if ext in {".pdf", ".doc", ".docx"} else "image"
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = os.path.join("uploads", "chat", filename)

    os.makedirs("uploads/chat", exist_ok=True)
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)

    file_url = f"/uploads/chat/{filename}"
    return {
        "file_url": file_url,
        "file_name": file.filename,
        "file_type": file_type,
    }


@router.get("/users", response_model=List[ChatUserOut])
def get_chat_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = db.query(User).filter(
        User.id != current_user.id,
        User.is_active == True
    ).order_by(User.name).all()

    result = []
    for u in users:
        unread = db.query(func.count(DirectMessage.id)).filter(
            DirectMessage.sender_id == u.id,
            DirectMessage.receiver_id == current_user.id,
            DirectMessage.is_read == False,
        ).scalar() or 0

        result.append(ChatUserOut(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            department=u.department,
            avatar_color=u.avatar_color,
            unread_count=unread,
        ))

    return result


@router.get("/messages/{target_user_id}", response_model=List[DirectMessageOut])
async def get_direct_messages(
    target_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = db.query(User).filter(User.id == target_user_id).first()
    if not target:
        raise HTTPException(404, "User not found")

    # Mark incoming messages as read
    updated_count = db.query(DirectMessage).filter(
        DirectMessage.sender_id == target_user_id,
        DirectMessage.receiver_id == current_user.id,
        DirectMessage.is_read == False,
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()

    if updated_count > 0:
        # Broadcast read receipt to sender
        await manager.send_direct_message(target_user_id, {
            "type": "read_receipt",
            "reader_id": current_user.id,
            "sender_id": target_user_id,
        })

    messages = db.query(DirectMessage).filter(
        or_(
            and_(DirectMessage.sender_id == current_user.id, DirectMessage.receiver_id == target_user_id),
            and_(DirectMessage.sender_id == target_user_id, DirectMessage.receiver_id == current_user.id),
        )
    ).order_by(DirectMessage.created_at.asc()).all()

    return [
        DirectMessageOut(
            id=m.id,
            sender_id=m.sender_id,
            sender_name=m.sender.name,
            receiver_id=m.receiver_id,
            receiver_name=m.receiver.name,
            content=m.content,
            file_url=m.file_url,
            file_name=m.file_name,
            file_type=m.file_type,
            is_edited=m.is_edited or False,
            is_deleted=m.is_deleted or False,
            is_read=m.is_read,
            created_at=m.created_at,
        )
        for m in messages
    ]


@router.post("/messages/{target_user_id}", response_model=DirectMessageOut)
async def send_direct_message(
    target_user_id: int,
    payload: DirectMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = db.query(User).filter(User.id == target_user_id).first()
    if not target:
        raise HTTPException(404, "User not found")

    content = (payload.content or "").strip()
    if not content and not payload.file_url:
        raise HTTPException(400, "Message must contain text or a file attachment")

    dm = DirectMessage(
        sender_id=current_user.id,
        receiver_id=target_user_id,
        content=content or (f"📎 Shared attachment: {payload.file_name}" if payload.file_name else "Attachment"),
        file_url=payload.file_url,
        file_name=payload.file_name,
        file_type=payload.file_type,
    )
    db.add(dm)
    db.commit()
    db.refresh(dm)

    out = DirectMessageOut(
        id=dm.id,
        sender_id=current_user.id,
        sender_name=current_user.name,
        receiver_id=target_user_id,
        receiver_name=target.name,
        content=dm.content,
        file_url=dm.file_url,
        file_name=dm.file_name,
        file_type=dm.file_type,
        is_edited=False,
        is_deleted=False,
        is_read=False,
        created_at=dm.created_at,
    )

    # Real-time WebSocket delivery
    msg_dict = {
        "type": "direct_message",
        "id": dm.id,
        "sender_id": current_user.id,
        "sender_name": current_user.name,
        "sender_avatar_color": current_user.avatar_color,
        "receiver_id": target_user_id,
        "content": dm.content,
        "file_url": dm.file_url,
        "file_name": dm.file_name,
        "file_type": dm.file_type,
        "is_edited": False,
        "is_deleted": False,
        "is_read": False,
        "created_at": dm.created_at.isoformat(),
    }
    await manager.send_direct_message(target_user_id, msg_dict)
    await manager.send_direct_message(current_user.id, msg_dict)

    return out


@router.put("/messages/{message_id}", response_model=DirectMessageOut)
async def edit_direct_message(
    message_id: int,
    payload: DirectMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dm = db.query(DirectMessage).filter(DirectMessage.id == message_id).first()
    if not dm:
        raise HTTPException(404, "Message not found")
    if dm.sender_id != current_user.id:
        raise HTTPException(403, "Not authorized to edit this message")

    dm.content = payload.content.strip()
    dm.is_edited = True
    db.commit()
    db.refresh(dm)

    out = DirectMessageOut(
        id=dm.id,
        sender_id=dm.sender_id,
        sender_name=current_user.name,
        receiver_id=dm.receiver_id,
        receiver_name=dm.receiver.name,
        content=dm.content,
        file_url=dm.file_url,
        file_name=dm.file_name,
        file_type=dm.file_type,
        is_edited=True,
        is_deleted=dm.is_deleted,
        is_read=dm.is_read,
        created_at=dm.created_at,
    )

    event = {
        "type": "message_edited",
        "id": dm.id,
        "sender_id": dm.sender_id,
        "receiver_id": dm.receiver_id,
        "content": dm.content,
    }
    await manager.send_direct_message(dm.receiver_id, event)
    await manager.send_direct_message(dm.sender_id, event)

    return out


@router.delete("/messages/{message_id}")
async def delete_direct_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dm = db.query(DirectMessage).filter(DirectMessage.id == message_id).first()
    if not dm:
        raise HTTPException(404, "Message not found")
    if dm.sender_id != current_user.id:
        raise HTTPException(403, "Not authorized to delete this message")

    dm.is_deleted = True
    dm.content = "This message was deleted"
    dm.file_url = None
    dm.file_name = None
    dm.file_type = None
    db.commit()
    dm.content = "This message was deleted"
    dm.file_url = None
    dm.file_name = None
    dm.file_type = None
    db.commit()

    event = {
        "type": "message_deleted",
        "id": dm.id,
        "sender_id": dm.sender_id,
        "receiver_id": dm.receiver_id,
    }
    await manager.send_direct_message(dm.receiver_id, event)
    await manager.send_direct_message(dm.sender_id, event)

    return {"message": "Message deleted"}


@router.websocket("/ws")
@router.websocket("/ws/{channel_id}")
async def direct_chat_websocket(
    websocket: WebSocket,
    channel_id: int = 0,
    token: str = Query(...),
):
    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
    except Exception:
        await websocket.close(code=4001)
        return

    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            await websocket.close(code=4001)
            return
        curr_user_id = user.id
        curr_user_name = user.name
        curr_user_avatar_color = user.avatar_color
    finally:
        db.close()

    await manager.connect(websocket, 0, curr_user_id, curr_user_name)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg_data = json.loads(data)
                event_type = msg_data.get("type")
                receiver_id = msg_data.get("receiver_id")

                if event_type == "typing" and receiver_id:
                    await manager.send_direct_message(receiver_id, {
                        "type": "typing",
                        "sender_id": curr_user_id,
                        "sender_name": curr_user_name,
                    })

                elif event_type == "message" or "content" in msg_data:
                    content = (msg_data.get("content") or "").strip()
                    if receiver_id and (content or msg_data.get("file_url")):
                        db_msg: Session = SessionLocal()
                        try:
                            dm = DirectMessage(
                                sender_id=curr_user_id,
                                receiver_id=receiver_id,
                                content=content or "Attachment",
                                file_url=msg_data.get("file_url"),
                                file_name=msg_data.get("file_name"),
                                file_type=msg_data.get("file_type"),
                            )
                            db_msg.add(dm)
                            db_msg.commit()
                            db_msg.refresh(dm)

                            event = {
                                "type": "direct_message",
                                "id": dm.id,
                                "sender_id": curr_user_id,
                                "sender_name": curr_user_name,
                                "sender_avatar_color": curr_user_avatar_color,
                                "receiver_id": receiver_id,
                                "content": dm.content,
                                "file_url": dm.file_url,
                                "file_name": dm.file_name,
                                "file_type": dm.file_type,
                                "is_edited": False,
                                "is_deleted": False,
                                "is_read": False,
                                "created_at": dm.created_at.isoformat(),
                            }
                        finally:
                            db_msg.close()

                        await manager.send_direct_message(receiver_id, event)
                        await manager.send_direct_message(curr_user_id, event)
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, 0, curr_user_id)
