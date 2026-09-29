import React from 'react';
import {
  FolderOpen,
  Search,
  Plus,
  Coins,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Crosshair,
} from 'lucide-react';
import { PatentCaseData } from '../config/genlayer';
import { formatGen, getStatusMeta } from '../utils/helpers';

interface DossierSidebarProps {
  patents: PatentCaseData[];
  selectedPatentId: number | string | null;
  onSelectPatent: (patent: PatentCaseData) => void;
  onOpenRegisterModal: () => void;
  activeTab: 'all' | 'active' | 'in_exam' | 'settled';
  onChangeTab: (tab: 'all' | 'active' | 'in_exam' | 'settled') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  loading: boolean;
}

export const DossierSidebar: React.FC<DossierSidebarProps> = ({
  patents,
  selectedPatentId,
  onSelectPatent,
  onOpenRegisterModal,
  activeTab,
  onChangeTab,
  searchQuery,
  onSearchChange,
  loading,
}) => {
  return (
    <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col bg-[#0A0E17]/95 border-r border-[#06B6D4]/20 h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar Header & Enrollment Trigger */}
      <div className="p-4 border-b border-[#1E293B] bg-[#070A11]/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-[#06B6D4]" />
            <h2 className="font-space text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <span>Dossier Archive</span>
              <span className="text-[10px] text-cyan-400 font-mono">// LAB-01</span>
            </h2>
          </div>
          <span className="font-mono text-[11px] text-cyan-400 px-2 py-0.5 rounded bg-[#070A11] border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
            {patents.length} CASES
          </span>
        </div>

        {/* Enroll Button */}
        <button
          onClick={onOpenRegisterModal}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-space font-bold uppercase tracking-wider text-[#070A11] bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 hover:from-cyan-300 hover:to-teal-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-98"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Register Novelty Patent</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search dossier ID, title, formulation..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-[#070A11] border border-[#1E293B] rounded-lg text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all"
          />
        </div>

        {/* Tabs Filter */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[#070A11] border border-[#1E293B] text-[10px] font-space font-semibold uppercase tracking-wider text-slate-400">
          <button
            onClick={() => onChangeTab('all')}
            className={`py-1 rounded text-center transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onChangeTab('active')}
            className={`py-1 rounded text-center transition-all ${
              activeTab === 'active'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'hover:text-slate-200'
            }`}
          >
            Valid
          </button>
          <button
            onClick={() => onChangeTab('in_exam')}
            className={`py-1 rounded text-center transition-all ${
              activeTab === 'in_exam'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'hover:text-slate-200'
            }`}
          >
            Inquest
          </button>
          <button
            onClick={() => onChangeTab('settled')}
            className={`py-1 rounded text-center transition-all ${
              activeTab === 'settled'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'hover:text-slate-200'
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Dossier Docket Stack List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && patents.length === 0 ? (
          <div className="py-12 text-center text-xs text-cyan-400/70 font-mono animate-pulse flex flex-col items-center gap-2">
            <Cpu className="h-5 w-5 animate-spin text-cyan-400" />
            <span>Scanning decentralized court docket...</span>
          </div>
        ) : patents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            // NO DOSSIER FILES FOUND IN THIS SECTOR
          </div>
        ) : (
          patents.map((patent) => {
            const isSelected = selectedPatentId === patent.patent_id;
            const statusMeta = getStatusMeta(patent.status);

            return (
              <div
                key={patent.patent_id}
                onClick={() => onSelectPatent(patent)}
                className={`group cursor-pointer rounded-xl p-3 border transition-all duration-200 relative ${
                  isSelected
                    ? 'bg-[#0F1D33] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-[1.01]'
                    : 'bg-[#0B101D]/70 border-[#1E293B] hover:border-cyan-500/40 hover:bg-[#0F172A]'
                }`}
              >
                {/* Tech Status Line Accent */}
                <div
                  className={`absolute top-0 left-3 w-8 h-1 rounded-b ${
                    isSelected
                      ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                      : 'bg-[#1E293B] group-hover:bg-cyan-500/50'
                  }`}
                />

                {/* Docket Header */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#070A11] text-cyan-300 border border-cyan-500/30">
                      #{patent.patent_id}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${statusMeta.badgeBg}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {statusMeta.label.split(' ')[0]}
                    </span>
                  </div>

                  {/* Escrow readout */}
                  <span className="font-mono text-[10px] font-bold text-teal-300 flex items-center gap-1">
                    <Coins className="h-3 w-3 text-teal-400" />
                    {formatGen(patent.escrow_deposit)} GEN
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-space text-xs font-bold text-slate-100 leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
                  {patent.patent_title}
                </h4>

                {/* Equivalence Gauge Tag if challenged */}
                {patent.overlap_score > 0 && (
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-[#1E293B]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Crosshair className="h-3 w-3 text-cyan-400" />
                      Collision Index:
                    </span>
                    <span
                      className={`font-bold ${
                        patent.overlap_score >= 75
                          ? 'text-rose-400'
                          : 'text-teal-400'
                      }`}
                    >
                      {patent.overlap_score}% EQUIVALENCE
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
