import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatTimeAgo } from '../../utils/date';
import { PaperAirplaneIcon, ArrowUturnLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

function Comment({ comment, onReply, onDelete, currentUser, canManage }) {
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, reply.trim());
    setReply('');
    setShowReply(false);
    setSubmitting(false);
  };

  return (
    <div className="animate-in">
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
          style={{ backgroundColor: comment.user_avatar_color || '#2563eb' }}
        >
          {comment.user_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-2.5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-800">{comment.user_name}</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">
                  {formatTimeAgo(comment.created_at)}
                </span>
                {(canManage || comment.user_id === currentUser?.id) && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="p-1 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{comment.content}</p>
          </div>
          <button
            onClick={() => setShowReply(!showReply)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600 mt-1 ml-2 transition-colors"
          >
            <ArrowUturnLeftIcon className="w-3 h-3" />
            Reply
          </button>

          {/* Reply form */}
          {showReply && (
            <form onSubmit={handleReply} className="flex gap-2 mt-2">
              <input
                type="text"
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Write a reply..."
                className="input-field py-1.5 text-sm flex-1"
                autoFocus
              />
              <button type="submit" disabled={submitting || !reply.trim()} className="btn-primary py-1.5 px-3">
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Nested replies */}
          {comment.replies?.length > 0 && (
            <div className="mt-3 ml-4 space-y-3 border-l-2 border-slate-100 pl-4">
              {comment.replies.map(r => (
                <Comment key={r.id} comment={r} onReply={onReply} onDelete={onDelete} currentUser={currentUser} canManage={canManage} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ opportunityId }) {
  const { user, isSuperAdmin, isFaculty } = useAuth();
  const canManage = isSuperAdmin || isFaculty;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadComments = async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/opportunities/${opportunityId}/comments/`);
      setComments(data);
      setLoaded(true);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  // Load on first render
  useEffect(() => { loadComments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/api/opportunities/${opportunityId}/comments/`, {
        content: newComment.trim(),
      });
      setComments(prev => [...prev, data]);
      setNewComment('');
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleReply = async (parentId, content) => {
    try {
      const { data } = await api.post(`/api/opportunities/${opportunityId}/comments/`, {
        content,
        parent_id: parentId,
      });
      setComments(prev =>
        prev.map(c => c.id === parentId
          ? { ...c, replies: [...(c.replies || []), data] }
          : c
        )
      );
    } catch { /* ignore */ }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/api/opportunities/${opportunityId}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch { /* ignore */ }
  };

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        💬 Discussion ({comments.length})
      </h3>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex gap-2.5 mb-5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
          style={{ backgroundColor: user?.avatar_color || '#2563eb' }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Ask a question or share updates..."
            className="input-field text-sm flex-1"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="btn-primary py-2 px-3"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Comments list */}
      {loading && comments.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-400">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-400">
          No comments yet. Start the discussion!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(c => (
            <Comment
              key={c.id}
              comment={c}
              onReply={handleReply}
              onDelete={handleDelete}
              currentUser={user}
              canManage={canManage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
