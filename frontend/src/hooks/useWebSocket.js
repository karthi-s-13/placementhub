import { useEffect, useRef, useCallback, useState } from 'react';
import { BASE_URL } from '../services/api';

const WS_BASE = BASE_URL.replace(/^http/, 'ws');

export function useWebSocket(optionsOrChannelId, onMessage) {
  const channelId = typeof optionsOrChannelId === 'object' ? 0 : (optionsOrChannelId || 0);
  const cbParam = typeof optionsOrChannelId === 'object' ? optionsOrChannelId.onMessage : onMessage;

  // Store latest callback in a ref to prevent infinite re-connection loops on component re-renders
  const cbRef = useRef(cbParam);
  useEffect(() => {
    cbRef.current = cbParam;
  }, [cbParam]);

  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('ph_token');
    if (!token) return;

    const url = `${WS_BASE}/api/chat/ws/${channelId}?token=${token}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'system') {
          setOnlineUsers(data.online_users || []);
        } else {
          cbRef.current?.(data);
        }
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [channelId]);

  const sendMessage = useCallback((content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }));
    }
  }, []);

  return { connected, onlineUsers, sendMessage };
}
