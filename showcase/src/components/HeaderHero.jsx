import React from 'react';
import { Shield, Sparkles, ExternalLink, Globe, Server, Terminal, CheckCircle2, Zap } from 'lucide-react';
import GithubIcon from './GithubIcon';
import { PROJECT_INFO, METRICS } from '../data/showcaseData';

export default function HeaderHero() {
  return (
    <div className="bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200/90 pt-12 pb-14 mb-10 relative overflow-hidden">
      
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none subtle-blue-grid opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Production Status Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2.5 bg-white border border-blue-200 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-blue-900 font-mono font-bold">LIVE PRODUCTION DEPLOYED</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-mono">VERCEL & RENDER</span>
          </div>
        </div>

        {/* Main Hero Header Title */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
            PlacementHub <span className="blue-gradient-text">Showcase</span>
          </h1>
          
          <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-8 font-normal">
            {PROJECT_INFO.tagline}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap justify-center items-center gap-3.5 mb-12">
            <a
              href={PROJECT_INFO.liveDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Visit Live Application</span>
              <ExternalLink className="w-4 h-4 text-blue-100" />
            </a>

            <a
              href={PROJECT_INFO.backendApiDocsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all"
            >
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>Swagger API Specs</span>
            </a>

            <a
              href={PROJECT_INFO.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all"
            >
              <GithubIcon className="w-4 h-4 text-slate-700" />
              <span>GitHub Repository</span>
            </a>
          </div>

          {/* Live Deployment Cards (Blue & White) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10 text-left">
            <div className="bg-white border border-blue-200/90 rounded-xl p-3.5 flex items-center justify-between font-mono text-xs shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-slate-800 font-bold truncate">placementhub-one.vercel.app</span>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
                Frontend SPA
              </span>
            </div>

            <div className="bg-white border border-blue-200/90 rounded-xl p-3.5 flex items-center justify-between font-mono text-xs shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Server className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span className="text-slate-800 font-bold truncate">placementhub-ajx0.onrender.com</span>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200">
                FastAPI ASGI
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Bar Grid (Blue & White) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {METRICS.map((m, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-xl p-4 text-center shadow-xs hover:border-blue-300 transition-all group">
              <span className="text-[11px] text-slate-500 font-medium block truncate">{m.label}</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 block my-1 group-hover:text-blue-600 transition-colors">
                {m.value}
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full inline-block truncate max-w-full">
                {m.change}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
