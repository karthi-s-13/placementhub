import React, { useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { FolderTree, Folder, FileCode, ChevronDown, ChevronRight, Box } from 'lucide-react';

const FOLDER_TREE = [
  {
    name: 'backend/',
    type: 'dir',
    desc: 'FastAPI ASGI REST & WebSocket backend service',
    children: [
      { name: 'app/main.py', type: 'file', desc: 'FastAPI app instance, middleware, CORS & APScheduler startup' },
      { name: 'app/database.py', type: 'file', desc: 'SQLAlchemy Engine instance & SessionLocal dependency' },
      { name: 'app/models/models.py', type: 'file', desc: '11 SQL relational tables definitions & relationships' },
      { name: 'app/routers/auth.py', type: 'file', desc: 'Registration gate, login, JWT issuance & role endpoints' },
      { name: 'app/routers/opportunities.py', type: 'file', desc: 'Opportunity CRUD, read receipts, WhatsApp reminder query' },
      { name: 'app/routers/chat.py', type: 'file', desc: 'WebSocket channel routes & message persistence' },
      { name: 'app/websocket/manager.py', type: 'file', desc: 'Thread-safe WebSocket ConnectionManager broadcast handler' },
      { name: 'app/services/fcm.py', type: 'file', desc: 'Firebase Cloud Messaging Web Push dispatch integration' },
      { name: 'app/services/email.py', type: 'file', desc: 'Gmail SMTP background task dispatcher' },
      { name: 'Dockerfile', type: 'file', desc: 'Container setup for Python 3.11 Uvicorn deployment' },
      { name: 'requirements.txt', type: 'file', desc: 'FastAPI, SQLAlchemy, PyJWT, Passlib, Uvicorn dependencies' }
    ]
  },
  {
    name: 'frontend/',
    type: 'dir',
    desc: 'React 18 Vite SPA with Tailwind CSS & Firebase FCM Worker',
    children: [
      { name: 'src/App.jsx', type: 'file', desc: 'Main React router & Auth state context wrapper' },
      { name: 'src/pages/Opportunities.jsx', type: 'file', desc: 'Opportunity feed, filter bar & status poll component' },
      { name: 'src/pages/Chat.jsx', type: 'file', desc: 'Real-time WebSocket multi-channel chat interface' },
      { name: 'src/pages/Admin.jsx', type: 'file', desc: 'CR Admin dashboard for bulk register import & Analytics' },
      { name: 'src/components/Opportunity/ApplicationPoll.jsx', type: 'file', desc: '4-State interactive application poll UI' },
      { name: 'src/components/Notification/FCMToast.jsx', type: 'file', desc: 'In-app Toast popup listener for FCM Web Push' },
      { name: 'public/firebase-messaging-sw.js', type: 'file', desc: 'Background Service Worker for Web Push alerts' },
      { name: 'vite.config.js', type: 'file', desc: 'Vite build tool configuration & server dev proxy' },
      { name: 'vercel.json', type: 'file', desc: 'Vercel SPA rewrite rules config' }
    ]
  },
  {
    name: 'firebase/',
    type: 'dir',
    desc: 'Firebase Admin SDK credentials & Cloud Messaging config'
  },
  { name: 'docker-compose.yml', type: 'file', desc: 'Orchestrates backend FastAPI and MySQL 8.0 local DB container' },
  { name: 'render.yaml', type: 'file', desc: 'Render Web Service deployment manifest' },
  { name: 'README.md', type: 'file', desc: 'Project documentation & developer quickstart guide' }
];

export default function FolderStructureSection() {
  const [expandedDirs, setExpandedDirs] = useState({ 'backend/': true, 'frontend/': true });

  const toggleDir = (dirName) => {
    setExpandedDirs(prev => ({ ...prev, [dirName]: !prev[dirName] }));
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
      <SectionHeader
        id="folder-structure"
        number="9"
        title="Folder Structure & Architecture"
        description="Clean monorepo layout isolating backend services, frontend presentation components, and DevOps configs."
        icon={FolderTree}
        badge="Monorepo Layout"
      />

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-slate-200 font-mono text-xs p-4">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
          <span>PlacementHub Workspace Tree</span>
          <span className="text-blue-400">c:\download\placementhub</span>
        </div>

        <div className="space-y-2">
          {FOLDER_TREE.map((node, idx) => (
            <div key={idx}>
              {node.type === 'dir' ? (
                <div>
                  <button
                    onClick={() => toggleDir(node.name)}
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-bold py-1 transition-colors"
                  >
                    {expandedDirs[node.name] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <Folder className="w-4 h-4 text-blue-400" />
                    <span>{node.name}</span>
                    <span className="text-[10px] text-slate-500 font-sans font-normal ml-2">— {node.desc}</span>
                  </button>

                  {expandedDirs[node.name] && node.children && (
                    <div className="pl-6 border-l border-slate-800 ml-2.5 my-1 space-y-1.5">
                      {node.children.map((child, cIdx) => (
                        <div key={cIdx} className="flex items-start space-x-2 py-0.5 text-slate-300">
                          <FileCode className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-100">{child.name}</span>
                            <span className="text-[10px] text-slate-400 font-sans ml-2">— {child.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 py-1 text-slate-300">
                  <Box className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-bold text-emerald-300">{node.name}</span>
                  <span className="text-[10px] text-slate-400 font-sans ml-2">— {node.desc}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
