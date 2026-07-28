import os
import uuid
import json
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from app.database import get_db, SessionLocal
from app.models.models import ChatChannel, ChatMessage, DirectMessage, User
from app.schemas.schemas import (
    ChatChannelOut, ChatMessageOut, ChatMessageCreate, ChatMessageHistory,
    ChatUserOut, DirectMessageOut, DirectMessageCreate
)
from app.utils.auth import get_current_user, decode_token
from app.websocket.manager import manager

router = APIRouter(prefix="/api/chat", tags=["chat"])


def ensure_global_chat_channel(db: Session) -> ChatChannel:
    channel = db.query(ChatChannel).filter(ChatChannel.name == "Global Community Chat").first()
    if not channel:
        channel = ChatChannel(
            name="Global Community Chat",
            description="Permanent public room for all placement hub members. Messages here do not expire."
        )
        db.add(channel)
        db.commit()
        db.refresh(channel)
    return channel


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
    allowed_mimes = {
        "application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png", "image/jpeg", "image/webp"
    }

    if ext not in allowed_exts or (file.content_type and file.content_type.lower() not in allowed_mimes):
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


# ─── GLOBAL COMMUNITY CHAT ENDPOINTS (PERMANENT) ─────────────────────────────

@router.get("/channels/global", response_model=ChatChannelOut)
def get_global_channel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    channel = ensure_global_chat_channel(db)
    msg_count = db.query(func.count(ChatMessage.id)).filter(ChatMessage.channel_id == channel.id).scalar() or 0
    return ChatChannelOut(
        id=channel.id,
        name=channel.name,
        description=channel.description,
        message_count=msg_count,
        created_at=channel.created_at,
    )


