import React from 'react';
import {
  Scale,
  Shield,
  FileCheck2,
  ExternalLink,
  Fingerprint,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Coins,
  Scroll,
  Cpu,
  Gavel,
  Zap,
} from 'lucide-react';
import { PatentCaseData } from '../config/genlayer';
import { formatGen, truncateAddress, getStatusMeta } from '../utils/helpers';

interface ForensicBenchProps {
  patent: PatentCaseData | null;
  onOpenChallenge: (patent: PatentCaseData) => void;
  onAdjudicate: (patentId: number) => void;
  actionLoading: boolean;
}

export const ForensicBench: React.FC<ForensicBenchProps> = ({
  patent,
  onOpenChallenge,
  onAdjudicate,
  actionLoading,
}) => {
  if (!patent) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#080C18] h-[calc(100vh-5.5rem)]">
        <div className="h-20 w-20 rounded-2xl bg-[#0E1529] border border-[#C5A059]/40 flex items-center justify-center text-[#E5C158] mb-4 shadow-court-panel">
          <Scale className="h-10 w-10 opacity-70" />
        </div>
        <h3 className="font-cinzel text-xl font-bold text-[#F5EFE0]">
          Select an Archival Docket from the Left Registry
        </h3>
        <p className="text-sm font-cormorant italic text-slate-400 max-w-md mt-2">
          Click any patent case file in the left filing cabinet to summon the dual-chamber forensic collision analyzer.
        </p>
      </main>
    );
  }

  const statusMeta = getStatusMeta(patent.status);
  const isInvalidated = patent.verdict === 'PATENT_INVALIDATED';
  const isUpheld = patent.verdict === 'PATENT_UPHELD_VALID';
  const hasPriorArt = !!patent.prior_art_url;
  const isPending = patent.status === 1;

  // Collision Radar calculations for SVG Circle
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (patent.overlap_score / 100) * circumference;

  return (
    <main className="flex-1 flex flex-col bg-[#080C18] h-[calc(100vh-5.5rem)] overflow-y-auto">
      {/* Upper HUD: Judicial Collision Radar & Case Overview */}
      <section className="p-6 border-b border-[#233257] bg-gradient-to-r from-[#0B1020] via-[#0E1529] to-[#0B1020] relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Case Identity */}
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#080C18] text-[#E5C158] border border-[#C5A059]/40">
                CASE DOCKET #{patent.patent_id}
              </span>
              <span className={`text-[10px] font-cinzel font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.badgeBg}`}>
                {statusMeta.label}
              </span>
              <span className="text-xs font-cormorant italic text-[#C5A059]">
                ({statusMeta.latinMotto})
              </span>
            </div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-black text-[#F5EFE0] tracking-tight">
              {patent.patent_title}
            </h1>
            <p className="text-xs font-serif text-slate-400">
              Enrolled at Block <code className="text-[#E5C158]">#{patent.created_at_block}</code> • Bound by Sovereign Escrow <strong className="text-[#E5C158]">{formatGen(patent.escrow_deposit)} GEN</strong>
            </p>
          </div>

          {/* Circular Collision Radar & Bench Diagnostics */}
          <div className="flex items-center space-x-4 bg-[#080C18]/90 p-3 rounded-2xl border border-[#C5A059]/30 shadow-court-panel">
            {/* SVG Circular Equivalence Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#1E293B"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={patent.overlap_score >= 75 ? '#F43F5E' : patent.overlap_score > 0 ? '#10B981' : '#64748B'}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`font-mono text-base font-black ${patent.overlap_score >= 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {patent.overlap_score}%
                </span>
                <span className="text-[8px] font-cinzel font-bold text-slate-400 uppercase tracking-tighter">
                  Collision
                </span>
              </div>
            </div>

            {/* Metric Readouts */}
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 font-serif text-[11px]">Consensus:</span>
                <span className="font-bold text-[#E5C158]">{patent.confidence}% Concord</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 font-serif text-[11px]">Anticipation:</span>
                <span className={`font-bold ${patent.overlap_score >= 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {patent.overlap_score >= 75 ? 'CRITICAL (≥75%)' : 'DISTINCT (<75%)'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 font-serif text-[11px]">Timelock:</span>
                <span className="font-bold text-indigo-300">
                  {patent.status === 2 ? '24 BLOCKS' : 'CLOSED'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Center Stage: The Dual-Chamber Side-by-Side Comparison Arena */}
      <section className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {/* Left Chamber: Invention Charter & Novelty Claims (Chamber A) */}
        <div className="bg-[#0E1529] rounded-2xl p-5 border border-[#233257] shadow-court-panel flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#233257] mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-lg bg-[#881326]/50 border border-[#C5A059] flex items-center justify-center text-[#E5C158]">
                <Scroll className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-cinzel text-xs font-bold text-[#F5EFE0]">
                  CHAMBER A: INVENTION CHARTER
                </h3>
                <p className="text-[10px] font-cormorant italic text-[#C5A059]">
                  Inventor Claims Specification
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              By: {truncateAddress(patent.inventor)}
            </span>
          </div>

          {/* Formatted Legal Claims Box */}
          <div className="flex-1 bg-[#080C18] p-4 rounded-xl border border-[#233257] font-cormorant text-slate-200 text-sm leading-relaxed space-y-2">
            <div className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider pb-1 border-b border-slate-800">
              § 1. CLAIMS & MATHEMATICAL FORMULATION
            </div>
            <p className="italic text-base text-amber-100/90 leading-relaxed font-serif">
              "{patent.novelty_claims}"
            </p>
          </div>

          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Escrow Bond: <strong className="text-[#E5C158]">{formatGen(patent.escrow_deposit)} GEN</strong></span>
            <span>Term Limit: Block #{patent.expires_at_block}</span>
          </div>
        </div>

        {/* Right Chamber: Prior Art Evidence & Technical Counter-Document (Chamber B) */}
        <div className="bg-[#0E1529] rounded-2xl p-5 border border-[#233257] shadow-court-panel flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#233257] mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-lg bg-rose-950/60 border border-rose-500/60 flex items-center justify-center text-rose-300">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-cinzel text-xs font-bold text-rose-200">
                  CHAMBER B: ADDUCED PRIOR ART
                </h3>
                <p className="text-[10px] font-cormorant italic text-slate-400">
                  Adversary Counter-Evidence
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              Challenger: {truncateAddress(patent.challenger)}
            </span>
          </div>

          {/* If prior art URL exists */}
          {hasPriorArt ? (
            <div className="flex-1 bg-[#080C18] p-4 rounded-xl border border-[#233257] space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-cinzel font-bold text-rose-300">
                  PUBLIC EVIDENCE ARTIFACT
                </span>
                <a
                  href={patent.prior_art_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-serif text-[#E5C158] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Open Primary Source</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="p-2.5 rounded-lg bg-[#121D38] border border-[#233257] font-mono text-[11px] text-slate-300 break-all">
                {patent.prior_art_url}
              </div>

              {patent.evidence_hash && (
                <div className="p-2 rounded-lg bg-[#0E162B] border border-[#C5A059]/30 text-[11px] font-mono flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-[#E5C158] flex-shrink-0" />
                  <span className="text-[#C5A059] font-bold">SHA-256 Seal:</span>
                  <span className="text-slate-300 truncate" title={patent.evidence_hash}>
                    {patent.evidence_hash}
                  </span>
                </div>
              )}

              {/* Inquest notice if pending */}
              {isPending && (
                <div className="mt-auto p-3 rounded-lg bg-amber-950/40 border border-amber-600/50 text-center text-xs">
                  <p className="text-amber-200 font-cinzel font-bold mb-1">
                    Indictment Filed • AI Bench Convening
                  </p>
                  <button
                    onClick={() => onAdjudicate(patent.patent_id)}
                    disabled={actionLoading}
                    className="mt-1 px-4 py-1.5 rounded-lg text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#E5C158] to-[#C5A059] shadow-gold-glow"
                  >
                    Trigger GenLayer AI Scraping & Deliberation
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* No challenge filed yet */
            <div className="flex-1 bg-[#080C18] p-6 rounded-xl border border-dashed border-[#233257] flex flex-col items-center justify-center text-center">
              <Shield className="h-10 w-10 text-emerald-500 mb-2 opacity-70" />
              <h4 className="font-cinzel text-sm font-bold text-[#F5EFE0]">
                No Prior Art Indictment Filed Yet
              </h4>
              <p className="text-xs font-cormorant italic text-slate-400 mt-1 max-w-xs">
                This patent claim remains unassailed in the High Court Rolls. Any researcher or AI Agent may file an indictment by staking a 10% bond.
              </p>
              <button
                onClick={() => onOpenChallenge(patent)}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-cinzel font-bold text-white bg-[#881326] hover:bg-[#A31B32] border border-[#C5A059]/60 shadow-burgundy-glow"
              >
                Stake Bond & File Collision Indictment
              </button>
            </div>
          )}

          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Challenger Bond: <strong className="text-rose-400">{formatGen(patent.challenger_bond)} GEN</strong></span>
            <span>Status: {statusMeta.label}</span>
          </div>
        </div>
      </section>

      {/* Lower Bench: Official AI Forensic Rationale & Decree */}
      {patent.verdict && patent.verdict !== 'PENDING' && (
        <section className="p-6 pt-0">
          <div className={`rounded-2xl p-6 border shadow-court-panel ${isInvalidated ? 'bg-rose-950/30 border-rose-600/60' : isUpheld ? 'bg-teal-950/30 border-teal-600/60' : 'bg-purple-950/30 border-purple-600/60'}`}>
            <div className="flex items-center space-x-2.5 mb-3">
              {isInvalidated ? (
                <AlertOctagon className="h-6 w-6 text-rose-400" />
              ) : isUpheld ? (
                <CheckCircle2 className="h-6 w-6 text-teal-400" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-purple-400" />
              )}
              <h3 className="font-cinzel text-base font-bold text-amber-100 uppercase tracking-wider">
                Official Bench Verdict: {patent.verdict.replace('_', ' ')}
              </h3>
            </div>

            <div className="bg-[#080C18]/80 p-4 rounded-xl border border-[#233257] font-cormorant text-base text-slate-200 leading-relaxed italic">
              "{patent.reason}"
            </div>

            {/* Cooling-off / Dispute status banner */}
            {patent.status === 2 && (
              <div className="mt-3 p-3 bg-indigo-950/60 border border-indigo-500/60 rounded-xl text-xs text-indigo-200 flex items-center justify-between">
                <span className="font-serif">
                  ⚖️ <strong>24-Block Cooling-Off Timelock Active:</strong> Appeal window closes at Block #{patent.payout_ready_at_block}.
                </span>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
};
