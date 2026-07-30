import React from 'react';
import { 
  Info, Sparkles, Cpu, Layers, Database, Code, KeyRound, ShieldAlert,
  FolderTree, AlertTriangle, Zap, CheckCircle2, Rocket, Globe, 
  BookOpen, BarChart3, Mic
} from 'lucide-react';
import GithubIcon from './GithubIcon';

export const SECTIONS = [
  { id: 'overview', label: '1. Project Overview', icon: Info },
  { id: 'features', label: '2. Features Matrix', icon: Sparkles },
  { id: 'architecture', label: '3. System Architecture', icon: Cpu },
  { id: 'tech-stack', label: '4. Tech Stack', icon: Layers },
  { id: 'database', label: '5. Database Design', icon: Database },
  { id: 'api-docs', label: '6. API Documentation', icon: Code },
  { id: 'authentication', label: '7. Authentication', icon: KeyRound },
  { id: 'security', label: '8. Security Architecture', icon: ShieldAlert },
  { id: 'folder-structure', label: '9. Folder Structure', icon: FolderTree },
  { id: 'challenges', label: '10. Challenges & Solutions', icon: AlertTriangle },
  { id: 'performance', label: '11. Performance Engine', icon: Zap },
  { id: 'testing', label: '12. Testing Framework', icon: CheckCircle2 },
  { id: 'deployment', label: '13. Deployment Pipeline', icon: Rocket },
  { id: 'live-demo', label: '14. Live Application URL', icon: Globe },
  { id: 'lessons-learned', label: '15. Lessons Learned', icon: BookOpen },
  { id: 'github', label: '16. GitHub Repository', icon: GithubIcon },
  { id: 'metrics', label: '17. Impact Metrics', icon: BarChart3 },
  { id: 'elevator-pitch', label: '18. Elevator Pitch', icon: Mic },
];

export default function Sidebar({ activeSection }) {
  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs">
        <div className="px-3 py-2.5 border-b border-slate-100 mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">INDEX NAV</span>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-mono font-bold px-2 py-0.5 rounded border border-blue-200">
            18 SPECS
          </span>
        </div>
        
        <nav className="space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={`flex items-center space-x-3 px-3 py-2 text-xs rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25 border-l-4 border-blue-900'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{sec.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
