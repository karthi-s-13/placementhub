import { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon, MagnifyingGlassIcon, UserIcon, PaperClipIcon,
  DocumentIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon, XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout/Layout';
import api, { BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';

export default function Chat() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
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

  // Fetch users list
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/chat/users');
      setUsers(data);
      if (data.length > 0 && !activeUser) {
        setActiveUser(data[0]);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch messages when active user changes
  const fetchMessages = async () => {
    if (!activeUser) return;
    try {
      const { data } = await api.get(`/api/chat/messages/${activeUser.id}`);
      setMessages(data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchMessages();
    setShowThreadSearch(false);
    setThreadSearchQuery('');
  }, [activeUser]);

  // Real-time WebSocket Handler
  const { sendMessage: sendWs } = useWebSocket({
    onMessage: (msg) => {
      if (msg.type === 'direct_message') {
        if (activeUser && (msg.sender_id === activeUser.id || msg.receiver_id === activeUser.id)) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setIsTyping(false);
        }
        fetchUsers();
      } else if (msg.type === 'typing' && activeUser && msg.sender_id === activeUser.id) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      } else if (msg.type === 'read_receipt' && activeUser && msg.reader_id === activeUser.id) {
        setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
      } else if (msg.type === 'message_edited') {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, content: msg.content, is_edited: true } : m))
        );
      } else if (msg.type === 'message_deleted') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id
              ? { ...m, content: 'This message was deleted', is_deleted: true, file_url: null, file_name: null }
              : m
          )
        );
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle typing notification broadcast
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (activeUser) {
      sendWs(JSON.stringify({ type: 'typing', receiver_id: activeUser.id }));
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
    if ((!inputText.trim() && !attachedFile) || !activeUser) return;
    const text = inputText.trim();
    const fileData = attachedFile;

    setInputText('');
    setAttachedFile(null);

    try {
      const { data } = await api.post(`/api/chat/messages/${activeUser.id}`, {
        content: text,
        receiver_id: activeUser.id,
        file_url: fileData?.file_url || null,
        file_name: fileData?.file_name || null,
        file_type: fileData?.file_type || null,
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    } catch { /* ignore */ }
  };

  // Handle Edit Message
  const handleSaveEdit = async (msgId) => {
    if (!editText.trim()) return;
    try {
      const { data } = await api.put(`/api/chat/messages/${msgId}`, { content: editText });
      setMessages((prev) => prev.map((m) => (m.id === msgId ? data : m)));
      setEditingMessageId(null);
    } catch {
      alert('Failed to edit message. (Only messages sent within 5 minutes can be edited)');
    }
  };

  // Handle Delete Message
  const handleDeleteMessage = async (msgId) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/api/chat/messages/${msgId}`);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, content: 'This message was deleted', is_deleted: true, file_url: null, file_name: null }
            : m
        )
      );
    } catch {
      alert('Failed to delete message. (Only messages sent within 5 minutes can be deleted)');
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
      m.file_name?.toLowerCase().includes(query)
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
        {/* ─── LEFT PANEL: USERS DIRECTORY ────────────────────────────────────────── */}
        <div className="w-80 border-r border-slate-100 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-100/70 border border-slate-200/70 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {loading && users.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading directory...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No users found.</div>
            ) : (
              filteredUsers.map((u) => {
                const isActive = activeUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setActiveUser(u)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                      isActive ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full bg-[#0F2B5C] text-white flex items-center justify-center font-bold text-xs shadow-sm"
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
                        <span className="text-[10px] text-slate-400 font-medium">{u.last_message_time || '12m'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {u.last_message || `Role: ${u.role}`}
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
        {activeUser ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Header Bar with Search Toggle */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-[#0F2B5C] text-white flex items-center justify-center font-bold text-xs shadow-sm"
                  style={{ backgroundColor: activeUser.avatar_color || '#0F2B5C' }}
                >
                  {getInitials(activeUser.name)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{activeUser.name}</h3>
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                    {activeUser.role} · Online
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
                    <button onClick={() => { setShowThreadSearch(false); setThreadSearchQuery(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
              {filteredMessages.map((m) => {
                const isMe = m.sender_id === user?.id;
                const canEditDelete = isMe && !m.is_deleted;
                const fullFileUrl = m.file_url ? `${BASE_URL}${m.file_url}` : null;

                return (
                  <div key={m.id} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 max-w-md">
                      {/* Edit / Delete actions for author */}
                      {canEditDelete && (
                        <div className="opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            onClick={() => { setEditingMessageId(m.id); setEditText(m.content); }}
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
                            ? 'bg-blue-700 text-white rounded-tr-none'
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
                              <button onClick={() => setEditingMessageId(null)} className="text-[10px] text-slate-300">Cancel</button>
                              <button onClick={() => handleSaveEdit(m.id)} className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-bold">Save</button>
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
                                      isMe ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
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

                    {/* Timestamp & Double Blue Ticks */}
                    <div className="flex items-center gap-1 mt-1 px-1 text-[9px] text-slate-400 font-medium">
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && (
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
              })}

              {/* Live Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span>{activeUser.name} is typing...</span>
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
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={(!inputText.trim() && !attachedFile) || uploading}
                className="w-10 h-10 rounded-full bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center shadow-md active:scale-95 disabled:opacity-50 transition-all flex-shrink-0"
              >
                <PaperAirplaneIcon className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <UserIcon className="w-12 h-12 mb-2 text-slate-300" />
            <p className="text-sm font-medium">Select a user to start messaging.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
