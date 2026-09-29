import React from 'react';
import { Shield, Lock, FileSearch, Gavel, UserCheck, Sparkles } from 'lucide-react';
import { ProtocolStats } from '../config/genlayer';
import { formatGen, truncateAddress } from '../utils/helpers';

interface StatsBarProps {
  stats: ProtocolStats;
  loading: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Imperial Rolls of Inventions */}
      <div className="bg-[#0E162B] rounded-2xl p-5 border border-[#C5A059]/30 shadow-court-panel relative overflow-hidden group hover:border-[#C5A059]/70 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-[#C5A059]/10 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-[#C5A059]">
              Patents Enrolled
            </p>
            <p className="mt-1 font-cinzel text-3xl font-black text-[#F5EFE0] tracking-tight">
              {loading ? '—' : stats.total_patents}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-[#881326]/40 border border-[#C5A059]/40 flex items-center justify-center text-[#E5C158] shadow-inner">
            <Shield className="h-5 w-5 text-[#E5C158]" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] font-cormorant italic text-slate-300">
          <span className="font-semibold text-[#E5C158]">Sub Sigillo Curiae</span>
          <span className="mx-1.5 text-slate-600">•</span>
          <span>Formal specification on-chain</span>
        </div>
      </div>

      {/* Escrow Bond Vault */}
      <div className="bg-[#0E162B] rounded-2xl p-5 border border-[#C5A059]/30 shadow-court-panel relative overflow-hidden group hover:border-[#C5A059]/70 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-[#E5C158]/10 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-[#C5A059]">
              Locked Vault Escrow
            </p>
            <p className="mt-1 font-cinzel text-3xl font-black text-[#E5C158] tracking-tight">
              {loading ? '—' : `${formatGen(stats.total_patent_locked)}`}
              <span className="text-sm font-sans font-normal text-slate-400 ml-1">GEN</span>
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-[#121D38] border border-[#C5A059]/50 flex items-center justify-center text-[#E5C158] shadow-inner">
            <Lock className="h-5 w-5 text-[#E5C158]" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] font-cormorant italic text-slate-300">
          <span className="font-semibold text-emerald-400">Guaranteed Custody</span>
          <span className="mx-1.5 text-slate-600">•</span>
          <span>Zero loss protocol invariants</span>
        </div>
      </div>

      {/* Active Tribunal Inquests */}
      <div className="bg-[#0E162B] rounded-2xl p-5 border border-[#C5A059]/30 shadow-court-panel relative overflow-hidden group hover:border-[#C5A059]/70 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-[#881326]/20 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-[#C5A059]">
              Active Inquests
            </p>
            <p className="mt-1 font-cinzel text-3xl font-black text-amber-300 tracking-tight">
              {loading ? '—' : stats.active_examinations ?? 0}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-950/40 border border-amber-600/40 flex items-center justify-center text-amber-300 shadow-inner">
            <FileSearch className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] font-cormorant italic text-slate-300">
          <span className="font-semibold text-amber-300">Sub Judice</span>
          <span className="mx-1.5 text-slate-600">•</span>
          <span>24-Block cooling-off timelock</span>
        </div>
      </div>

      {/* Sovereign Decrees Executed */}
      <div className="bg-[#0E162B] rounded-2xl p-5 border border-[#C5A059]/30 shadow-court-panel relative overflow-hidden group hover:border-[#C5A059]/70 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-[#C5A059]">
              Decrees Handed Down
            </p>
            <p className="mt-1 font-cinzel text-3xl font-black text-[#F5EFE0] tracking-tight">
              {loading ? '—' : stats.total_disputes_resolved}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-950/40 border border-emerald-600/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Gavel className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] font-cormorant italic text-slate-300">
          <span className="font-semibold text-emerald-400">Autonomous Settlement</span>
          <span className="mx-1.5 text-slate-600">•</span>
          <span>GenLayer Multi-Validator AI Consensus</span>
        </div>
      </div>
    </div>
  );
};
