import { useState, useEffect } from 'react';
import {
  UsersIcon, KeyIcon, PlusIcon, TrashIcon, CheckCircleIcon,
  ShieldCheckIcon, AcademicCapIcon, UserGroupIcon, BriefcaseIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout/Layout';
import api from '../services/api';

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('register_numbers');
  const [registerNumbers, setRegisterNumbers] = useState([]);
  const [users, setUsers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for adding register numbers
  const [inputNumbers, setInputNumbers] = useState('');
  const [targetRole, setTargetRole] = useState('student');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // User list filter
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rnRes, usersRes, oppsRes] = await Promise.all([
        api.get('/api/admin/register-numbers'),
        api.get('/api/admin/students'),
        api.get('/api/opportunities/?per_page=100'),
      ]);
      setRegisterNumbers(rnRes.data);
      setUsers(usersRes.data);
      setOpportunities(oppsRes.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRegisterNumbers = async (e) => {
    e.preventDefault();
    if (!inputNumbers.trim()) return;

    // Parse input (supports space, comma, or newline separated 3-20 character alphanumeric strings)
    const parsed = inputNumbers
      .split(/[\s,\n]+/)
      .map(s => s.trim())
      .filter(s => /^[a-zA-Z0-9-]{3,20}$/.test(s));

    if (parsed.length === 0) {
      setMessage({ type: 'error', text: 'No valid register numbers found. Must be 3 to 20 letters/digits.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const { data } = await api.post('/api/admin/register-numbers', {
        register_numbers: parsed,
        target_role: targetRole,
      });
      setMessage({
        type: 'success',
        text: `Successfully added ${data.added} register numbers for ${targetRole.toUpperCase()}! (${data.skipped} skipped/duplicates)`
      });
      setInputNumbers('');
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to add register numbers.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRN = async (id) => {
    if (!window.confirm('Delete this register number?')) return;
    try {
      await api.delete(`/api/admin/register-numbers/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete register number.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/api/admin/students/${userId}/role`, null, {
        params: { role: newRole }
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user role.');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Deactivate this user account?')) return;
    try {
      await api.delete(`/api/admin/students/${userId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to deactivate user.');
    }
  };

  const handleDeleteOpportunity = async (oppId) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await api.delete(`/api/opportunities/${oppId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete post.');
    }
  };

  const filteredUsers = users.filter(u => {
    if (userRoleFilter === 'all') return true;
    return u.role === userRoleFilter;
  });

  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalFaculty = users.filter(u => u.role === 'faculty').length;
  const totalSuperAdmins = users.filter(u => u.role === 'super_admin').length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-primary-700 rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheckIcon className="w-7 h-7 text-purple-200" />
                <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-purple-100">
                  Super Admin Portal
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold">Platform Control Center</h1>
              <p className="text-purple-100 text-sm mt-1">
                Add register numbers for Students & Faculty, manage roles, and oversee all platform activity.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div className="text-center px-2">
                <p className="text-xs text-purple-200">Students</p>
                <p className="text-xl font-bold">{totalStudents}</p>
              </div>
              <div className="text-center px-2 border-x border-white/10">
                <p className="text-xs text-purple-200">Faculty</p>
                <p className="text-xl font-bold">{totalFaculty}</p>
              </div>
              <div className="text-center px-2">
                <p className="text-xs text-purple-200">Admins</p>
                <p className="text-xl font-bold">{totalSuperAdmins}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 bg-white px-4 pt-3 rounded-2xl shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('register_numbers')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'register_numbers'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <KeyIcon className="w-4 h-4" />
            Register Numbers Management
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'users'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            User Directory & Roles ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'posts'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BriefcaseIcon className="w-4 h-4" />
            Post Moderation ({opportunities.length})
          </button>
        </div>

        {/* TAB 1: Register Numbers */}
        {activeTab === 'register_numbers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form to add */}
            <div className="card p-6 space-y-4 h-fit">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PlusIcon className="w-5 h-5 text-purple-600" />
                Add Register Numbers
              </h2>
              <p className="text-xs text-slate-500">
                Authorized users can sign up using these 12-digit register numbers. Select the target role for registration.
              </p>

              <form onSubmit={handleAddRegisterNumbers} className="space-y-4">
                <div>
                  <label className="label">Target Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTargetRole('student')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                        targetRole === 'student'
                          ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <AcademicCapIcon className="w-4 h-4" />
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetRole('faculty')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                        targetRole === 'faculty'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UserGroupIcon className="w-4 h-4" />
                      Faculty
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">12-Digit Register Numbers</label>
                  <textarea
                    rows={4}
                    value={inputNumbers}
                    onChange={e => setInputNumbers(e.target.value)}
                    placeholder="Enter 12-digit numbers separated by space, comma or newlines...&#10;e.g. 717821101001, 717821101002"
                    className="input-field font-mono text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Must be exactly 12 digits each.</p>
                </div>

                {message && (
                  <div className={`p-3 rounded-xl text-xs font-medium ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !inputNumbers.trim()}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : `Add Register Numbers for ${targetRole.toUpperCase()}`}
                </button>
              </form>
            </div>

            {/* List of RNs */}
            <div className="lg:col-span-2 card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Pre-approved Register Numbers</h2>
                  <p className="text-xs text-slate-500">Total: {registerNumbers.length} numbers registered</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-sm text-slate-400">Loading register numbers...</div>
              ) : registerNumbers.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">No register numbers added yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase">
                        <th className="pb-3 font-semibold">Register Number</th>
                        <th className="pb-3 font-semibold">Target Role</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registerNumbers.map(rn => (
                        <tr key={rn.id} className="hover:bg-slate-50">
                          <td className="py-3 font-mono font-medium text-slate-800">{rn.register_number}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              rn.target_role === 'faculty' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {rn.target_role || 'student'}
                            </span>
                          </td>
                          <td className="py-3">
                            {rn.is_used ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                                <CheckCircleIcon className="w-3.5 h-3.5" /> Account Created
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                Available
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => handleDeleteRN(rn.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete register number"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: User Directory & Roles */}
        {activeTab === 'users' && (
          <div className="card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Registered Users Directory</h2>
                <p className="text-xs text-slate-500">Manage account access and roles across students, faculty, and super admins.</p>
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Role Filter:</span>
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value)}
                  className="input-field text-xs py-1.5 px-3 w-auto"
                >
                  <option value="all">All Roles ({users.length})</option>
                  <option value="student">Students ({totalStudents})</option>
                  <option value="faculty">Faculty ({totalFaculty})</option>
                  <option value="super_admin">Super Admins ({totalSuperAdmins})</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Register No.</th>
                    <th className="pb-3 font-semibold">Department</th>
                    <th className="pb-3 font-semibold">Current Role</th>
                    <th className="pb-3 font-semibold">Posts</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: u.avatar_color || '#3b82f6' }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-xs text-slate-600">{u.register_number}</td>
                      <td className="py-3 text-xs text-slate-600">{u.department || 'N/A'}</td>
                      <td className="py-3">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border border-transparent cursor-pointer transition-colors ${
                            u.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'faculty'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <option value="student">🎓 Student</option>
                          <option value="faculty">👨‍🏫 Faculty</option>
                          <option value="super_admin">👑 Super Admin</option>
                        </select>
                      </td>
                      <td className="py-3 text-xs text-slate-600">{u.posts_count || 0}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeactivateUser(u.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Post Moderation */}
        {activeTab === 'posts' && (
          <div className="card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">All Opportunities & Posts</h2>
              <p className="text-xs text-slate-500">Super Admins can edit or delete any post on the platform.</p>
            </div>

            <div className="divide-y divide-slate-100">
              {opportunities.map(opp => (
                <div key={opp.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{opp.title}</h3>
                      {opp.company && <span className="text-xs text-slate-500 font-medium">({opp.company})</span>}
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                        {opp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Posted by: <span className="font-medium text-slate-700">{opp.poster_name}</span> ({opp.poster_role})
                    </p>
                    {opp.description && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">{opp.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteOpportunity(opp.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                    title="Delete Post"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
