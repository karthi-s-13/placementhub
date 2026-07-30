import React, { useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { Database, Table, Key, HardDrive, CheckCircle2, ChevronRight } from 'lucide-react';
import { DATABASE_SCHEMAS } from '../data/showcaseData';

export default function DatabaseSection() {
  const [activeTable, setActiveTable] = useState(DATABASE_SCHEMAS[0].table);

  const currentSchema = DATABASE_SCHEMAS.find(s => s.table === activeTable) || DATABASE_SCHEMAS[0];

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
      <SectionHeader
        id="database"
        number="5"
        title="Database Design & Schema Inspector"
        description="Normalized MySQL 8.0 relational schema mapped via SQLAlchemy ORM with foreign key cascades and composite indexes."
        icon={Database}
        badge="11 Relational Tables"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table Selector Sidebar */}
        <div className="lg:col-span-1 border border-slate-200 rounded-xl p-2 bg-slate-50">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
            Database Tables
          </div>
          <div className="space-y-1">
            {DATABASE_SCHEMAS.map((s) => (
              <button
                key={s.table}
                onClick={() => setActiveTable(s.table)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all text-left ${
                  activeTable === s.table
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Table className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{s.table}</span>
                </div>
                <ChevronRight className={`w-3 h-3 ${activeTable === s.table ? 'text-white' : 'text-slate-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Schema Viewer Table */}
        <div className="lg:col-span-3 border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-mono font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Table className="w-4 h-4 text-blue-600" />
                <span>`{currentSchema.table}`</span>
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">{currentSchema.desc}</p>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
              {currentSchema.columns.length} Columns
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Column Name</th>
                  <th className="px-4 py-2.5">Data Type</th>
                  <th className="px-4 py-2.5">Key / Constraint</th>
                  <th className="px-4 py-2.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {currentSchema.columns.map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{col.name}</td>
                    <td className="px-4 py-2.5 text-blue-600">{col.type}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                        col.key.includes('PK')
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : col.key.includes('FK')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {col.key.includes('PK') && <Key className="w-2.5 h-2.5 mr-1 text-amber-600" />}
                        <span>{col.key}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 font-sans">{col.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Relational Constraints Highlights */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
        <h4 className="font-bold text-slate-900 mb-2">Relational Foreign Key Rules & Cascades</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-600">
          <div>• <strong className="text-slate-900">`opportunity_views`</strong>: ON DELETE CASCADE with `opportunities` & `users` to prevent orphan read receipts.</div>
          <div>• <strong className="text-slate-900">`application_statuses`</strong>: Composite Unique key `(opportunity_id, user_id)` for clean status upserts.</div>
          <div>• <strong className="text-slate-900">`fcm_tokens`</strong>: ON DELETE CASCADE purging registered FCM tokens when a user account is deleted.</div>
        </div>
      </div>
    </section>
  );
}
