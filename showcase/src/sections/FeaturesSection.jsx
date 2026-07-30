import React, { useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { Sparkles, Check, Filter } from 'lucide-react';
import { FEATURES } from '../data/showcaseData';

export default function FeaturesSection() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(FEATURES.map(f => f.category))];

  const filteredFeatures = selectedCategory === 'All'
    ? FEATURES
    : FEATURES.filter(f => f.category === selectedCategory);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
      <SectionHeader
        id="features"
        number="2"
        title="Features Breakdown"
        description="Full matrix of 16+ core functionalities built across security, management, real-time suite, and admin analytics."
        icon={Sparkles}
        badge={`${FEATURES.length} Features Included`}
      />

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map((feat) => (
          <div
            key={feat.id}
            className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {feat.category}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                  {feat.badge}
                </span>
              </div>
              
              <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0 stroke-[2.5]" />
                <span>{feat.title}</span>
              </h3>
              
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {feat.desc}
              </p>
            </div>

            {/* Tech Tags */}
            <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
              {feat.tech.map((t, idx) => (
                <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-600 font-mono px-1.5 py-0.5 rounded">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
