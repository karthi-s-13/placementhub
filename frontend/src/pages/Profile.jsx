import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { PencilIcon, ArrowRightOnRectangleIcon, BookmarkIcon, CheckCircleIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTimeAgo } from '../utils/date';

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [savedOpps, setSavedOpps] = useState([]);
  const [appliedOpps, setAppliedOpps] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    batch: user?.batch || '',
    avatar_color: user?.avatar_color || '#0F2B5C',
  });

  const fetchProfileData = async () => {
    setLoadingData(true);
    try {
      const [savedRes, oppsRes] = await Promise.all([
        api.get('/api/saved/'),
        api.get('/api/opportunities/?per_page=50'),
      ]);
      setSavedOpps(savedRes.data?.items || savedRes.data || []);
      
      const allOpps = oppsRes.data?.items || oppsRes.data || [];
      const applied = Array.isArray(allOpps) ? allOpps.filter((opp) => opp.poll?.my_status === 'applied') : [];
      setAppliedOpps(applied);
    } catch { /* ignore */ }
    finally { setLoadingData(false); }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/api/auth/me', form);
      await refreshUser();
      setEditing(false);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const roleLabel = (user?.role || 'student').replace('_', ' ').toLowerCase();
  const formattedRole = roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ─── BANNER & COVER HEADER ────────────────────────────────────────────── */}
        <div className="relative">
          {/* Royal Blue Banner Cover */}
          <div className="bg-[#0F2B5C] rounded-3xl h-36 sm:h-44 w-full relative shadow-md overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Profile Card Body */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative pt-14 space-y-4">
            {/* Overlapping Avatar */}
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#0F2B5C] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl border-4 border-white shadow-lg absolute -top-12 sm:-top-14 left-6 sm:left-8"
              style={{ backgroundColor: user?.avatar_color || '#0F2B5C' }}
            >
              {initials}
            </div>

            {/* Profile Info & Edit Button Row */}
            <div className="flex items-start justify-between flex-wrap gap-4 pt-2">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    {user?.name}
                  </h1>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-xl shadow-xs">
                    {formattedRole}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2">
                  <span>🎓 {user?.department || 'CSE'} — {user?.batch || 'B'}</span>
                  <span>·</span>
                  <span className="font-mono text-slate-400">{user?.register_number}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all"
                >
                  <PencilIcon className="w-4 h-4 text-slate-500" />
                  {editing ? 'Cancel' : 'Edit profile'}
                </button>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl text-xs transition-all"
                >
                  Sign out
                </button>
              </div>
            </div>

            {/* Edit Form Modal/Panel */}
            {editing && (
              <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4 animate-in mt-4">
                <h3 className="text-sm font-bold text-slate-900">Update Profile Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text" value={form.department}
                      onChange={e => setForm({ ...form, department: e.target.value })}
                      placeholder="CSE" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Batch / Section</label>
                    <input
                      type="text" value={form.batch}
                      onChange={e => setForm({ ...form, batch: e.target.value })}
                      placeholder="2027" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white font-bold text-xs px-5 py-2 rounded-xl">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── TWO COLUMN SAVED & APPLIED OPPORTUNITIES ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Saved Opportunities Column */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookmarkIcon className="w-5 h-5 text-slate-700" />
              Saved opportunities
            </h2>

            {loadingData ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : savedOpps.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <BookmarkIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">No saved opportunities yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedOpps.map((item) => {
                  const opp = item.opportunity || item;
                  return (
                    <div
                      key={opp.id}
                      onClick={() => navigate(`/opportunity/${opp.id}`)}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 cursor-pointer transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-lg uppercase">
                          {opp.company ? 'Placement' : 'Internship'}
                        </span>
                        <span className="text-slate-400 font-medium">{formatTimeAgo(opp.created_at)}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {opp.company || 'Placement Cell'} {opp.deadline ? `· ${formatDate(opp.deadline, 'MMM dd, yyyy')}` : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Applied Opportunities Column */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
              Applied
            </h2>

            {loadingData ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : appliedOpps.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <CheckCircleIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">No applied opportunities marked yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appliedOpps.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => navigate(`/opportunity/${opp.id}`)}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-lg uppercase">
                        {opp.company ? 'Placement' : 'Internship'}
                      </span>
                      <span className="text-slate-400 font-medium">{formatTimeAgo(opp.created_at)}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {opp.company || 'Placement Cell'} {opp.deadline ? `· ${formatDate(opp.deadline, 'MMM dd, yyyy')}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
