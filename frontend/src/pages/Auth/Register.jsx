import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BriefcaseIcon, EyeIcon, EyeSlashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const AVATAR_COLORS = [
  '#2563eb', '#7c3aed', '#0891b2', '#059669', '#dc2626',
  '#d97706', '#db2777', '#4f46e5', '#0d9488', '#65a30d',
];

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    register_number: '',
    name: '',
    email: '',
    department: '',
    batch: '',
    password: '',
    avatar_color: AVATAR_COLORS[0],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{12}$/.test(form.register_number)) {
      setError('Register number must be exactly 12 digits');
      return;
    }
    const result = await register(form);
    if (result.success) {
      navigate('/feed');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <BriefcaseIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-1 text-sm">Join your class placement portal</p>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 bg-primary-50 text-primary-700 text-sm px-4 py-3 rounded-xl mb-5 border border-primary-100">
          <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Your register number must be pre-approved by your CR before you can create an account.</p>
        </div>

        <div className="card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Register Number *</label>
              <input
                id="reg-register-number"
                type="text"
                required
                maxLength={12}
                value={form.register_number}
                onChange={e => setForm({ ...form, register_number: e.target.value.replace(/\D/g, '') })}
                placeholder="212224230116"
                className="input-field font-mono tracking-wider"
              />
              <p className="text-xs text-slate-400 mt-1">12-digit numeric register number</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Full Name *</label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your Name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Department</label>
                <input
                  id="reg-dept"
                  type="text"
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  placeholder="CSE"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="label">Email Address *</label>
              <input
                id="reg-email"
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your.email@college.edu"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Batch / Year</label>
              <input
                id="reg-batch"
                type="text"
                value={form.batch}
                onChange={e => setForm({ ...form, batch: e.target.value })}
                placeholder="2027"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Avatar color */}
            <div>
              <label className="label">Profile Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, avatar_color: color })}
                    className={`w-7 h-7 rounded-full transition-transform ${form.avatar_color === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ml-2"
                  style={{ backgroundColor: form.avatar_color }}
                >
                  {form.name?.charAt(0).toUpperCase() || '?'}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <button
              id="btn-register"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
