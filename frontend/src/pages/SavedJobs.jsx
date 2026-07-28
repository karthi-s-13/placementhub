import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import OpportunityCard from '../components/Opportunity/OpportunityCard';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

export default function SavedJobs() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await api.get('/api/saved/');
      setSaved(data.items);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <Layout title="Saved Jobs">
      <div className="flex items-center gap-2 mb-5">
        <BookmarkIcon className="w-5 h-5 text-primary-500" />
        <h2 className="section-title">Saved Opportunities</h2>
        {saved.length > 0 && <span className="badge-blue">{saved.length}</span>}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-2/3 mb-3" />
              <div className="h-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="card py-16 text-center">
          <BookmarkIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No saved jobs yet</p>
          <p className="text-slate-300 text-sm mt-1">Bookmark opportunities to find them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {saved.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} onUpdate={fetch} />
          ))}
        </div>
      )}
    </Layout>
  );
}
