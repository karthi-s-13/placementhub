import React from 'react';
import SectionHeader from '../components/SectionHeader';
import { KeyRound, ShieldAlert, Lock, ShieldCheck, UserCheck, Key, FileCheck, CheckCircle2 } from 'lucide-react';

export default function AuthSecuritySection() {
  return (
    <div className="space-y-8 mb-8">
      {/* SECTION 7: AUTHENTICATION */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <SectionHeader
          id="authentication"
          number="7"
          title="Authentication Architecture"
          description="Register-number gated onboarding & stateless JWT access token lifecycle."
          icon={KeyRound}
          badge="Gated Auth"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          {/* Step 1: Whitelist Gate */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-3">
              <FileCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">1. Whitelist Verification Gate</h4>
            <p className="text-slate-600 mb-3">
              To eliminate random signups, registration checks the `register_numbers` table. Only register numbers created by a CR can be claimed during signup.
            </p>
            <div className="bg-white border border-slate-200 p-2.5 rounded-lg font-mono text-[10px] text-slate-800">
              `SELECT * FROM register_numbers WHERE register_number = :reg AND is_used = False`
            </div>
          </div>

          {/* Step 2: JWT Bearer Tokens */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-3">
              <Key className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">2. JWT Stateless Authorization</h4>
            <p className="text-slate-600 mb-3">
              Successful login issues a signed JWT Bearer token encoding `sub` (User ID), `role` ('student' | 'cr'), and `exp` timestamp validated on every protected API route.
            </p>
            <div className="bg-white border border-slate-200 p-2.5 rounded-lg font-mono text-[10px] text-slate-800">
              `Authorization: Bearer eyJhbGciOiJIUzI1Ni...`
            </div>
          </div>
        </div>

        {/* RBAC Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
          <div className="bg-slate-100/90 px-4 py-2.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
            Role-Based Access Control (RBAC) Matrix
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Feature / Action</th>
                  <th className="px-4 py-2.5">Student Role</th>
                  <th className="px-4 py-2.5">CR (Admin) Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900">Post Opportunity</td>
                  <td className="px-4 py-2.5 text-amber-700 font-semibold bg-amber-50/50">Submits (Pending Approval)</td>
                  <td className="px-4 py-2.5 text-emerald-700 font-semibold bg-emerald-50/50">Direct Publish (Active)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900">View Read Receipts</td>
                  <td className="px-4 py-2.5 text-slate-400">Disabled</td>
                  <td className="px-4 py-2.5 text-emerald-700 font-semibold bg-emerald-50/50 font-bold">Enabled (Full Batch View)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900">Register Number Whitelist Management</td>
                  <td className="px-4 py-2.5 text-slate-400">Disabled</td>
                  <td className="px-4 py-2.5 text-emerald-700 font-semibold bg-emerald-50/50">Add / Bulk Upload CSV</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900">Promote / Demote Roles</td>
                  <td className="px-4 py-2.5 text-slate-400">Disabled</td>
                  <td className="px-4 py-2.5 text-emerald-700 font-semibold bg-emerald-50/50">Full Role Control</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 8: SECURITY */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <SectionHeader
          id="security"
          number="8"
          title="Security Architecture"
          description="Enterprise security measures implemented across passwords, SQL queries, CORS policies, and payloads."
          icon={ShieldAlert}
          badge="Zero Trust"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <Lock className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-bold text-slate-900 mb-1">BCrypt Password Hashing</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Passwords hashed using Passlib BCrypt engine with 12 salted round iterations before persisting in DB.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <ShieldCheck className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-bold text-slate-900 mb-1">SQL Injection Safeguards</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              100% of database interactions leverage SQLAlchemy parameterized queries preventing SQL injection attacks.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <KeyRound className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-bold text-slate-900 mb-1">Strict CORS Configuration</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              FastAPI CORSMiddleware restricts origin headers exclusively to verified Vercel frontend domains.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <UserCheck className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-bold text-slate-900 mb-1">Register Whitelist Lock</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Atomic transactions enforce single-claim register numbers to stop account spoofing during high-volume signups.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
