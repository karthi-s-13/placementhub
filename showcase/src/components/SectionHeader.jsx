import React from 'react';

export default function SectionHeader({ id, number, title, description, icon: Icon, badge }) {
  return (
    <div id={id} className="scroll-mt-24 mb-7 border-b border-slate-200/90 pb-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-600/20">
            {Icon ? <Icon className="w-4.5 h-4.5 text-white" /> : `#${number}`}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            <span className="text-blue-600 mr-2 font-mono">{number}.</span>
            {title}
          </h2>
        </div>
        {badge && (
          <span className="text-xs bg-blue-50 text-blue-800 font-bold px-3 py-1 rounded-full border border-blue-200 shadow-2xs font-mono">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-slate-600 text-xs sm:text-sm pl-12 leading-relaxed font-normal">
          {description}
        </p>
      )}
    </div>
  );
}
