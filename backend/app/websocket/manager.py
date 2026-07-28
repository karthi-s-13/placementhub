from fastapi import WebSocket
from typing import Dict, List, Set
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # channel_id -> list of (websocket, user_id, user_name)
        self.active_connections: Dict[int, List[dict]] = {}
        # user_id -> list of WebSockets
        self.user_sockets: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel_id: int, user_id: int, user_name: str):
        await websocket.accept()
        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = []
        self.active_connections[channel_id].append({
            "websocket": websocket,
            "user_id": user_id,
            "user_name": user_name,
        })
        if user_id not in self.user_sockets:
            self.user_sockets[user_id] = []
        self.user_sockets[user_id].append(websocket)
        logger.info(f"User {user_name} connected to channel {channel_id}")

    def disconnect(self, websocket: WebSocket, channel_id: int, user_id: int = None):
        if channel_id in self.active_connections:
            self.active_connections[channel_id] = [
                conn for conn in self.active_connections[channel_id]
                if conn["websocket"] != websocket
            ]
            if not self.active_connections[channel_id]:
                del self.active_connections[channel_id]
        if user_id and user_id in self.user_sockets:
            self.user_sockets[user_id] = [
                ws for ws in self.user_sockets[user_id] if ws != websocket
            ]
            if not self.user_sockets[user_id]:
                del self.user_sockets[user_id]

    async def send_direct_message(self, target_user_id: int, message: dict):
        if target_user_id not in self.user_sockets:
            return
        dead = []
        for ws in self.user_sockets[target_user_id]:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.user_sockets[target_user_id].remove(ws)

    async def broadcast_to_channel(self, channel_id: int, message: dict):
        if channel_id not in self.active_connections:
            return
        dead = []
        for conn in self.active_connections[channel_id]:
            try:
                await conn["websocket"].send_text(json.dumps(message))
            except Exception:
                dead.append(conn)
        # Clean up dead connections
        for conn in dead:
            self.active_connections[channel_id].remove(conn)

    def get_online_users(self, channel_id: int) -> List[str]:
        if channel_id not in self.active_connections:
            return []
        return [conn["user_name"] for conn in self.active_connections[channel_id]]

    def is_user_online(self, user_id: int) -> bool:
        return user_id in self.user_sockets and len(self.user_sockets[user_id]) > 0

    def get_total_online(self) -> int:
        return len(self.user_sockets)


manager = ConnectionManager()
