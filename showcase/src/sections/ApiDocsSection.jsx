import React, { useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { Code, Server, Copy, Check, Terminal } from 'lucide-react';
import { API_ENDPOINTS } from '../data/showcaseData';

export default function ApiDocsSection() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
      <SectionHeader
        id="api-docs"
        number="6"
        title="API Documentation Explorer"
        description="RESTful & WebSocket endpoint reference powering the FastAPI ASGI service with OpenAPI schemas."
        icon={Code}
        badge="28 Endpoints"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints List */}
        <div className="lg:col-span-5 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-200">
            Available Endpoints
          </div>

          <div className="divide-y divide-slate-200/70 max-h-[420px] overflow-y-auto">
            {API_ENDPOINTS.map((ep, idx) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3 flex items-start space-x-3 transition-all ${
                    isSelected ? 'bg-white border-l-4 border-blue-600 shadow-2xs' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex-shrink-0 ${
                    ep.method === 'GET' ? 'bg-emerald-100 text-emerald-800' :
                    ep.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    ep.method === 'WS' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {ep.method}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-bold text-slate-900 truncate">{ep.path}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{ep.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Endpoint Spec Viewer */}
        <div className="lg:col-span-7 border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-slate-100 font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white text-xs">{selectedEndpoint.category} API Spec</span>
              </div>
              <button
                onClick={() => handleCopy(selectedEndpoint.reqBody)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Spec'}</span>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Route Header</span>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedEndpoint.method === 'GET' ? 'bg-emerald-900 text-emerald-300' :
                    selectedEndpoint.method === 'POST' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
                  }`}>
                    {selectedEndpoint.method}
                  </span>
                  <span className="text-blue-300 font-bold">{selectedEndpoint.path}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Request Payload / Params</span>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-400 overflow-x-auto text-[11px]">
                  {selectedEndpoint.reqBody}
                </pre>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Response JSON (200 OK)</span>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-blue-300 overflow-x-auto text-[11px]">
                  {selectedEndpoint.resBody}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 px-4 py-2 text-[10px] text-slate-400 border-t border-slate-700 flex items-center justify-between font-sans">
            <span>FastAPI OpenAPI v3 Specification</span>
            <span className="text-emerald-400 font-semibold">200 OK Response Standard</span>
          </div>
        </div>
      </div>
    </section>
  );
}
