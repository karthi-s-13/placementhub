import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';
import GithubIcon from './GithubIcon';
import { PROJECT_INFO } from '../data/showcaseData';

export default function Footer() {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 py-10 mt-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm block">PlacementHub Showcase</span>
            <span className="text-[11px] text-slate-500">Built with React 18, Vite, & Tailwind CSS — Blue & White Theme</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <a
            href={PROJECT_INFO.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-600 transition-colors flex items-center space-x-1.5 font-medium"
          >
            <GithubIcon className="w-4 h-4 text-slate-700" />
            <span>GitHub Repository</span>
          </a>

          <a
            href={PROJECT_INFO.liveDemoUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-700 transition-colors flex items-center space-x-1.5 font-semibold text-blue-600"
          >
            <ExternalLink className="w-4 h-4 text-blue-600" />
            <span>Live Application</span>
          </a>
        </div>

      </div>
    </footer>
  );
}
