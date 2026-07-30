import React from 'react';
import SectionHeader from '../components/SectionHeader';
import { Layers, Atom, Zap, Palette, Feather, BellRing, Server, Database, Lock, ShieldCheck, Cpu, HardDrive, Radio, Send, Mail, Box, Globe, Cloud } from 'lucide-react';
import { TECH_STACK } from '../data/showcaseData';

const ICON_MAP = {
  Atom, Zap, Palette, Feather, BellRing, Server, Database, Lock, ShieldCheck, Cpu, HardDrive, Layers, Radio, Send, Mail, Box, Globe, Cloud
};

export default function TechStackSection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
      <SectionHeader
        id="tech-stack"
        number="4"
        title="Tech Stack & Tooling"
        description="Comprehensive list of production technologies chosen for performance, type safety, and real-time capabilities."
        icon={Layers}
        badge="Modern Stack"
      />

      <div className="space-y-6">
        {Object.entries(TECH_STACK).map(([categoryKey, items]) => {
          const formattedCategory = categoryKey.toUpperCase();
          return (
            <div key={categoryKey} className="border border-slate-200/80 rounded-xl overflow-hidden">
              <div className="bg-slate-100/80 px-4 py-2.5 font-bold text-slate-800 text-xs tracking-wider border-b border-slate-200 flex items-center justify-between">
                <span>{formattedCategory} SPECIFICATION</span>
                <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono">{items.length} Tech Tools</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-slate-50/40">
                {items.map((tech, idx) => {
                  const IconComponent = ICON_MAP[tech.icon] || Layers;
                  return (
                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-start space-x-3 hover:border-blue-300 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{tech.name}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{tech.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
