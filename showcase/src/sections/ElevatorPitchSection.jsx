import React, { useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { Mic, Sparkles, Copy, Check, ShieldCheck, HelpCircle } from 'lucide-react';
import { ELEVATOR_PITCH } from '../data/showcaseData';

export default function ElevatorPitchSection() {
  const [copiedPitch, setCopiedPitch] = useState(false);

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(ELEVATOR_PITCH.summary);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl border border-blue-700 p-6 sm:p-8 shadow-xl mb-12 relative overflow-hidden">
      
      <SectionHeader
        id="elevator-pitch"
        number="18"
        title="Technical Interview Elevator Pitch"
        description="Tailored 60-second summary, architectural talking points, and Q&A prep designed to showcase technical leadership."
        icon={Mic}
        badge="Interview Prep Card"
      />

      <div className="space-y-6">
        {/* 60-Second Speech Card */}
        <div className="bg-white text-slate-900 rounded-xl p-6 relative shadow-md">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-bold text-base sm:text-lg text-blue-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>{ELEVATOR_PITCH.headline}</span>
            </h3>
            <button
              onClick={handleCopyPitch}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {copiedPitch ? <Check className="w-3.5 h-3.5 text-blue-200" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPitch ? 'Copied Pitch Script' : 'Copy Pitch Script'}</span>
            </button>
          </div>

          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-sans italic bg-blue-50/70 p-4 rounded-xl border border-blue-100">
            "{ELEVATOR_PITCH.summary}"
          </p>
        </div>

        {/* 4 Core Architectural Highlights */}
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-200 mb-3">
            4 Key Architectural Strengths To Highlight
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ELEVATOR_PITCH.highlights.map((h, idx) => (
              <div key={idx} className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-md">
                <h5 className="font-bold text-sm text-white mb-1 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-blue-300" />
                  <span>{h.title}</span>
                </h5>
                <p className="text-xs text-blue-100 leading-relaxed">{h.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Common Technical Interview Q&A Prep */}
        <div className="bg-white text-slate-900 rounded-xl p-5 shadow-md">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-900 mb-3 flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Expected Technical Q&A Prep</span>
          </h4>

          <div className="space-y-3">
            {ELEVATOR_PITCH.qaPrep.map((qa, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
                <div className="font-bold text-xs text-blue-900 mb-1">
                  Q{idx + 1}: {qa.question}
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-sans">
                  <strong className="text-blue-600">Answer:</strong> {qa.answer}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
