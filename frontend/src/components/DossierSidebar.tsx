import React from 'react';
import {
  Scroll,
  Search,
  Plus,
  Coins,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { PatentCaseData } from '../config/genlayer';
import { formatGen, getStatusMeta } from '../utils/helpers';

interface DossierSidebarProps {
  patents: PatentCaseData[];
  selectedPatentId: number | null;
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
    <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col bg-[#0B1020] border-r border-[#C5A059]/20 h-[calc(100vh-5.5rem)] overflow-hidden">
      {/* Sidebar Header & Enrollment Trigger */}
      <div className="p-4 border-b border-[#233257] bg-[#0E1529]/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-4 w-4 text-[#E5C158]" />
            <h2 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#F5EFE0]">
              Judicial Rolls
            </h2>
          </div>
          <span className="font-mono text-[11px] text-[#C5A059] px-2 py-0.5 rounded bg-[#080C18] border border-[#C5A059]/30">
            {patents.length} Dockets
          </span>
        </div>

        {/* Enroll Button */}
        <button
          onClick={onOpenRegisterModal}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#FFF6D6] via-[#E5C158] to-[#C5A059] hover:from-white hover:to-[#E5C158] shadow-gold-glow transition-all active:scale-98"
        >
          <Plus className="h-4 w-4 text-[#090E1F]" />
          <span>Enroll New Patent Petition</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search docket, title, or formula..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-serif bg-[#080C18] border border-[#233257] rounded-lg text-amber-100 placeholder-slate-500 focus:outline-none focus:border-[#E5C158]"
          />
        </div>

        {/* Tabs Filter */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[#080C18] border border-[#233257] text-[10px] font-cinzel font-bold text-slate-400">
          <button
            onClick={() => onChangeTab('all')}
            className={`py-1 rounded text-center transition-all ${activeTab === 'all' ? 'bg-[#121D38] text-[#E5C158] shadow-sm font-black' : 'hover:text-slate-200'}`}
          >
            All
          </button>
          <button
            onClick={() => onChangeTab('active')}
            className={`py-1 rounded text-center transition-all ${activeTab === 'active' ? 'bg-[#121D38] text-[#E5C158] shadow-sm font-black' : 'hover:text-slate-200'}`}
          >
            Valid
          </button>
          <button
            onClick={() => onChangeTab('in_exam')}
            className={`py-1 rounded text-center transition-all ${activeTab === 'in_exam' ? 'bg-[#121D38] text-[#E5C158] shadow-sm font-black' : 'hover:text-slate-200'}`}
          >
            Inquest
          </button>
          <button
            onClick={() => onChangeTab('settled')}
            className={`py-1 rounded text-center transition-all ${activeTab === 'settled' ? 'bg-[#121D38] text-[#E5C158] shadow-sm font-black' : 'hover:text-slate-200'}`}
          >
            Decreed
          </button>
        </div>
      </div>

      {/* Dossier Docket Stack List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {loading && patents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-cormorant italic">
            Reading tribunal registries...
          </div>
        ) : patents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-serif">
            No dockets found in this category.
          </div>
        ) : (
          patents.map((patent) => {
            const isSelected = selectedPatentId === patent.patent_id;
            const statusMeta = getStatusMeta(patent.status);

            return (
              <div
                key={patent.patent_id}
                onClick={() => onSelectPatent(patent)}
                className={`group cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative ${
                  isSelected
                    ? 'bg-[#121D38] border-[#C5A059] shadow-gold-glow scale-[1.01]'
                    : 'bg-[#0E1529]/70 border-[#233257] hover:border-[#C5A059]/40 hover:bg-[#121D38]/60'
                }`}
              >
                {/* Dossier Clip Accent */}
                <div className={`absolute top-0 left-4 w-6 h-1 rounded-b ${isSelected ? 'bg-[#E5C158]' : 'bg-[#233257] group-hover:bg-[#C5A059]/50'}`} />

                {/* Docket Header */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#080C18] text-[#E5C158] border border-[#C5A059]/30">
                      #{patent.patent_id}
                    </span>
                    <span className={`text-[9px] font-cinzel font-bold px-1.5 py-0.5 rounded-full border ${statusMeta.badgeBg}`}>
                      {statusMeta.label.split(' ')[0]}
                    </span>
                  </div>

                  {/* Escrow readout */}
                  <span className="font-mono text-[10px] font-bold text-[#E5C158] flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    {formatGen(patent.escrow_deposit)} G
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-cinzel text-xs font-bold text-[#F5EFE0] leading-snug line-clamp-2 group-hover:text-[#E5C158] transition-colors">
                  {patent.patent_title}
                </h4>

                {/* Equivalence Gauge Tag if challenged */}
                {patent.overlap_score > 0 && (
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-[#233257]/60">
                    <span className="text-slate-400">Anticipation:</span>
                    <span className={`font-bold ${patent.overlap_score >= 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {patent.overlap_score}% Equivalence
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
