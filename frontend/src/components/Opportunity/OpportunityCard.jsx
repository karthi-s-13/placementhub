import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookmarkIcon, BuildingOfficeIcon, ShareIcon, XMarkIcon, PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatTimeAgo, parseDate, formatDate } from '../../utils/date';

export default function OpportunityCard({ opportunity, onDelete }) {
  const navigate = useNavigate();
  const { user, isSuperAdmin, isFaculty } = useAuth();
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(opportunity.is_saved);

  const canDelete = isSuperAdmin || isFaculty || (user && user.id === opportunity.posted_by);

  const handleDeleteOpportunity = async (e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this opportunity post?')) return;
    try {
      await api.delete(`/api/opportunities/${opportunity.id}`);
      onDelete?.(opportunity.id);
      window.location.reload();
    } catch {
      alert('Failed to delete opportunity.');
    }
  };

  // Share to Chat Modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sharingUser, setSharingUser] = useState(null);
  const [shareSuccess, setShareSuccess] = useState('');

  // Poll & Reaction State
  const [myStatus, setMyStatus] = useState(opportunity.poll?.my_status || null);
  const [pollCounts, setPollCounts] = useState({
    interested: opportunity.poll?.interested || 0,
    not_interested: opportunity.poll?.not_interested || 0,
    applied: opportunity.poll?.applied || 0,
  });
  const [statusLoading, setStatusLoading] = useState(false);

  const handleStatusClick = async (e, statusValue) => {
    e.stopPropagation();
    if (statusLoading) return;
    setStatusLoading(true);
    try {
      await api.post(`/api/opportunities/${opportunity.id}/status?status=${statusValue}`);
      setPollCounts((prev) => {
        const updated = { ...prev };
        if (myStatus && updated[myStatus] !== undefined) {
          updated[myStatus] = Math.max(0, updated[myStatus] - 1);
        }
        updated[statusValue] = (updated[statusValue] || 0) + 1;
        return updated;
      });
      setMyStatus(statusValue);
    } catch { /* ignore */ }
    finally { setStatusLoading(false); }
  };

  const toggleSave = async (e) => {
    e.stopPropagation();
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/api/saved/${opportunity.id}`);
      } else {
        await api.post(`/api/saved/${opportunity.id}`);
      }
      setIsSaved(!isSaved);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const openShareModal = async (e) => {
    e.stopPropagation();
    setShowShareModal(true);
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/api/chat/users');
      setChatUsers(data || []);
    } catch { /* ignore */ }
    finally { setLoadingUsers(false); }
  };

  const handleShareToUser = async (targetUser) => {
    setSharingUser(targetUser.id);
    setShareSuccess('');
    try {
      const driveUrl = `${window.location.origin}/opportunity/${opportunity.id}`;
      const messageText = `🎯 *Drive Opportunity*: ${opportunity.title}\n🏢 ${opportunity.company || 'Placement Drive'}\n🔗 Link: ${driveUrl}`;
      await api.post(`/api/chat/messages/${targetUser.id}`, {
        content: messageText,
        receiver_id: targetUser.id,
      });
      setShareSuccess(`Shared with ${targetUser.name}!`);
      setTimeout(() => {
        setShareSuccess('');
        setShowShareModal(false);
      }, 1500);
    } catch {
      alert('Failed to share opportunity');
    } finally {
      setSharingUser(null);
    }
  };

  const deadline = opportunity.deadline ? parseDate(opportunity.deadline) : null;

  return (
    <article
      onClick={() => navigate(`/opportunity/${opportunity.id}`)}
      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer space-y-4 relative"
    >
      {/* Top Header Tags & Bookmark */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-xl">
            {opportunity.company ? 'Placement' : 'Internship'}
          </span>
          {opportunity.batch_filter && (
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-xl">
              Batch {opportunity.batch_filter}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Delete Button (Author or Admin/Faculty) */}
          {canDelete && (
            <button
              onClick={handleDeleteOpportunity}
              className="p-1.5 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-600 transition-colors"
              title="Delete Opportunity"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}

          {/* Share to Chat button */}
          <button
            onClick={openShareModal}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
            title="Share Drive to Chat"
          >
            <ShareIcon className="w-5 h-5" />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={toggleSave}
            disabled={saving}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-blue-900 transition-colors"
            title={isSaved ? 'Unsave' : 'Save'}
          >
            {isSaved ? (
              <BookmarkSolid className="w-5 h-5 text-blue-900" />
            ) : (
              <BookmarkIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Title & Company Info */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0F2B5C] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
          <BuildingOfficeIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug truncate">
            {opportunity.title}
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            {opportunity.company || 'Placement Cell Drive'}
          </p>
        </div>
      </div>

      {/* Opportunity Description Preview */}
      {opportunity.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>
      )}

      {/* Footer Row: Poster Info + Reaction & Apply Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        <p className="text-xs text-slate-400 font-medium">
          Posted by <span className="font-bold text-slate-700">{opportunity.poster_name}</span> · {formatTimeAgo(opportunity.created_at)} · {opportunity.view_count} views
        </p>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleStatusClick(e, 'interested')}
            disabled={statusLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              myStatus === 'interested' || myStatus === 'applied'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <span>👍</span>
            <span>{pollCounts.interested}</span>
          </button>

          <button
            onClick={(e) => handleStatusClick(e, 'not_interested')}
            disabled={statusLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              myStatus === 'not_interested'
                ? 'bg-red-500 text-white border-red-500 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <span>👎</span>
            <span>{pollCounts.not_interested}</span>
          </button>

          <button
            onClick={(e) => handleStatusClick(e, 'applied')}
            disabled={statusLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm ${
              myStatus === 'applied'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-600'
            }`}
          >
            {myStatus === 'applied' ? '✓ Applied' : 'Mark applied'}
          </button>
        </div>
      </div>

      {/* Share Drive to Chat Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 max-h-[80vh] flex flex-col border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                <PaperAirplaneIcon className="w-5 h-5 text-blue-600" />
                Share Drive to Chat
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {shareSuccess && (
              <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl text-center">
                ✓ {shareSuccess}
              </p>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingUsers ? (
                <p className="text-xs text-slate-400 text-center py-6">Loading directory...</p>
              ) : chatUsers.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No active contacts found.</p>
              ) : (
                chatUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleShareToUser(u)}
                    className="p-3 bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 rounded-2xl text-xs flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{u.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
                    </div>
                    <button
                      disabled={sharingUser === u.id}
                      className="bg-blue-600 text-white px-3 py-1 rounded-xl text-[11px] font-bold shadow-xs hover:bg-blue-700"
                    >
                      {sharingUser === u.id ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