@router.get("/channels/{channel_id}/messages", response_model=List[ChatMessageOut])
def get_channel_messages(
    channel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    global_channel = ensure_global_chat_channel(db)
    target_ch_id = global_channel.id if channel_id in (0, 1) or not db.query(ChatChannel).filter(ChatChannel.id == channel_id).first() else channel_id

    messages = db.query(ChatMessage).filter(
        ChatMessage.channel_id == target_ch_id
    ).order_by(ChatMessage.created_at.asc()).all()

    return [
        ChatMessageOut(
            id=m.id,
            channel_id=m.channel_id,
            user_id=m.user_id,
            user_name=m.user.name if m.user else "Member",
            user_avatar_color=m.user.avatar_color if m.user and m.user.avatar_color else "#0F2B5C",
            content=m.content,
            file_url=m.file_url,
            file_name=m.file_name,
            file_type=m.file_type,
            is_edited=m.is_edited or False,
            is_deleted=m.is_deleted or False,
            created_at=m.created_at,
        )
        for m in messages
    ]


@router.post("/channels/{channel_id}/messages", response_model=ChatMessageOut)
async def send_channel_message(
    channel_id: int,
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = (payload.content or "").strip()
    if not content and not payload.file_url:
        raise HTTPException(400, "Message must contain text or a file attachment")

    global_channel = ensure_global_chat_channel(db)
    target_ch_id = global_channel.id if channel_id in (0, 1) or not db.query(ChatChannel).filter(ChatChannel.id == channel_id).first() else channel_id

    msg = ChatMessage(
        channel_id=target_ch_id,
        user_id=current_user.id,
        content=content or (f"📎 Shared attachment: {payload.file_name}" if payload.file_name else "Attachment"),
        file_url=payload.file_url,
        file_name=payload.file_name,
        file_type=payload.file_type,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    out = ChatMessageOut(
        id=msg.id,
        channel_id=msg.channel_id,
        user_id=current_user.id,
        user_name=current_user.name,
        user_avatar_color=current_user.avatar_color or "#0F2B5C",
        content=msg.content,
        file_url=msg.file_url,
        file_name=msg.file_name,
        file_type=msg.file_type,
        is_edited=False,
        is_deleted=False,
        created_at=msg.created_at,
    )

    event = {
        "type": "channel_message",
        "id": msg.id,
        "channel_id": msg.channel_id,
        "user_id": current_user.id,
        "user_name": current_user.name,
        "user_avatar_color": current_user.avatar_color or "#0F2B5C",
        "content": msg.content,
        "file_url": msg.file_url,
        "file_name": msg.file_name,
        "file_type": msg.file_type,
        "is_edited": False,
        "is_deleted": False,
        "created_at": msg.created_at.isoformat() + "Z" if not msg.created_at.isoformat().endswith("Z") else msg.created_at.isoformat(),
    }
    await manager.broadcast_to_channel(0, event)

    return out


@router.put("/channels/messages/{message_id}", response_model=ChatMessageOut)
async def edit_channel_message(
    message_id: int,
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    msg = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not msg:
        raise HTTPException(404, "Message not found")
    if msg.user_id != current_user.id:
        raise HTTPException(403, "Not authorized to edit this message")

    msg.content = (payload.content or "").strip()
    msg.is_edited = True
    db.commit()
    db.refresh(msg)

    out = ChatMessageOut(
        id=msg.id,
        channel_id=msg.channel_id,
        user_id=msg.user_id,
        user_name=current_user.name,
        user_avatar_color=current_user.avatar_color or "#0F2B5C",
        content=msg.content,
        file_url=msg.file_url,
        file_name=msg.file_name,
        file_type=msg.file_type,
        is_edited=True,
        is_deleted=msg.is_deleted,
        created_at=msg.created_at,
    )

    event = {
        "type": "channel_message_edited",
        "id": msg.id,
        "channel_id": msg.channel_id,
        "user_id": msg.user_id,
        "content": msg.content,
    }
    await manager.broadcast_to_channel(0, event)
    for uid in list(manager.user_sockets.keys()):
        await manager.send_direct_message(uid, event)

    return out


@router.delete("/channels/messages/{message_id}")
async def delete_channel_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    msg = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not msg:
        raise HTTPException(404, "Message not found")
    if msg.user_id != current_user.id:
        raise HTTPException(403, "Not authorized to delete this message")

    msg.is_deleted = True
    msg.content = "This message was deleted"
    msg.file_url = None
    msg.file_name = None
    msg.file_type = None
    db.commit()

    event = {
        "type": "channel_message_deleted",
        "id": msg.id,
        "channel_id": msg.channel_id,
        "user_id": msg.user_id,
    }
    await manager.broadcast_to_channel(0, event)
    for uid in list(manager.user_sockets.keys()):
        await manager.send_direct_message(uid, event)

    return {"message": "Message deleted"}


# ─── DIRECT CHATS (VANISHING AFTER 24 HOURS) ──────────────────────────────────

@router.get("/users", response_model=List[ChatUserOut])
def get_chat_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cutoff = datetime.utcnow() - timedelta(hours=24)
    users = db.query(User).filter(
        User.id != current_user.id,
        User.is_active == True
    ).order_by(User.name).all()

    if not users:
        return []

    unread_counts = dict(
        db.query(DirectMessage.sender_id, func.count(DirectMessage.id))
        .filter(
            DirectMessage.receiver_id == current_user.id,
            DirectMessage.is_read == False,
            DirectMessage.created_at >= cutoff
        )
        .group_by(DirectMessage.sender_id)
        .all()
    )

    return [
        ChatUserOut(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            department=u.department,
            avatar_color=u.avatar_color,
            unread_count=unread_counts.get(u.id, 0),
        )
        for u in users
    ]


@router.get("/messages/{target_user_id}", response_model=List[DirectMessageOut])
async def get_direct_messages(
    target_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = db.query(User).filter(User.id == target_user_id).first()
    if not target:
        raise HTTPException(404, "User not found")

    cutoff = datetime.utcnow() - timedelta(hours=24)

    # Mark incoming messages as read
    updated_count = db.query(DirectMessage).filter(
        DirectMessage.sender_id == target_user_id,
        DirectMessage.receiver_id == current_user.id,
        DirectMessage.is_read == False,
        DirectMessage.created_at >= cutoff,
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()

    if updated_count > 0:
        await manager.send_direct_message(target_user_id, {
            "type": "read_receipt",
            "reader_id": current_user.id,
            "sender_id": target_user_id,
        })

    # Strict 24-hour cutoff for direct 1-on-1 messages (Snapchat style)
    messages = db.query(DirectMessage).filter(
        DirectMessage.created_at >= cutoff,
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
        "created_at": dm.created_at.isoformat() + "Z" if not dm.created_at.isoformat().endswith("Z") else dm.created_at.isoformat(),
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

    dm.content = (payload.content or "").strip()
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

    event = {
        "type": "message_deleted",
        "id": dm.id,
        "sender_id": dm.sender_id,
        "receiver_id": dm.receiver_id,
    }
    await manager.send_direct_message(dm.receiver_id, event)
    await manager.send_direct_message(dm.sender_id, event)

    return {"message": "Message deleted"}


# ─── WEBSOCKET ROUTE ──────────────────────────────────────────────────────────

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
                target_channel_id = msg_data.get("channel_id")

                if event_type == "typing" and receiver_id:
                    await manager.send_direct_message(receiver_id, {
                        "type": "typing",
                        "sender_id": curr_user_id,
                        "sender_name": curr_user_name,
                    })

                elif event_type == "channel_message" or target_channel_id:
                    db_msg: Session = SessionLocal()
                    try:
                        g_channel = ensure_global_chat_channel(db_msg)
                        ch_id = target_channel_id if (target_channel_id and target_channel_id != 0) else g_channel.id
                        content = (msg_data.get("content") or "").strip()
                        if content or msg_data.get("file_url"):
                            cmsg = ChatMessage(
                                channel_id=ch_id,
                                user_id=curr_user_id,
                                content=content or "Attachment",
                                file_url=msg_data.get("file_url"),
                                file_name=msg_data.get("file_name"),
                                file_type=msg_data.get("file_type"),
                            )
                            db_msg.add(cmsg)
                            db_msg.commit()
                            db_msg.refresh(cmsg)

                            event = {
                                "type": "channel_message",
                                "id": cmsg.id,
                                "channel_id": cmsg.channel_id,
                                "user_id": curr_user_id,
                                "user_name": curr_user_name,
                                "user_avatar_color": curr_user_avatar_color,
                                "content": cmsg.content,
                                "file_url": cmsg.file_url,
                                "file_name": cmsg.file_name,
                                "file_type": cmsg.file_type,
                                "is_edited": False,
                                "is_deleted": False,
                                "created_at": cmsg.created_at.isoformat() + "Z" if not cmsg.created_at.isoformat().endswith("Z") else cmsg.created_at.isoformat(),
                            }
                            await manager.broadcast_to_channel(0, event)
                    finally:
                        db_msg.close()

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
                                "created_at": dm.created_at.isoformat() + "Z" if not dm.created_at.isoformat().endswith("Z") else dm.created_at.isoformat(),
                            }
                        finally:
                            db_msg.close()

                        await manager.send_direct_message(receiver_id, event)
                        await manager.send_direct_message(curr_user_id, event)
            except Exception:
                pass
    except WebSocketDisconnect:
        await manager.disconnect(websocket, 0, curr_user_id)
