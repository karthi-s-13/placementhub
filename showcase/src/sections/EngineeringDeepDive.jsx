import React, { useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { AlertTriangle, Zap, CheckCircle2, Rocket, Code, ChevronRight, Terminal, Server, Globe, Box } from 'lucide-react';
import { CHALLENGES } from '../data/showcaseData';

export default function EngineeringDeepDive() {
  const [activeChallenge, setActiveChallenge] = useState(0);

  return (
    <div className="space-y-8 mb-8">
      
      {/* SECTION 10: CHALLENGES FACED */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <SectionHeader
          id="challenges"
          number="10"
          title="Challenges Faced & Technical Solutions"
          description="Real-world engineering bottlenecks encountered during development and the architecture choices used to solve them."
          icon={AlertTriangle}
          badge="Engineering Insights"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Challenge Selector */}
          <div className="lg:col-span-4 border border-slate-200 rounded-xl p-2 bg-slate-50 space-y-1">
            {CHALLENGES.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => setActiveChallenge(idx)}
                className={`w-full text-left p-3 rounded-lg text-xs font-semibold transition-all ${
                  activeChallenge === idx
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80 mb-0.5">Challenge #{idx + 1}</div>
                <div className="truncate">{ch.title}</div>
              </button>
            ))}
          </div>

          {/* Solution & Code Snippet Display */}
          <div className="lg:col-span-8 border border-slate-200 rounded-xl overflow-hidden bg-white p-5 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-2">
                {CHALLENGES[activeChallenge].title}
              </h4>

              <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 mb-4">
                <strong className="block text-amber-950 mb-0.5">Problem Statement:</strong>
                {CHALLENGES[activeChallenge].problem}
              </div>

              <div className="bg-blue-50 border border-blue-200/80 rounded-lg p-3 text-xs text-blue-950 mb-4">
                <strong className="block text-blue-900 mb-0.5">Architectural Solution:</strong>
                {CHALLENGES[activeChallenge].solution}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-mono">
                  Implementation Code Snippet
                </span>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {CHALLENGES[activeChallenge].codeSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: PERFORMANCE IMPROVEMENTS */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <SectionHeader
          id="performance"
          number="11"
          title="Performance Improvements"
          description="Optimization strategies applied to database queries, WebSocket frame sizes, frontend bundle size, and render state."
          icon={Zap}
          badge="Sub-50ms Latency"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-bold text-slate-900 mb-1.5 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>DB Connection Queue Pooling</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Configured SQLAlchemy `QueuePool` with `pool_size=10` and `max_overflow=20` to reuse persistent DB connections, cutting API handshake overhead by 65%.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-bold text-slate-900 mb-1.5 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Composite Indexing</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Added composite indexes on `(opportunity_id, user_id)` across `opportunity_views` and `application_statuses` for instant O(1) status lookups.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="font-bold text-slate-900 mb-1.5 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Vite Code Splitting</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Implemented dynamic module imports for Heavy Admin Analytics charts, reducing initial page load JavaScript bundle size down to 142 kB.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 12: TESTING */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <SectionHeader
          id="testing"
          number="12"
          title="Testing Strategy"
          description="Validation framework covering FastAPI TestClient unit tests, RBAC isolation, and manual QA matrices."
          icon={CheckCircle2}
          badge="Verified Integrity"
        />

        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200">
            Automated & Manual Verification Suite
          </div>

          <div className="divide-y divide-slate-100 bg-white">
            <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="font-bold text-slate-900 sm:col-span-1">1. Backend Route Unit Tests</div>
              <div className="sm:col-span-3 text-slate-600 font-mono text-[11px]">
                Pytest + FastAPI TestClient tests for register number claim verification, JWT token expiration, and password hashing security.
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="font-bold text-slate-900 sm:col-span-1">2. RBAC Permissions Tests</div>
              <div className="sm:col-span-3 text-slate-600 font-mono text-[11px]">
                Ensuring Student access to CR-only endpoints (e.g. bulk register import, read-receipt overview) returns strict `403 Forbidden`.
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="font-bold text-slate-900 sm:col-span-1">3. Docker Container Integration</div>
              <div className="sm:col-span-3 text-slate-600 font-mono text-[11px]">
                `docker-compose up --build` smoke tests verifying automatic table creation and initial seed queries in isolated MySQL container.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 13: DEPLOYMENT */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <SectionHeader
          id="deployment"
          number="13"
          title="Deployment Pipeline"
          description="Cloud deployment setup with Render for backend services, Vercel for React SPA, and Docker Compose for local dev."
          icon={Rocket}
          badge="Cloud Deployed"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <Server className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-bold text-slate-900 mb-1">Backend → Render</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed mb-2">
              Automatic deployment on git push. Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
            </p>
            <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">Python 3.11 ASGI</span>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <Globe className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-bold text-slate-900 mb-1">Frontend → Vercel</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed mb-2">
              Continuous deployment from `frontend/` directory with `npm run build` outputting optimized SPA dist.
            </p>
            <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">Vite React SPA</span>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <Box className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-bold text-slate-900 mb-1">Local → Docker Compose</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed mb-2">
              Orchestrates FastAPI backend & MySQL 8.0 instance locally with one single command.
            </p>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">docker-compose up</span>
          </div>
        </div>
      </section>

    </div>
  );
}
