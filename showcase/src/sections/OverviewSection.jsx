import React from 'react';
import SectionHeader from '../components/SectionHeader';
import { Info, Target, Users, CheckCircle2, ShieldCheck, Zap, Bell, MessageSquare } from 'lucide-react';
import { PROJECT_INFO } from '../data/showcaseData';

export default function OverviewSection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
      <SectionHeader
        id="overview"
        number="1"
        title="Project Overview"
        description="Detailed background, core objectives, and problem statement addressed by PlacementHub."
        icon={Info}
        badge="System Purpose"
      />

      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        {/* Core Value Statement Card */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-5">
          <h3 className="font-bold text-blue-900 text-base mb-2 flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Problem Statement & Core Value Proposition</span>
          </h3>
          <p className="text-slate-700">
            College class placement coordination is traditionally managed through chaotic WhatsApp groups, untracked spreadsheets, and lost email threads. Important placement deadlines, eligibility criteria, and drive registrations get buried, leading to missed student opportunities and heavy administrative overhead for Class Representatives (CRs).
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">1. Verified Class Gate</h4>
            <p className="text-xs text-slate-600">
              Registration requires pre-approved register numbers added by CRs, ensuring strict batch privacy (53 students).
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">2. 4-State Readiness Polls</h4>
            <p className="text-xs text-slate-600">
              Students record status (Applied / Planning / Not Eligible / Not Interested) giving CRs immediate clarity.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-3">
              <Bell className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">3. Dual Alerting System</h4>
            <p className="text-xs text-slate-600">
              Firebase Push Notifications + Gmail SMTP email digests ensure zero missed application cutoffs.
            </p>
          </div>
        </div>

        {/* Target Persona Matrix */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
          <div className="bg-slate-100/80 px-4 py-2.5 font-semibold text-slate-800 text-xs uppercase tracking-wider">
            Target Persona Capabilities Matrix
          </div>
          <div className="divide-y divide-slate-100 bg-white text-xs">
            <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="font-bold text-slate-900 sm:col-span-1 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Class Representatives (CR)</span>
              </div>
              <div className="sm:col-span-3 text-slate-600">
                Post opportunities (active immediately), review student pending posts, upload register number whitelists, monitor read receipts, issue WhatsApp reminders, broadcast announcements, manage roles.
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="font-bold text-slate-900 sm:col-span-1 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-slate-600" />
                <span>Class Students</span>
              </div>
              <div className="sm:col-span-3 text-slate-600">
                View verified placement drives, submit application status responses, submit posts for CR approval, participate in real-time chat channels, post threaded comments, bookmark posts.
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
