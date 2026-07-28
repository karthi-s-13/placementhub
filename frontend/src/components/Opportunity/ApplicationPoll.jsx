import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const OPTIONS = [
  { value: 'interested', label: '👍 Interested', color: 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100', active: 'ring-2 ring-blue-500 font-bold' },
  { value: 'not_interested', label: '👎 Not Interested', color: 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100', active: 'ring-2 ring-red-400 font-bold' },
  { value: 'applied', label: '✅ Mark as Applied', color: 'border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100', active: 'ring-2 ring-emerald-500 font-bold' },
];

export default function ApplicationPoll({ opportunityId, poll, onUpdate }) {
  const { user } = useAuth();
  const [myStatus, setMyStatus] = useState(poll.my_status || null);
  const [counts, setCounts] = useState({ ...poll });
  const [loading, setLoading] = useState(false);

  const handleSelect = async (value) => {
    if (loading) return;
    setLoading(true);
    try {
      await api.post(`/api/opportunities/${opportunityId}/status?status=${value}`);

      // Update local counts
      const prev = myStatus;
      setCounts(c => {
        const updated = { ...c };
        if (prev && updated[prev] !== undefined) {
          updated[prev] = Math.max(0, updated[prev] - 1);
        } else if (!prev) {
          updated.total = (updated.total || 0) + 1;
        }
        updated[value] = (updated[value] || 0) + 1;
        return updated;
      });
      setMyStatus(value);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">
        💬 Student Interest & Application Status
      </h3>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            disabled={loading}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 active:scale-95 disabled:opacity-60
              ${opt.color} ${myStatus === opt.value ? opt.active : ''}`}
          >
            <span>{opt.label}</span>
            {myStatus === opt.value && <span className="text-xs font-black">✓</span>}
          </button>
        ))}
      </div>

      {/* Aggregate counts */}
      {counts.total > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Responses ({counts.total} students)</span>
          </div>
          <div className="space-y-2">
            {[
              { label: '👍 Interested', key: 'interested', color: 'bg-blue-500', text: 'text-blue-600' },
              { label: '👎 Not Interested', key: 'not_interested', color: 'bg-red-400', text: 'text-red-500' },
              { label: '✅ Applied', key: 'applied', color: 'bg-emerald-500', text: 'text-emerald-600' },
            ].map(({ label, key, color, text }) => {
              const count = counts[key] || 0;
              const pct = counts.total > 0 ? Math.round((count / counts.total) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className={`text-xs w-32 font-medium ${text}`}>{label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
