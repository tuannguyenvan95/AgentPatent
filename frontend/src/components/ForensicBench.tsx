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
  Cpu,
  Gavel,
  Zap,
  Terminal,
  Crosshair,
  Radio,
  FileCode,
  ShieldAlert,
  ArrowRightLeft,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { PatentCaseData } from '../config/genlayer';
import { formatGen, truncateAddress, getStatusMeta } from '../utils/helpers';

interface ForensicBenchProps {
  patent: PatentCaseData | null;
  onOpenChallenge: (patent: PatentCaseData) => void;
  onAdjudicate: (patentId: number | string) => void;
  onReclaimExpired?: (patentId: number | string) => void;
  actionLoading: boolean;
  userAddress?: string;
}

export const ForensicBench: React.FC<ForensicBenchProps> = ({
  patent,
  onOpenChallenge,
  onAdjudicate,
  onReclaimExpired,
  actionLoading,
  userAddress,
}) => {
  if (!patent) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#070A11] h-[calc(100vh-4rem)] relative overflow-hidden">
        {/* Radar Background grid decoration */}
        <div className="absolute inset-0 bg-cyber-grid bg-[size:30px_30px] opacity-15 pointer-events-none" />
        <div className="h-20 w-20 rounded-2xl bg-[#0A0E17] border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_25px_rgba(6,182,212,0.25)] relative">
          <div className="absolute inset-0 rounded-2xl border border-cyan-400/20 animate-ping" />
          <Crosshair className="h-10 w-10 opacity-80" />
        </div>
        <h3 className="font-space text-lg font-bold text-slate-100 uppercase tracking-wider">
          AWAITING DOSSIER SELECTION // RADAR STANDBY
        </h3>
        <p className="text-xs font-mono text-slate-400 max-w-md mt-2">
          Select an active patent dossier from the left archive matrix to engage the dual-chamber AI collision forensic analyzer.
        </p>
      </main>
    );
  }

  const statusMeta = getStatusMeta(patent.status);
  const isInvalidated = patent.verdict === 'PATENT_INVALIDATED';
  const isUpheld = patent.verdict === 'PATENT_UPHELD_VALID';
  const hasPriorArt = !!patent.prior_art_url;
  const isPending = patent.status === 1;
  const isInventor = Boolean(
    userAddress &&
    patent.inventor &&
    userAddress.toLowerCase() === patent.inventor.toLowerCase()
  );
  const nowSec = Math.floor(Date.now() / 1000);
  const isExpired = patent.expires_at_time ? nowSec > Number(patent.expires_at_time) : false;

  // Collision Radar calculations for SVG Circle
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (patent.overlap_score / 100) * circumference;

  return (
    <main className="flex-1 flex flex-col bg-[#070A11] h-[calc(100vh-4rem)] overflow-y-auto relative">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-cyber-grid bg-[size:36px_36px] opacity-15 pointer-events-none" />

      {/* Upper HUD: Judicial Collision Radar & Case Overview */}
      <section className="p-6 border-b border-[#1E293B] bg-gradient-to-r from-[#0A0E17] via-[#0F1523] to-[#0A0E17] relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Case Identity */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#070A11] text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                CASE DOSSIER #{patent.patent_id}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border flex items-center gap-1.5 ${statusMeta.badgeBg}`}
              >
                <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                {statusMeta.label}
              </span>
              <span className="text-xs font-mono text-cyan-400/80">
                [{statusMeta.latinMotto}]
              </span>
            </div>
            <h1 className="font-space text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {patent.patent_title}
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Anchored Block <code className="text-cyan-300 font-bold">#{patent.created_at_block}</code> • Escrow Vault Stake: <strong className="text-teal-300">{formatGen(patent.escrow_deposit)} GEN</strong>
            </p>
          </div>

          {/* Circular Collision Radar & Bench Diagnostics */}
          <div className="flex items-center space-x-5 bg-[#0A0E17]/95 p-3.5 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative">
            {/* SVG Circular Equivalence Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#1E293B"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={patent.overlap_score >= 75 ? '#F43F5E' : patent.overlap_score > 0 ? '#14B8A6' : '#64748B'}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span
                  className={`font-mono text-base font-black ${
                    patent.overlap_score >= 75
                      ? 'text-rose-400'
                      : patent.overlap_score > 0
                      ? 'text-teal-400'
                      : 'text-slate-400'
                  }`}
                >
                  {patent.overlap_score}%
                </span>
                <span className="text-[8px] font-space font-bold text-slate-400 uppercase tracking-tighter">
                  COLLISION
                </span>
              </div>
            </div>

            {/* Metric Readouts */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 text-[11px]">Consensus:</span>
                <span className="font-bold text-cyan-300">{patent.confidence}% Concord</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 text-[11px]">Status Matrix:</span>
                <span
                  className={`font-bold ${
                    patent.overlap_score >= 75
                      ? 'text-rose-400'
                      : patent.overlap_score > 0
                      ? 'text-teal-400'
                      : 'text-slate-400'
                  }`}
                >
                  {patent.overlap_score >= 75
                    ? 'COLLISION CRITICAL (≥75%)'
                    : patent.overlap_score > 0
                    ? 'NOVEL DISTINCT (<75%)'
                    : 'UNCONTESTED'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 text-[11px]">Timelock Cooling:</span>
                <span className="font-bold text-indigo-300">
                  {patent.status === 2 ? '24 BLOCKS ACTIVE' : 'LOCKED / DORMANT'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Center Stage: The Dual-Chamber Side-by-Side Comparison Arena */}
      <section className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Left Chamber: Invention Charter & Novelty Claims (Chamber A) */}
        <div className="bg-[#0A0E17]/90 rounded-2xl p-5 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col relative">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded-lg bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-300">
                <FileCode className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-space text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  CHAMBER A // INVENTOR CLAIMS
                </h3>
                <p className="text-[10px] font-mono text-slate-400">
                  Primary Novelty Formulation & Algorithms
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] text-cyan-400/70">
              Lead: {truncateAddress(patent.inventor)}
            </span>
          </div>

          {/* Formatted Legal Claims Box */}
          <div className="flex-1 bg-[#070A11] p-4 rounded-xl border border-[#1E293B] font-mono text-slate-200 text-xs leading-relaxed space-y-2">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider pb-1 border-b border-[#1E293B] flex items-center justify-between">
              <span>// SPECIFICATION FORMULATION</span>
              <span className="text-slate-500">SHA-256 VERIFIED</span>
            </div>
            <p className="text-cyan-100/90 leading-relaxed font-mono whitespace-pre-wrap">
              "{patent.novelty_claims}"
            </p>
          </div>

          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-[#1E293B]">
            <span>Escrow Stake: <strong className="text-teal-300">{formatGen(patent.escrow_deposit)} GEN</strong></span>
            <span>Expiry Block: <strong className="text-cyan-300">#{patent.expires_at_block}</strong></span>
          </div>
        </div>

        {/* Right Chamber: Prior Art Evidence & Technical Counter-Document (Chamber B) */}
        <div className="bg-[#0A0E17]/90 rounded-2xl p-5 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)] flex flex-col relative">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded-lg bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-rose-300">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-space text-xs font-bold text-rose-300 uppercase tracking-wider">
                  CHAMBER B // ADDUCED PRIOR ART
                </h3>
                <p className="text-[10px] font-mono text-slate-400">
                  Adversary Counter-Evidence & Literature
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] text-rose-400/70">
              Challenger: {hasPriorArt ? truncateAddress(patent.challenger) : 'Uncontested (Open)'}
            </span>
          </div>

          {/* If prior art URL exists */}
          {hasPriorArt ? (
            <div className="flex-1 bg-[#070A11] p-4 rounded-xl border border-[#1E293B] space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-space font-bold uppercase tracking-wider text-rose-400">
                  PUBLIC EVIDENCE ARTIFACT
                </span>
                <a
                  href={patent.prior_art_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 font-semibold"
                >
                  <span>Open Primary Source</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F1523] border border-[#1E293B] font-mono text-[11px] text-cyan-100 break-all">
                {patent.prior_art_url}
              </div>

              {patent.evidence_hash && (
                <div className="p-2 rounded-lg bg-[#0A0E17] border border-cyan-500/30 text-[11px] font-mono flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                  <span className="text-cyan-400 font-bold">SHA-256 Digest:</span>
                  <span className="text-slate-300 truncate" title={patent.evidence_hash}>
                    {patent.evidence_hash}
                  </span>
                </div>
              )}

              {/* Inquest notice if pending */}
              {isPending && (
                <div className="mt-auto p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-center text-xs">
                  <p className="text-amber-300 font-space font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 animate-pulse text-amber-400" />
                    Challenge Recorded • AI Multi-Validator Deliberation Ready
                  </p>
                  <button
                    onClick={() => onAdjudicate(patent.patent_id)}
                    disabled={actionLoading}
                    className="w-full py-2 px-3 rounded-lg text-xs font-space font-bold uppercase tracking-wider text-[#070A11] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
                  >
                    Run GenLayer Web Scrape & Consensus Engine
                  </button>
                </div>
              )}
            </div>
          ) : isExpired ? (
            /* No challenge filed & term expired uncontested */
            <div className="flex-1 bg-[#070A11] p-6 rounded-xl border border-dashed border-emerald-500/30 flex flex-col items-center justify-center text-center">
              <ShieldCheck className="h-10 w-10 text-emerald-400 mb-2 opacity-90" />
              <h4 className="font-space text-sm font-bold text-emerald-300 uppercase tracking-wider">
                PROTECTION TERM LAPSED // UNCONTESTED
              </h4>
              <p className="text-xs font-mono text-slate-400 mt-1 max-w-xs">
                This patent claim survived the public examination window without any prior art challenges. Novelty is confirmed by default on-chain.
              </p>
              {isInventor ? (
                <div className="mt-4 flex flex-col items-center gap-1.5 w-full max-w-xs">
                  <button
                    onClick={() => onReclaimExpired && onReclaimExpired(patent.patent_id)}
                    disabled={actionLoading}
                    className="w-full px-4 py-2.5 rounded-lg text-xs font-space font-bold uppercase tracking-wider text-[#070A11] bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-98 flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4 stroke-[2.5]" />
                    <span>Reclaim Escrow ({formatGen(patent.escrow_deposit)} GEN)</span>
                  </button>
                  <p className="text-[10px] font-mono text-emerald-400">
                    Term expired safely. You can now reclaim your full escrow deposit.
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-2.5 rounded-lg bg-[#0F1523] border border-slate-700 text-xs font-mono text-slate-400 max-w-xs">
                  Protection period ended. Prior art challenges are closed.
                </div>
              )}
            </div>
          ) : (
            /* No challenge filed yet */
            <div className="flex-1 bg-[#070A11] p-6 rounded-xl border border-dashed border-[#1E293B] flex flex-col items-center justify-center text-center">
              <Shield className="h-10 w-10 text-teal-400 mb-2 opacity-80" />
              <h4 className="font-space text-sm font-bold text-slate-100 uppercase tracking-wider">
                NO PRIOR ART COLLISION FILED
              </h4>
              <p className="text-xs font-mono text-slate-400 mt-1 max-w-xs">
                This patent claim remains uncontested in the GenLayer High Court Rolls. Any researcher or AI Agent may challenge by staking a 10% bond.
              </p>
              {isInventor ? (
                <div className="mt-4 flex flex-col items-center gap-1.5 w-full max-w-xs">
                  <button
                    disabled
                    className="w-full px-4 py-2 rounded-lg text-xs font-space font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 border border-slate-700 cursor-not-allowed opacity-75"
                    title="Inventor cannot challenge their own patent. Please switch wallet in MetaMask."
                  >
                    Self-Challenge Barred (Inventor)
                  </button>
                  <p className="text-[10px] font-mono text-amber-400">
                    Switch to Account 2 in MetaMask to challenge as a competitor
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => onOpenChallenge(patent)}
                  className="mt-4 px-4 py-2 rounded-lg text-xs font-space font-bold uppercase tracking-wider text-white bg-rose-950/80 hover:bg-rose-900 border border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all"
                >
                  Stake Bond & File Collision Audit
                </button>
              )}
            </div>
          )}

          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-[#1E293B]">
            <span>Challenger Bond: <strong className="text-rose-400">{formatGen(patent.challenger_bond)} GEN</strong></span>
            <span>Docket Status: <span className="text-cyan-400">{statusMeta.label}</span></span>
          </div>
        </div>
      </section>

      {/* Lower Bench: Official AI Forensic Rationale & Decree */}
      {patent.verdict && patent.verdict !== 'PENDING' && (
        <section className="p-6 pt-0 relative z-10">
          <div
            className={`rounded-2xl p-5 border ${
              isInvalidated
                ? 'bg-rose-950/20 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                : isUpheld
                ? 'bg-teal-950/20 border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]'
                : 'bg-purple-950/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
            }`}
          >
            <div className="flex items-center space-x-2.5 mb-3">
              {isInvalidated ? (
                <AlertOctagon className="h-6 w-6 text-rose-400" />
              ) : isUpheld ? (
                <CheckCircle2 className="h-6 w-6 text-teal-400" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-purple-400" />
              )}
              <h3 className="font-space text-sm font-bold text-slate-100 uppercase tracking-wider">
                GENVM AI MULTI-VALIDATOR FORENSIC RATIONALE // {patent.verdict}
              </h3>
            </div>

            <div className="bg-[#070A11] p-4 rounded-xl border border-[#1E293B] font-mono text-xs text-cyan-100/90 leading-relaxed">
              <span className="text-slate-500 block text-[10px] mb-1 pb-1 border-b border-[#1E293B]">
                // CONSENSUS DECREE CITATION
              </span>
              "{patent.reason}"
            </div>

            {/* Cooling-off / Dispute status banner */}
            {patent.status === 2 && (
              <div className="mt-3 p-3 bg-indigo-950/40 border border-indigo-500/50 rounded-xl text-xs text-indigo-200 flex items-center justify-between font-mono">
                <span>
                  ⚖️ <strong>24-BLOCK COOLING-OFF TIMELOCK ACTIVE:</strong> Dispute window closes at Block #{patent.payout_ready_at_block}.
                </span>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
};
