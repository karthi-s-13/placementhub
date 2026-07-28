import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon, BuildingOfficeIcon, CalendarIcon, AcademicCapIcon,
  TrashIcon, SparklesIcon, XMarkIcon, EnvelopeIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout/Layout';
import ApplicationPoll from '../components/Opportunity/ApplicationPoll';
import CommentSection from '../components/Opportunity/CommentSection';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatTimeAgo, parseDate, formatDate } from '../utils/date';

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFaculty, isSuperAdmin } = useAuth();

  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // View tracking stats (Faculty/Author only)
  const [viewData, setViewData] = useState(null);
  const [sendingMail, setSendingMail] = useState(false);
  const [mailSentSuccess, setMailSentSuccess] = useState('');

  // Modal State for Popup Lists
  const [activeModal, setActiveModal] = useState(null); // 'viewed' | 'not_viewed' | 'interested' | 'applied'

  const canManage = isSuperAdmin || isFaculty || (opp && opp.posted_by === user?.id);

  const fetchOpportunity = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/opportunities/${id}`);
      setOpp(data);
    } catch {
      setError('Opportunity not found or removed.');
    } finally {
      setLoading(false);
    }
  };

  const loadViewData = async () => {
    try {
      const { data } = await api.get(`/api/opportunities/${id}/views`);
      setViewData(data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchOpportunity();
  }, [id]);

  useEffect(() => {
    if (opp && canManage) {
      loadViewData();
    }
  }, [opp]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/opportunities/${id}`);
      navigate('/feed');
    } catch {
      alert('Failed to delete opportunity.');
      setDeleting(false);
    }
  };

  const handleSendMailReminder = async () => {
    setSendingMail(true);
    setMailSentSuccess('');
    try {
      const { data } = await api.post(`/api/opportunities/${id}/send-mail-reminder`);
      setMailSentSuccess(data.message || 'Email reminders sent!');
    } catch {
      alert('Failed to send mail reminder.');
    } finally {
      setSendingMail(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-40 bg-white rounded-3xl border border-slate-200" />
        </div>
      </Layout>
    );
  }

  if (error || !opp) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-slate-500 font-medium mb-4">{error || 'Opportunity not found.'}</p>
          <button onClick={() => navigate('/feed')} className="btn-primary text-xs">
            Back to Feed
          </button>
        </div>
      </Layout>
    );
  }

  const deadline = opp.deadline ? parseDate(opp.deadline) : null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/feed')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Feed
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0F2B5C] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <BuildingOfficeIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900 leading-snug">{opp.title}</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">{opp.company || 'Placement Cell Drive'}</p>
              </div>
            </div>

            {canManage && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                title="Delete Opportunity"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">ELIGIBILITY</span>
              <span className="font-semibold text-slate-800">{opp.batch_filter ? `Batch ${opp.batch_filter}` : 'All Batches'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">DEADLINE</span>
              <span className="font-semibold text-slate-800">{deadline ? formatDate(deadline, 'MMM dd, yyyy') : 'Open'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">STATUS</span>
              <span className="font-semibold text-emerald-600 uppercase">{opp.status || 'ACTIVE'}</span>
            </div>
          </div>

          {/* Description */}
          {opp.description && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About the Role</h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{opp.description}</p>
            </div>
          )}

          {/* Poster info & Application link */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">
              Posted by <span className="font-bold text-slate-700">{opp.poster_name}</span> · {formatTimeAgo(opp.created_at)} · {opp.view_count} views
            </p>

            {opp.application_link && (
              <a
                href={opp.application_link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                Apply Now ↗
              </a>
            )}
          </div>
        </div>

        {/* ─── ENGAGEMENT TRACKER (FACULTY & AUTHOR ONLY) ─────────────────────────────── */}
        {canManage && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                📊 Student Engagement & Applications Tracker
              </h3>
              <button
                onClick={loadViewData}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl transition-all"
              >
                Refresh Data
              </button>
            </div>

            {viewData ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 👁 Viewed Card */}
                <div
                  onClick={() => setActiveModal('viewed')}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-100/80 transition-all hover:scale-[1.02] shadow-sm"
                >
                  <div className="text-2xl font-black text-slate-800">{viewData.viewed_count}</div>
                  <div className="text-xs font-bold text-slate-500 mt-1 flex items-center justify-center gap-1">
                    <span>👁 Viewed</span>
                  </div>
                  <p className="text-[10px] text-blue-600 font-semibold mt-1">Click to see list ↗</p>
                </div>

                {/* 🙈 Not Viewed Card */}
                <div
                  onClick={() => setActiveModal('not_viewed')}
                  className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center cursor-pointer hover:bg-red-100/80 transition-all hover:scale-[1.02] shadow-sm"
                >
                  <div className="text-2xl font-black text-red-600">{viewData.not_viewed_count}</div>
                  <div className="text-xs font-bold text-red-600 mt-1 flex items-center justify-center gap-1">
                    <span>🙈 Not Viewed</span>
                  </div>
                  <p className="text-[10px] text-red-700 font-semibold mt-1">Click to see list ↗</p>
                </div>

                {/* 👍 Interested Card */}
                <div
                  onClick={() => setActiveModal('interested')}
                  className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center cursor-pointer hover:bg-blue-100/80 transition-all hover:scale-[1.02] shadow-sm"
                >
                  <div className="text-2xl font-black text-blue-700">{viewData.interested_students?.length || 0}</div>
                  <div className="text-xs font-bold text-blue-700 mt-1 flex items-center justify-center gap-1">
                    <span>👍 Interested</span>
                  </div>
                  <p className="text-[10px] text-blue-800 font-semibold mt-1">Click to see list ↗</p>
                </div>

                {/* ✅ Applied Card */}
                <div
                  onClick={() => setActiveModal('applied')}
                  className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center cursor-pointer hover:bg-emerald-100/80 transition-all hover:scale-[1.02] shadow-sm"
                >
                  <div className="text-2xl font-black text-emerald-700">{viewData.applied_students?.length || 0}</div>
                  <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center justify-center gap-1">
                    <span>✅ Applied</span>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-semibold mt-1">Click to see list ↗</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Click "Refresh Data" to load student tracker.</p>
            )}
          </div>
        )}

        {/* Application Poll */}
        <ApplicationPoll opportunityId={parseInt(id)} poll={opp.poll} />

        {/* Comments Section */}
        <CommentSection opportunityId={parseInt(id)} />
      </div>

      {/* ─── POPUP ANALYTICS MODAL ─────────────────────────────────────────────── */}
      {activeModal && viewData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                {activeModal === 'viewed' && `👁 Viewed Students (${viewData.viewed_students?.length || 0})`}
                {activeModal === 'not_viewed' && `🙈 Unread Students (${viewData.not_viewed_students?.length || 0})`}
                {activeModal === 'interested' && `👍 Interested Students (${viewData.interested_students?.length || 0})`}
                {activeModal === 'applied' && `✅ Applied Students (${viewData.applied_students?.length || 0})`}
              </h3>
              <button
                onClick={() => { setActiveModal(null); setMailSentSuccess(''); }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {(() => {
                let list = [];
                if (activeModal === 'viewed') list = viewData.viewed_students || [];
                if (activeModal === 'not_viewed') list = viewData.not_viewed_students || [];
                if (activeModal === 'interested') list = viewData.interested_students || [];
                if (activeModal === 'applied') list = viewData.applied_students || [];

                if (list.length === 0) {
                  return (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No students found in this category yet.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {list.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs flex items-center justify-between shadow-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{s.name}</p>
                          <p className="font-mono text-[11px] text-slate-400 mt-0.5">{s.register_number}</p>
                        </div>
                        {s.department && (
                          <span className="bg-slate-200/70 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            {s.department}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Email Reminder Action inside Unread Modal */}
            {activeModal === 'not_viewed' && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={handleSendMailReminder}
                  disabled={sendingMail || viewData.not_viewed_students?.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{sendingMail ? 'Sending Email Reminders...' : 'Send Mail Reminder to Unread Students'}</span>
                </button>
                {mailSentSuccess && (
                  <p className="text-xs font-semibold text-emerald-600 text-center">✓ {mailSentSuccess}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
