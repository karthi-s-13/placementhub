import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import {
  BriefcaseIcon, UsersIcon, EyeIcon, CheckCircleIcon,
  ClockIcon, ChartBarIcon, TrophyIcon, BuildingOfficeIcon,
  PlusIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';

function StatCard({ icon: Icon, label, value, sub, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-500',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/api/analytics/overview'),
        api.get('/api/admin/pending-posts'),
      ]);
      setStats(statsRes.data);
      setPending(pendingRes.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/api/opportunities/${id}/approve`);
      setPending(prev => prev.filter(p => p.id !== id));
      fetchData();
    } catch { /* ignore */ }
  };

  const handleReject = async (id) => {
    try {
      await api.delete(`/api/opportunities/${id}`);
      setPending(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
  };

  const weeklyItems = stats ? [
    { label: 'Internships', count: stats.weekly_digest.internships, color: 'badge-blue' },
    { label: 'Full-time', count: stats.weekly_digest.fulltime, color: 'badge-green' },
    { label: 'Hackathons', count: stats.weekly_digest.hackathons, color: 'badge-purple' },
    { label: 'Workshops', count: stats.weekly_digest.workshops, color: 'badge-yellow' },
  ] : [];

  return (
    <Layout title="Admin Dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-muted mt-0.5">Placement portal overview</p>
        </div>
        <button onClick={() => navigate('/post')} className="btn-primary">
          <PlusIcon className="w-4 h-4" />
          Post
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 h-24 bg-slate-50" />
          ))}
        </div>
      ) : stats && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatCard icon={BriefcaseIcon} label="Jobs Posted" value={stats.total_opportunities}
              sub={`${stats.active_opportunities} active`} color="primary" />
            <StatCard icon={UsersIcon} label="Students" value={stats.total_students}
              sub={`of ${stats.batch_size} registered`} color="emerald" />
            <StatCard icon={EyeIcon} label="Total Views" value={stats.total_views} color="violet" />
            <StatCard icon={CheckCircleIcon} label="Applied" value={stats.total_applied} color="emerald" />
            <StatCard icon={ClockIcon} label="Pending Posts" value={stats.pending_posts}
              sub="awaiting approval" color="amber" />
            <StatCard icon={ChartBarIcon} label="Analytics" value="→" sub="View detailed analytics" color="primary" />
          </div>

          {/* Highlights */}
          <div className="grid lg:grid-cols-2 gap-5 mb-6">
            {/* Most active student */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrophyIcon className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-800">Most Active Student</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.most_active_student || '—'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Most applications submitted</p>
            </div>

            {/* Most viewed company */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <BuildingOfficeIcon className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-slate-800">Most Viewed Company</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.most_viewed_company || '—'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Highest student engagement</p>
            </div>
          </div>

          {/* Weekly digest */}
          <div className="card p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-slate-800">This Week's Digest</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {weeklyItems.map(({ label, count, color }) => (
                <div key={label} className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">{count}</div>
                  <span className={`badge mt-1 ${color}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Pending Posts */}
      {pending.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-800">Pending Approval ({pending.length})</h3>
          </div>
          <div className="space-y-3">
            {pending.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{p.title}</p>
                  <p className="text-xs text-slate-400">by {p.posted_by} · {p.posted_by_register}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleReject(p.id)} className="btn-danger py-1.5 px-3 text-xs">Reject</button>
                  <button onClick={() => handleApprove(p.id)} className="btn-primary py-1.5 px-3 text-xs">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
