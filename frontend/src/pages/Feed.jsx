import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MegaphoneIcon, BriefcaseIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout/Layout';
import OpportunityCard from '../components/Opportunity/OpportunityCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';

export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [savedOpportunities, setSavedOpportunities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oppRes, savedRes, annRes] = await Promise.all([
        api.get('/api/opportunities/?per_page=50'),
        api.get('/api/saved/'),
        api.get('/api/announcements/'),
      ]);
      setOpportunities(oppRes.data.items || []);
      setSavedOpportunities(savedRes.data.items || savedRes.data || []);
      setAnnouncements(annRes.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter opportunities by tab
  const filteredOpps = (filter === 'saved' ? savedOpportunities : opportunities).filter((opp) => {
    if (filter === 'all' || filter === 'saved') return true;
    if (filter === 'placement') return opp.company && !opp.title.toLowerCase().includes('intern');
    if (filter === 'internship') return opp.title.toLowerCase().includes('intern');
    if (filter === 'workshop') return opp.title.toLowerCase().includes('workshop') || opp.title.toLowerCase().includes('review');
    return true;
  });

  const firstName = user?.name?.split(' ')[0] || 'Student';

  return (
    <Layout>
      {/* ─── ROYAL BLUE HERO BANNER ──────────────────────────────────────────────── */}
      <div className="bg-[#0F2B5C] rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-blue-950/10 mb-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Welcome Tag */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-semibold tracking-widest uppercase mb-6 text-blue-100">
            <span>✨ WELCOME BACK, {firstName.toUpperCase()}</span>
          </div>

          {/* Headline & Subtitle */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mb-2 leading-tight">
            Every drive, every deadline —
          </h1>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold italic text-amber-400 mb-4 leading-tight">
            in one feed.
          </h1>
          <p className="text-blue-100/90 text-sm sm:text-base max-w-2xl leading-relaxed mb-6">
            React to opportunities, mark applications, and stay in sync with faculty announcements across your batch.
          </p>

          {/* Call-to-action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/post')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4 stroke-[3]" />
              Post an opportunity
            </button>
            <button
              onClick={() => navigate('/announcements')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 px-6 py-3 rounded-2xl text-sm transition-all active:scale-95"
            >
              View announcements
            </button>
          </div>
        </div>
      </div>

      {/* ─── TWO COLUMN MAIN FEED ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Feed & Filter Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header & Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              {filter === 'saved' ? 'Saved opportunities' : 'Latest opportunities'}
            </h2>

            <div className="bg-slate-200/60 p-1 rounded-2xl flex items-center gap-1 text-xs font-semibold">
              {[
                { id: 'all', label: 'All' },
                { id: 'placement', label: 'Placement' },
                { id: 'internship', label: 'Internship' },
                { id: 'workshop', label: 'Workshop' },
                { id: 'saved', label: '🔖 Saved' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    filter === tab.id
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunity Feed Items */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200/80 animate-pulse space-y-4">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-6 bg-slate-100 rounded w-2/3" />
                  <div className="h-16 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredOpps.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              {filter === 'saved' ? (
                <>
                  <BookmarkIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No saved opportunities yet.</p>
                </>
              ) : (
                <>
                  <BriefcaseIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No opportunities match this filter.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {filteredOpps.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pinned Announcements */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="text-amber-500">📌</span> Pinned announcements
            </h3>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => navigate('/announcements')}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                    {ann.is_pinned && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">Pinned</span>}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {ann.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {ann.event_date ? formatDate(ann.event_date, 'MMM dd, yyyy') : 'Placement Cell'} {ann.event_location ? `· ${ann.event_location}` : ''}
                  </p>
                </div>
              ))}

              {announcements.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No pinned announcements yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
