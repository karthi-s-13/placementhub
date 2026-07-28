import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import {
  UsersIcon, PlusIcon, TrashIcon, ShieldCheckIcon,
  MagnifyingGlassIcon, ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';

export default function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [regNumbers, setRegNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('students');
  const [bulkInput, setBulkInput] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await api.get('/api/admin/students');
        setStudents(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchStudents();
  }, []);

  const fetchRegNumbers = async () => {
    try {
      const { data } = await api.get('/api/admin/register-numbers');
      setRegNumbers(data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (tab === 'register') fetchRegNumbers();
  }, [tab]);

  const handleUpload = async () => {
    const numbers = bulkInput
      .split(/[\n,\s]+/)
      .map(s => s.trim())
      .filter(s => /^\d{12}$/.test(s));

    if (numbers.length === 0) {
      setUploadResult({ error: 'No valid 12-digit register numbers found' });
      return;
    }
    setUploading(true);
    try {
      const { data } = await api.post('/api/admin/register-numbers', { register_numbers: numbers });
      setUploadResult(data);
      setBulkInput('');
      fetchRegNumbers();
    } catch (err) {
      setUploadResult({ error: err.response?.data?.detail || 'Upload failed' });
    } finally { setUploading(false); }
  };

  const handleChangeRole = async (userId, role) => {
    await api.patch(`/api/admin/students/${userId}/role?role=${role}`);
    setStudents(prev => prev.map(s => s.id === userId ? { ...s, role } : s));
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Deactivate this student account?')) return;
    await api.delete(`/api/admin/students/${userId}`);
    setStudents(prev => prev.filter(s => s.id !== userId));
  };

  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.register_number.includes(search) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Students">
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['students', 'register'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}>
            {t === 'students' ? '👥 Students' : '🔑 Register Numbers'}
          </button>
        ))}
      </div>

      {tab === 'students' && (
        <>
          {/* Search */}
          <div className="relative mb-5">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, register number, or email..."
              className="input-field pl-9"
            />
          </div>

          {/* Stats bar */}
          <div className="flex gap-3 mb-5 text-sm text-slate-500">
            <span>{students.length} total</span>
            <span>·</span>
            <span>{students.filter(s => s.role === 'cr').length} CRs</span>
            <span>·</span>
            <span>{filtered.length} shown</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse h-16" />
              ))}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Student', 'Register No.', 'Dept / Batch', 'Applied', 'Role', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.register_number}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {s.department || '—'} {s.batch && `· ${s.batch}`}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{s.applications_count}</td>
                      <td className="px-4 py-3">
                        <span className={s.role === 'cr' ? 'badge-purple' : 'badge-blue'}>
                          {s.role === 'cr' ? '⭐ CR' : 'Student'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleChangeRole(s.id, s.role === 'cr' ? 'student' : 'cr')}
                            className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors"
                            title={s.role === 'cr' ? 'Demote to student' : 'Promote to CR'}
                          >
                            <ShieldCheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivate(s.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                            title="Deactivate"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-10 text-center text-sm text-slate-400">No students found</div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'register' && (
        <div className="space-y-5">
          {/* Bulk upload */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-1">Add Register Numbers</h3>
            <p className="text-sm text-slate-400 mb-4">Paste register numbers (one per line, or comma-separated). Only 12-digit numbers will be accepted.</p>
            <textarea
              rows={6}
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
              placeholder={"212224230001\n212224230002\n212224230003"}
              className="input-field resize-none font-mono text-sm mb-3"
            />
            {uploadResult && (
              <div className={`text-sm px-4 py-2.5 rounded-xl mb-3 ${uploadResult.error ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                {uploadResult.error || `✅ Added ${uploadResult.added}, Skipped ${uploadResult.skipped}`}
              </div>
            )}
            <button onClick={handleUpload} disabled={uploading || !bulkInput.trim()} className="btn-primary">
              <ArrowUpTrayIcon className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Register Numbers'}
            </button>
          </div>

          {/* List */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-medium text-slate-700">All Register Numbers ({regNumbers.length})</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
              {regNumbers.map(rn => (
                <div key={rn.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="font-mono text-sm text-slate-700">{rn.register_number}</span>
                  <span className={rn.is_used ? 'badge-green' : 'badge-gray'}>
                    {rn.is_used ? 'Registered' : 'Available'}
                  </span>
                </div>
              ))}
              {regNumbers.length === 0 && (
                <div className="py-6 text-center text-sm text-slate-400">No register numbers added yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
