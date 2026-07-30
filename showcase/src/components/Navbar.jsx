import React, { useState, useEffect } from 'react';
import { Shield, ExternalLink, Menu, X, Search, Sparkles, Terminal } from 'lucide-react';
import GithubIcon from './GithubIcon';
import { PROJECT_INFO } from '../data/showcaseData';

export default function Navbar({ activeSection, onSearchChange, searchTerm }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm' : 'bg-white border-b border-slate-200/60'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Live Pill */}
          <div className="flex items-center space-x-3">
            <a href="#overview" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">PlacementHub</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-mono font-bold px-2 py-0.5 rounded-full border border-blue-200 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    <span>ONLINE</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 hidden sm:block">Class Placement Portal Architecture</span>
              </div>
            </a>
          </div>

          {/* Blue & White Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search specs, REST endpoints, schemas..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all font-sans"
              />
            </div>
          </div>

          {/* Action Links */}
          <div className="hidden md:flex items-center space-x-2.5">
            <a
              href="#elevator-pitch"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Elevator Pitch</span>
            </a>
            
            <a
              href={PROJECT_INFO.backendApiDocsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
              <span>API Specs</span>
            </a>

            <a
              href={PROJECT_INFO.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <GithubIcon className="w-3.5 h-3.5 text-slate-700" />
              <span>GitHub</span>
            </a>

            <a
              href={PROJECT_INFO.liveDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Live Application</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-100" />
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <input
            type="text"
            placeholder="Search specs, endpoints..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-3 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-col space-y-2 pt-2 text-xs font-medium">
            <a
              href="#elevator-pitch"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 py-2 text-slate-700 font-semibold"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Interview Elevator Pitch</span>
            </a>
            <a
              href={PROJECT_INFO.backendApiDocsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 py-2 text-slate-700 font-semibold"
            >
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>Swagger API Docs</span>
            </a>
            <a
              href={PROJECT_INFO.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 py-2 text-slate-700 font-semibold"
            >
              <GithubIcon className="w-4 h-4 text-slate-700" />
              <span>GitHub Repository</span>
            </a>
            <a
              href={PROJECT_INFO.liveDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 py-2 text-blue-600 font-bold"
            >
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span>Live Application Demo</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
