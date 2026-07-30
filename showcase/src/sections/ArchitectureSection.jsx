import React from 'react';
import SectionHeader from '../components/SectionHeader';
import { Cpu, Server, Database, Radio, Layers } from 'lucide-react';

export default function ArchitectureSection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
      <SectionHeader
        id="architecture"
        number="3"
        title="System Architecture"
        description="Decoupled micro-tier architecture showing React Vite SPA, FastAPI ASGI backend, MySQL 8.0 DB, WebSockets, FCM, and SMTP."
        icon={Cpu}
        badge="Decoupled Micro-tier"
      />

      {/* Visual System Flowchart Diagram (Blue & White) */}
      <div className="bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border border-blue-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-6">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-blue-900 mb-6 text-center">
          SYSTEM ARCHITECTURE FLOW & DATA PIPELINE
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center relative">
          
          {/* Tier 1: Presentation Tier */}
          <div className="bg-white border border-blue-200 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">1. Presentation Tier</h4>
              <p className="text-[11px] text-blue-700 font-semibold font-mono">Vite + React 18 SPA</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-600 space-y-1 font-mono">
              <div>• Tailwind CSS UI</div>
              <div>• Firebase FCM SDK</div>
              <div>• Hosted on Vercel</div>
            </div>
          </div>

          {/* Tier 2: Application Tier */}
          <div className="bg-white border-2 border-blue-600 rounded-xl p-4 flex flex-col justify-between shadow-md shadow-blue-500/10">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-2">
                <Server className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">2. Application Tier</h4>
              <p className="text-[11px] text-blue-700 font-bold font-mono">FastAPI (ASGI Python 3.11)</p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-100 text-[10px] text-slate-600 space-y-1 font-mono">
              <div>• REST Controllers</div>
              <div>• WebSocket ConnectionMgr</div>
              <div>• Hosted on Render</div>
            </div>
          </div>

          {/* Tier 3: Data Tier */}
          <div className="bg-white border border-blue-200 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">3. Data Tier</h4>
              <p className="text-[11px] text-blue-700 font-semibold font-mono">MySQL 8.0 Database</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-600 space-y-1 font-mono">
              <div>• SQLAlchemy ORM</div>
              <div>• 11 Relational Tables</div>
              <div>• Indexed Queries</div>
            </div>
          </div>

          {/* Tier 4: External Integrations */}
          <div className="bg-white border border-blue-200 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">4. Alert & Sync Tier</h4>
              <p className="text-[11px] text-blue-700 font-semibold font-mono">External Integrations</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-600 space-y-1 font-mono">
              <div>• FCM Web Push (HTTP v1)</div>
              <div>• Gmail SMTP Digest</div>
              <div>• WhatsApp Direct URI</div>
            </div>
          </div>

        </div>
      </div>

      {/* Protocol Matrix (Blue & White) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-4">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center space-x-1.5">
            <Server className="w-4 h-4 text-blue-600" />
            <span>HTTP/REST Request Cycle</span>
          </h4>
          <p className="text-slate-700 leading-relaxed">
            Standard REST requests (Opportunity posts, Auth JWT, Poll status changes, Read receipts) utilize HTTP Bearer token headers. Requests pass through FastAPI dependency injectors for JWT decoding and SQLAlchemy DB sessions.
          </p>
        </div>

        <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-4">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center space-x-1.5">
            <Radio className="w-4 h-4 text-blue-600" />
            <span>Real-time WebSocket Duplex Channel</span>
          </h4>
          <p className="text-slate-700 leading-relaxed">
            Chat messages use persistent WebSocket connections authenticated on handshake query string (<code className="font-mono text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200">/ws/chat/&#123;channel_id&#125;?token=...</code>). The <code className="font-mono text-slate-900 font-bold">ConnectionManager</code> maintains in-memory socket lists per channel for sub-50ms message broadcasting.
          </p>
        </div>
      </div>

    </section>
  );
}
