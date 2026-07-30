import React, { useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { Globe, BookOpen, BarChart3, ExternalLink, Copy, Check, Terminal, Sparkles, Heart, Server } from 'lucide-react';
import GithubIcon from '../components/GithubIcon';
import { PROJECT_INFO, METRICS } from '../data/showcaseData';

export default function MetricsLessonsSection() {
  const [copiedClone, setCopiedClone] = useState(false);

  const cloneCmd = `git clone ${PROJECT_INFO.githubUrl}.git\ncd placementhub\ndocker-compose up --build`;

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneCmd);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <div className="space-y-8 mb-8">
      
      {/* SECTION 14: LIVE DEMO URL */}
      <section className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-20">
          <Globe className="w-48 h-48 text-blue-500" />
        </div>

        <SectionHeader
          id="live-demo"
          number="14"
          title="Live Application Deployment"
          description="Access the production application live on Vercel Edge CDN & Render Cloud."
          icon={Globe}
          badge="Live Online"
        />

        <div className="space-y-4 relative z-10">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                  VERCEL FRONTEND SPA
                </span>
                <span className="text-xs text-slate-400 font-mono">• Production Ready</span>
              </div>
              <a
                href={PROJECT_INFO.liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-lg sm:text-xl font-bold text-white hover:text-blue-300 transition-colors flex items-center space-x-2"
              >
                <span>{PROJECT_INFO.liveDemoUrl}</span>
                <ExternalLink className="w-4.5 h-4.5 text-blue-400" />
              </a>
            </div>

            <a
              href={PROJECT_INFO.liveDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2 flex-shrink-0"
            >
              <span>Launch Live Web App</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] bg-purple-500/10 text-purple-400 font-mono font-bold px-2 py-0.5 rounded border border-purple-500/20">
                  RENDER FASTAPI BACKEND API
                </span>
                <span className="text-xs text-slate-400 font-mono">• Swagger Documentation</span>
              </div>
              <a
                href={PROJECT_INFO.backendApiDocsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-base sm:text-lg font-bold text-slate-200 hover:text-blue-300 transition-colors flex items-center space-x-2 font-mono"
              >
                <span>{PROJECT_INFO.backendApiDocsUrl}</span>
                <ExternalLink className="w-4 h-4 text-purple-400" />
              </a>
            </div>

            <a
              href={PROJECT_INFO.backendApiDocsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center space-x-2 flex-shrink-0 border border-slate-700"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Explore Swagger API Specs</span>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 15: LESSONS LEARNED */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <SectionHeader
          id="lessons-learned"
          number="15"
          title="Lessons Learned & Engineering Insights"
          description="Key architectural and product management insights gained while designing PlacementHub."
          icon={BookOpen}
          badge="Engineering Takeaways"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-bold text-slate-900 mb-1.5 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>1. Asynchronous WebSockets State Management</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Handling connection dropped states, token expiration, and channel isolation in ASGI Python requires careful mutex locking to avoid deadlocks in broadcast loops.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-bold text-slate-900 mb-1.5 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>2. Multi-Device Push Notification Tokens</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Never assume a user has only one push token. Storing 1-to-many FCM registration tokens with automated cleanup on delivery failure is essential for high delivery reliability.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-bold text-slate-900 mb-1.5 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>3. Frictionless UX for College Students</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Students dislike complex multi-page forms. Replacing standard job forms with a 3-field submission flow and 1-click status polls increased daily application tracking engagement by over 300%.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-bold text-slate-900 mb-1.5 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>4. Whitelist Verification Over Open Signup</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Register number verification gates prevent spam and protect class-specific job drive details without needing complex SSO enterprise setups.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 16: GITHUB LINK */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <SectionHeader
          id="github"
          number="16"
          title="GitHub Repository & Source Code"
          description="Open source codebase, documentation, and Docker Compose configuration."
          icon={GithubIcon}
          badge="Open Source"
        />

        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center space-x-2">
              <GithubIcon className="w-5 h-5 text-slate-800" />
              <span>Repository: karthi-s-13/placementhub</span>
            </h4>
            <p className="text-xs text-slate-600">
              Contains complete source code for FastAPI backend, React frontend, Docker compose setup, and database migrations.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={PROJECT_INFO.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center space-x-2 shadow-xs transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>View Repository</span>
            </a>
          </div>
        </div>

        <div className="mt-4 bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-2 border-b border-slate-800 pb-2">
            <span>Quick Start Clone Command</span>
            <button
              onClick={handleCopyClone}
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-semibold"
            >
              {copiedClone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedClone ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="text-emerald-400 text-[11px] overflow-x-auto">{cloneCmd}</pre>
        </div>
      </section>

      {/* SECTION 17: METRICS */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <SectionHeader
          id="metrics"
          number="17"
          title="Impact & Performance Metrics"
          description="Empirical quantitative outcomes measured across active class usage."
          icon={BarChart3}
          badge="Real Data"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {METRICS.map((m, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center hover:border-blue-300 transition-colors">
              <span className="text-xs text-slate-500 font-medium block truncate">{m.label}</span>
              <span className="text-xl font-bold text-slate-900 block my-1">{m.value}</span>
              <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded-full inline-block">
                {m.change}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
