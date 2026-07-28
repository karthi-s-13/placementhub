import { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon, MagnifyingGlassIcon, UserIcon, PaperClipIcon,
  DocumentIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon, XMarkIcon,
  GlobeAltIcon, ClockIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout/Layout';
import api, { BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { formatMessageTime } from '../utils/date';

export default function Chat() {
  const { user } = useAuth();
  const { fetchUnreadChatCount } = useNotifications();
  const [users, setUsers] = useState([]);
  const [globalChannel, setGlobalChannel] = useState({ id: 1, name: 'Global Community Chat', description: 'Permanent room for all placement hub members' });
  const [activeTarget, setActiveTarget] = useState({ isGlobal: true, id: 'global', channel_id: 1, name: 'Global Community Chat', role: 'All Members' });
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // In-Thread Search
  const [showThreadSearch, setShowThreadSearch] = useState(false);
  const [threadSearchQuery, setThreadSearchQuery] = useState('');

  // Typing state
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // File Upload Attachment State
  const [attachedFile, setAttachedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Edit Message State
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');

  const messagesEndRef = useRef(null);

  // Fetch global channel metadata
  const fetchGlobalChannel = async () => {
    try {
      const { data } = await api.get('/api/chat/channels/global');
      setGlobalChannel(data);
      if (activeTarget?.isGlobal) {
        setActiveTarget((prev) => ({
          ...prev,
          isGlobal: true,
          id: 'global',
          channel_id: data.id,
          name: data.name,
          role: 'All Members',
          description: data.description,
        }));
      }
      return data;
    } catch { /* fallback to default channel id 1 */ }
  };

  // Fetch users list
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/chat/users');
      setUsers(data);
      fetchUnreadChatCount();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchGlobalChannel();
    fetchUsers();
  }, []);

  // Fetch messages when activeTarget changes
  const fetchMessages = async () => {
    if (!activeTarget) return;
    try {
      if (activeTarget.isGlobal) {
        const chId = activeTarget.channel_id || 1;
        const { data } = await api.get(`/api/chat/channels/${chId}/messages`);
        setMessages(data);
      } else {
        const { data } = await api.get(`/api/chat/messages/${activeTarget.id}`);
        setMessages(data);
        fetchUsers();
        fetchUnreadChatCount();
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchMessages();
    setShowThreadSearch(false);
    setThreadSearchQuery('');
  }, [activeTarget]);

  // Real-time WebSocket Handler
  const { sendMessage: sendWs } = useWebSocket({
    onMessage: (msg) => {
      if (msg.type === 'channel_message') {
        if (activeTarget?.isGlobal) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      } else if (msg.type === 'channel_message_edited') {
        if (activeTarget?.isGlobal) {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, content: msg.content, is_edited: true } : m))
          );
        }
      } else if (msg.type === 'channel_message_deleted') {
        if (activeTarget?.isGlobal) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id
                ? { ...m, content: 'This message was deleted', is_deleted: true, file_url: null, file_name: null }
                : m
            )
          );
        }
      } else if (msg.type === 'direct_message') {
        if (!activeTarget?.isGlobal && (msg.sender_id === activeTarget.id || msg.receiver_id === activeTarget.id)) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setIsTyping(false);
        }
        fetchUsers();
      } else if (msg.type === 'typing' && !activeTarget?.isGlobal && msg.sender_id === activeTarget.id) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      } else if (msg.type === 'read_receipt' && !activeTarget?.isGlobal && msg.reader_id === activeTarget.id) {
        setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
      } else if (msg.type === 'message_edited') {
        if (!activeTarget?.isGlobal) {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, content: msg.content, is_edited: true } : m))
          );
        }
      } else if (msg.type === 'message_deleted') {
        if (!activeTarget?.isGlobal) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id
                ? { ...m, content: 'This message was deleted', is_deleted: true, file_url: null, file_name: null }
                : m
            )
          );
        }
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle typing notification broadcast
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!activeTarget?.isGlobal) {
      sendWs(JSON.stringify({ type: 'typing', receiver_id: activeTarget.id }));
    }
  };

  // Handle File Upload
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/api/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAttachedFile(data);
    } catch {
      alert('Failed to upload attachment.');
    } finally {
      setUploading(false);
    }
  };

  // Handle Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedFile) || !activeTarget) return;
    const text = inputText.trim();
    const fileData = attachedFile;

    setInputText('');
    setAttachedFile(null);

    try {
      if (activeTarget.isGlobal) {
        const chId = activeTarget.channel_id || globalChannel?.id || 1;
        const { data } = await api.post(`/api/chat/channels/${chId}/messages`, {
          content: text,
          file_url: fileData?.file_url || null,
          file_name: fileData?.file_name || null,
          file_type: fileData?.file_type || null,
        });
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      } else {
        const { data } = await api.post(`/api/chat/messages/${activeTarget.id}`, {
          content: text,
          receiver_id: activeTarget.id,
          file_url: fileData?.file_url || null,
          file_name: fileData?.file_name || null,
          file_type: fileData?.file_type || null,
        });
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    } catch { /* ignore */ }
  };

  // Handle Edit Message
  const handleSaveEdit = async (msgId) => {
    if (!editText.trim()) return;
    try {
      if (activeTarget.isGlobal) {
        const { data } = await api.put(`/api/chat/channels/messages/${msgId}`, { content: editText });
        setMessages((prev) => prev.map((m) => (m.id === msgId ? data : m)));
      } else {
        const { data } = await api.put(`/api/chat/messages/${msgId}`, { content: editText });
        setMessages((prev) => prev.map((m) => (m.id === msgId ? data : m)));
      }
      setEditingMessageId(null);
    } catch {
      alert('Failed to edit message.');
    }
  };

  // Handle Delete Message
  const handleDeleteMessage = async (msgId) => {
    if (!confirm('Delete this message?')) return;
    try {
      if (activeTarget.isGlobal) {
        await api.delete(`/api/chat/channels/messages/${msgId}`);
      } else {
        await api.delete(`/api/chat/messages/${msgId}`);
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, content: 'This message was deleted', is_deleted: true, file_url: null, file_name: null }
            : m
        )
      );
    } catch {
      alert('Failed to delete message.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.register_number && u.register_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMessages = messages.filter((m) => {
    if (!threadSearchQuery.trim()) return true;
    const query = threadSearchQuery.toLowerCase();
    return (
      m.content?.toLowerCase().includes(query) ||
      m.file_name?.toLowerCase().includes(query) ||
      m.user_name?.toLowerCase().includes(query) ||
      m.sender_name?.toLowerCase().includes(query)
    );
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Layout>
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden h-[78vh] flex">
        {/* ─── LEFT PANEL: DIRECTORY & ROOMS ────────────────────────────────────── */}
        <div className="w-80 border-r border-slate-100 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats or members..."
                className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-100/70 border border-slate-200/70 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {/* ─── PINNED GLOBAL CHAT ROOM ──────────────────────────────────────── */}
            <div className="p-2 bg-gradient-to-b from-indigo-50/50 to-white border-b border-indigo-100/60">
              <div
                onClick={() =>
                  setActiveTarget({
                    isGlobal: true,
                    id: 'global',
                    channel_id: globalChannel?.id || 1,
                    name: 'Global Community Chat',
                    role: 'All Members Room',
                    description: globalChannel?.description,
                  })
                }
                className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                  activeTarget?.isGlobal
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white hover:bg-indigo-50/80 border border-indigo-100'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-sm ${
                      activeTarget?.isGlobal
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    <GlobeAltIcon className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-xs font-bold truncate">Global Community Chat</h4>
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                        activeTarget?.isGlobal
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      Permanent
                    </span>
                  </div>
                  <p
                    className={`text-[11px] truncate ${
                      activeTarget?.isGlobal ? 'text-indigo-100' : 'text-slate-500'
                    }`}
                  >
                    Public room for all members
                  </p>
                </div>
              </div>
            </div>

            {/* ─── 1-ON-1 DIRECT MESSAGES HEADER (24H VANISHING) ───────────────── */}
            <div className="px-4 py-2 bg-slate-50/60 border-y border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-slate-400" />
                Direct Messages
              </span>
              <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                🔥 24h Vanishing
              </span>
            </div>

            {/* ─── DIRECT CHAT USERS LIST ──────────────────────────────────────── */}
            {loading && users.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading members...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No members found.</div>
            ) : (
              filteredUsers.map((u) => {
                const isActive = !activeTarget?.isGlobal && activeTarget?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() =>
                      setActiveTarget({
                        isGlobal: false,
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        role: u.role,
                        department: u.department,
                        avatar_color: u.avatar_color,
                      })
                    }
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                      isActive ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm"
                        style={{ backgroundColor: u.avatar_color || '#0F2B5C' }}
                      >
                        {getInitials(u.name)}
                      </div>
                      {u.is_online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{u.name}</h4>
                        <span className="text-[9px] text-amber-600 font-semibold">24h</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {u.role || 'Member'} · {u.department || 'General'}
                      </p>
                    </div>

                    {u.unread_count > 0 && (
                      <span className="w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center flex-shrink-0">
                        {u.unread_count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── RIGHT PANEL: CONVERSATION THREAD ─────────────────────────────────── */}
        {activeTarget ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Header Bar with Info & Search */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                {activeTarget.isGlobal ? (
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
                    <GlobeAltIcon className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div
                    className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm"
                    style={{ backgroundColor: activeTarget.avatar_color || '#0F2B5C' }}
                  >
                    {getInitials(activeTarget.name)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {activeTarget.name}
                    </h3>
                    {activeTarget.isGlobal ? (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full">
                        Permanent Room
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        ⏱️ 24h Auto-Expiry
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 tracking-wide mt-0.5">
                    {activeTarget.isGlobal
                      ? 'Open to all students, faculty & super admin'
                      : `${activeTarget.role || 'Member'} · Direct 1-on-1 Chat`}
                  </p>
                </div>
              </div>

              {/* In-Thread Search Action */}
              <div className="flex items-center gap-2">
                {showThreadSearch ? (
                  <div className="relative animate-in">
                    <input
                      type="text"
                      value={threadSearchQuery}
                      onChange={(e) => setThreadSearchQuery(e.target.value)}
                      placeholder="Search messages..."
                      className="w-48 pl-8 pr-7 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs outline-none"
                    />
                    <MagnifyingGlassIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <button
                      onClick={() => {
                        setShowThreadSearch(false);
                        setThreadSearchQuery('');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowThreadSearch(true)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    title="Search messages in thread"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mode Banner */}
            {activeTarget.isGlobal ? (
              <div className="px-4 py-2 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                <div className="flex items-center gap-2 font-medium">
                  <GlobeAltIcon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>
                    <strong>Global Community Chat:</strong> Messages in this room are <strong>permanent</strong> and visible to all members.
                  </span>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2 font-medium">
                  <ClockIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>24-Hour Auto-Expiry:</strong> Direct messages automatically clear <strong>24 hours</strong> after being sent to keep conversations fresh and secure.
                  </span>
                </div>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  {activeTarget.isGlobal ? (
                    <>
                      <GlobeAltIcon className="w-12 h-12 text-indigo-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-700">Welcome to the Global Community Chat!</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Start the conversation with all placement hub members. Messages here are permanent.
                      </p>
                    </>
                  ) : (
                    <>
                      <ClockIcon className="w-12 h-12 text-amber-400 mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No messages in the last 24 hours</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Send a message to start a 1-on-1 conversation. Messages automatically vanish after 24 hours.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                filteredMessages.map((m) => {
                  const senderId = m.user_id || m.sender_id;
                  const senderName = m.user_name || m.sender_name || 'Member';
                  const avatarColor = m.user_avatar_color || m.sender_avatar_color || '#0F2B5C';
                  const isMe = Number(senderId) === Number(user?.id);
                  const canEditDelete = isMe && !m.is_deleted;
                  const fullFileUrl = m.file_url ? `${BASE_URL}${m.file_url}` : null;

                  return (
                    <div key={m.id} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Sender name for Global Chat if not me */}
                      {activeTarget.isGlobal && !isMe && (
                        <span className="text-[10px] font-bold text-slate-500 mb-1 px-1 flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: avatarColor }}
                          />
                          {senderName}
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 max-w-md">
                        {/* Edit / Delete actions for author */}
                        {canEditDelete && (
                          <div className="opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingMessageId(m.id);
                                setEditText(m.content);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                              title="Edit message"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(m.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
                              title="Delete message"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Bubble Box */}
                        <div
                          className={`px-4 py-3 rounded-2xl text-xs leading-relaxed font-medium shadow-sm space-y-2 ${
                            isMe
                              ? activeTarget.isGlobal
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-blue-700 text-white rounded-tr-none'
                              : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                          }`}
                        >
                          {editingMessageId === m.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full px-2 py-1 rounded bg-white text-slate-800 text-xs outline-none"
                              />
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => setEditingMessageId(null)}
                                  className="text-[10px] text-slate-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(m.id)}
                                  className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Message Text */}
                              <p className={m.is_deleted ? 'italic text-slate-300' : ''}>{m.content}</p>

                              {/* File Attachment Card */}
                              {m.file_url && !m.is_deleted && (
                                <div className="pt-2 border-t border-white/20">
                                  {m.file_type === 'image' ? (
                                    <img
                                      src={fullFileUrl}
                                      alt={m.file_name}
                                      className="max-h-48 rounded-xl object-cover border border-white/20"
                                    />
                                  ) : (
                                    <a
                                      href={fullFileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                                        isMe
                                          ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                                      }`}
                                    >
                                      <DocumentIcon className="w-5 h-5 flex-shrink-0" />
                                      <span className="truncate flex-1">{m.file_name || 'Resume / Document'}</span>
                                      <ArrowDownTrayIcon className="w-4 h-4 flex-shrink-0" />
                                    </a>
                                  )}
                                </div>
                              )}

                              {m.is_edited && (
                                <span className="text-[9px] opacity-70 italic block text-right">(edited)</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 mt-1 px-1 text-[9px] text-slate-400 font-medium">
                        <span>{formatMessageTime(m.created_at)}</span>
                        {isMe && !activeTarget.isGlobal && (
                          <span>
                            {m.is_read ? (
                              <span className="text-blue-500 font-bold" title="Read">✓✓</span>
                            ) : (
                              <span className="text-slate-400 font-bold" title="Sent">✓</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Live Typing Indicator */}
              {isTyping && !activeTarget.isGlobal && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span>{activeTarget.name} is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview Bar */}
            {attachedFile && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-900 font-semibold truncate">
                  <PaperClipIcon className="w-4 h-4" />
                  <span className="truncate">Attached: {attachedFile.file_name}</span>
                </div>
                <button onClick={() => setAttachedFile(null)} className="text-blue-500 hover:text-blue-700">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex items-center gap-3 bg-white">
              {/* Attachment Paperclip Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-2.5 rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
                title="Attach PDF resume or image"
              >
                <PaperClipIcon className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={
                  activeTarget.isGlobal
                    ? 'Message everyone in Global Chat...'
                    : `Message ${activeTarget.name} (disappears in 24h)...`
                }
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={(!inputText.trim() && !attachedFile) || uploading}
                className={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md active:scale-95 disabled:opacity-50 transition-all flex-shrink-0 ${
                  activeTarget.isGlobal ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-700 hover:bg-blue-800'
                }`}
              >
                <PaperAirplaneIcon className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <UserIcon className="w-12 h-12 mb-2 text-slate-300" />
            <p className="text-sm font-medium">Select a chat room or member to start messaging.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
