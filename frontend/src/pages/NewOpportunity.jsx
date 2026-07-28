import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NewOpportunity() {
  const { isCR } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    company: '',
    application_link: '',
    description: '',
    batch_filter: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.application_link.trim()) {
      setError('Title and Application Link are required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      };
      const { data } = await api.post('/api/opportunities/', payload);
      navigate(isCR ? `/opportunity/${data.id}` : '/feed');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Post Opportunity">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-5 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-start gap-2 bg-blue-50 text-blue-700 text-sm px-4 py-3 rounded-xl mb-5 border border-blue-100">
          <InformationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p><strong>Instant Publishing:</strong> Your post will be published immediately. As the author, you are responsible for the accuracy of this post.</p>
        </div>

        <div className="card p-7">
          <h2 className="page-title mb-6">New Opportunity</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="label">Job Title *</label>
              <input
                id="new-opp-title"
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Google Software Engineer Intern"
                className="input-field"
              />
            </div>

            {/* Company */}
            <div>
              <label className="label">Company Name</label>
              <input
                id="new-opp-company"
                type="text"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Google"
                className="input-field"
              />
            </div>

            {/* Application Link */}
            <div>
              <label className="label">Application Link *</label>
              <input
                id="new-opp-link"
                type="url"
                required
                value={form.application_link}
                onChange={e => setForm({ ...form, application_link: e.target.value })}
                placeholder="https://careers.google.com/..."
                className="input-field"
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea
                id="new-opp-desc"
                rows={4}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Only for 2027 batch. CGPA > 7. Off-campus drive."
                className="input-field resize-none"
              />
            </div>

            {/* Batch filter + Deadline */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Batch Filter</label>
                <input
                  id="new-opp-batch"
                  type="text"
                  value={form.batch_filter}
                  onChange={e => setForm({ ...form, batch_filter: e.target.value })}
                  placeholder="e.g. 2027"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Deadline</label>
                <input
                  id="new-opp-deadline"
                  type="datetime-local"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 py-3">
                Cancel
              </button>
              <button
                id="btn-submit-opportunity"
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 py-3"
              >
                {loading ? 'Publishing...' : 'Publish Opportunity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
