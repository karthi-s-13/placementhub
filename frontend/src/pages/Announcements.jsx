import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, MapPinIcon, CalendarIcon, ClockIcon, MegaphoneIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/date';

function AnnouncementCard({ ann, canManage, onDelete, unreadNotifId, onMarkRead }) {
  const eventDateObj = ann.event_date ? new Date(ann.event_date) : null;
  const monthStr = eventDateObj ? eventDateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase() : null;
  const dayStr = eventDateObj ? eventDateObj.getDate() : null;

  const handleClick = () => {
    if (unreadNotifId) {
      onMarkRead(unreadNotifId);
    }
  };

  return (
    <article
      onClick={handleClick}
      className={`bg-white rounded-3xl p-6 border shadow-sm space-y-4 transition-all hover:shadow-md relative ${
        unreadNotifId ? 'border-violet-300 ring-2 ring-violet-100 bg-violet-50/20' : 'border-slate-200/80'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {unreadNotifId && (
            <span className="bg-violet-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-xl shadow-xs animate-pulse flex items-center gap-1">
              ✨ NEW ANNOUNCEMENT
            </span>
          )}
          {ann.is_pinned && (
            <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-xl shadow-xs">
              📌 Pinned
            </span>
          )}
          <span className="text-xs font-semibold text-slate-400">
            by <span className="font-bold text-slate-700">{ann.creator_name || 'Placement Cell'}</span> · {ann.created_at ? formatDate(ann.created_at, 'MMM dd, yyyy') : '3h ago'}
          </span>
        </div>

        {canManage && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(ann.id); }}
            className="p-1.5 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
            title="Delete Announcement"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content Row with Date Badge */}
      <div className="flex items-start gap-4">
        {eventDateObj && (
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center flex-shrink-0 text-center shadow-xs">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider leading-none">{monthStr}</span>
            <span className="text-lg font-black text-slate-900 leading-none mt-1">{dayStr}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-xl font-bold text-slate-900 mb-2 leading-snug">{ann.title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{ann.content}</p>
        </div>
      </div>

      {/* Date, Time & Venue Pills */}
      {(ann.event_date || ann.event_time || ann.event_location) && (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-700">
          {ann.event_date && (
            <span className="bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-slate-500" />
              {formatDate(ann.event_date, 'MMM dd, yyyy')}
            </span>
          )}
          {ann.event_time && (
            <span className="bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4 text-slate-500" />
              {ann.event_time.slice(0, 5)} onwards
            </span>
          )}
          {ann.event_location && (
            <span className="bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <MapPinIcon className="w-4 h-4 text-slate-500" />
              {ann.event_location}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

export default function Announcements() {
  const { isSuperAdmin, isFaculty } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const canManage = isSuperAdmin || isFaculty;
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    event_date: '',
    event_time: '',
    event_location: '',
    is_pinned: false,
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/announcements/');
      setAnnouncements(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/announcements/', {
        ...form,
        event_date: form.event_date || null,
        event_time: form.event_time || null,
        event_location: form.event_location || null,
      });
      setForm({ title: '', content: '', event_date: '', event_time: '', event_location: '', is_pinned: false });
      setShowForm(false);
      fetchAnnouncements();
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete announcement?')) return;
    try {
      await api.delete(`/api/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch { /* ignore */ }
  };

  // Filtered announcements
  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'pinned') return ann.is_pinned;
    if (filter === 'events') return !!ann.event_date;
    return true;
  });

  const upcomingEvents = announcements.filter((a) => a.event_date).slice(0, 4);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ─── HEADER & CONTROLS ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900">Announcements</h1>
            <p className="text-sm text-slate-500 mt-1">Pinned reminders, drive updates, and campus events from the placement cell.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search announcements..."
                className="pl-9 pr-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs outline-none focus:border-blue-500 w-48 sm:w-60 shadow-xs"
              />
            </div>

            {canManage && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-900 hover:bg-blue-950 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4 stroke-[3]" />
                New Announcement
              </button>
            )}
          </div>
        </div>

        {/* ─── CREATE FORM MODAL ──────────────────────────────────────────────── */}
        {canManage && showForm && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4 animate-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900">Create New Announcement</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-xl text-slate-400 hover:bg-slate-100">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title *</label>
                <input
                  type="text" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Campus Coding Challenge – Round 1"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Content *</label>
                <textarea
                  rows={4} required value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Event guidelines, eligibility, and instructions..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Date</label>
                  <input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time</label>
                  <input type="time" value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
                  <input type="text" value={form.event_location} onChange={e => setForm({ ...form, event_location: e.target.value })} placeholder="Main Auditorium" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is-pinned" checked={form.is_pinned} onChange={e => setForm({ ...form, is_pinned: e.target.checked })} className="rounded" />
                <label htmlFor="is-pinned" className="text-xs text-slate-600 font-semibold">Pin this announcement to top</label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-blue-900 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-sm">
                  {submitting ? 'Posting...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── TWO COLUMN DASHBOARD LAYOUT ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Filter Tabs & Announcement Cards */}
          <div className="lg:col-span-8 space-y-6">
            {/* Filter Tabs */}
            <div className="bg-slate-200/60 p-1 rounded-2xl inline-flex items-center gap-1 text-xs font-semibold">
              {[
                { id: 'all', label: 'All Announcements' },
                { id: 'pinned', label: '📌 Pinned' },
                { id: 'events', label: '📅 Upcoming Events' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-4 py-1.5 rounded-xl transition-all ${
                    filter === tab.id
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200/80 animate-pulse space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-6 bg-slate-100 rounded w-2/3" />
                    <div className="h-20 bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                <MegaphoneIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No announcements found.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredAnnouncements.map((ann) => {
                  const unreadNotif = (notifications || []).find(
                    (n) => !n.is_read && n.type === 'announcement' && n.reference_id === ann.id
                  );
                  const canDelete = isSuperAdmin || isFaculty || (user && user.id === ann.created_by);
                  return (
                    <AnnouncementCard
                      key={ann.id}
                      ann={ann}
                      canManage={canDelete}
                      onDelete={handleDelete}
                      unreadNotifId={unreadNotif?.id}
                      onMarkRead={markAsRead}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Upcoming Schedule Sidebar Widget */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                Scheduled Events
              </h3>

              <div className="space-y-3">
                {upcomingEvents.map((evt) => (
                  <div key={evt.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {formatDate(evt.event_date, 'MMM dd, yyyy')}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{evt.title}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {evt.event_location || 'Campus Auditorium'}
                    </p>
                  </div>
                ))}

                {upcomingEvents.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No scheduled events right now.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
