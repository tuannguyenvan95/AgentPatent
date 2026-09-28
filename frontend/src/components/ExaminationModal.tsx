import React from 'react';
import {
  X,
  FileCheck2,
  Award,
  AlertTriangle,
  Fingerprint,
  ExternalLink,
  Clock,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Gavel,
  Cpu,
  Terminal,
  Crosshair,
  Radio,
} from 'lucide-react';
import { PatentCaseData } from '../config/genlayer';
import { formatGen, truncateAddress, getStatusMeta } from '../utils/helpers';

interface ExaminationModalProps {
  isOpen: boolean;
  patent: PatentCaseData | null;
  onClose: () => void;
  onAdjudicate?: (patentId: number) => Promise<void>;
  adjudicating?: boolean;
}

export const ExaminationModal: React.FC<ExaminationModalProps> = ({
  isOpen,
  patent,
  onClose,
  onAdjudicate,
  adjudicating,
}) => {
  if (!isOpen || !patent) return null;

  const statusMeta = getStatusMeta(patent.status);
  const isInvalidated = patent.verdict === 'PATENT_INVALIDATED';
  const isUpheld = patent.verdict === 'PATENT_UPHELD_VALID';
  const isPending = patent.status === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0A0E17] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.2)] border border-cyan-500/40 relative my-8 text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1E293B]">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-space text-lg font-bold uppercase tracking-wider text-slate-100">
                  AI Forensic Consensus Critique
                </h2>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusMeta.badgeBg}`}>
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-xs font-mono text-cyan-400">
                Dossier #{patent.patent_id} • GenVM Subjective Multi-Validator Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Examined Title & Claims */}
        <div className="mt-4 p-4 bg-[#070A11] rounded-xl border border-[#1E293B]">
          <p className="text-[10px] font-space font-bold text-cyan-400 uppercase tracking-wider mb-1">
            Examined Invention Specification
          </p>
          <h3 className="font-space text-base font-bold text-slate-100 mb-2">
            {patent.patent_title}
          </h3>
          <p className="text-xs font-mono text-slate-300 bg-[#0F1523] p-3 rounded-lg border border-[#1E293B] leading-relaxed">
            "{patent.novelty_claims}"
          </p>
        </div>

        {/* Prior Art Evidence Filed */}
        {patent.prior_art_url && (
          <div className="mt-3 p-3.5 bg-[#070A11] rounded-xl border border-[#1E293B] text-xs font-mono">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-space font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-rose-400" />
                Adduced Prior Art Document:
              </span>
              <a
                href={patent.prior_art_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 hover:underline inline-flex items-center gap-1 text-[11px]"
              >
                <span>Inspect Evidence URL</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400 break-all bg-[#0F1523] p-2 rounded-lg border border-[#1E293B]">
              {patent.prior_art_url}
            </p>

            {patent.evidence_hash && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Fingerprint className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                <span className="text-cyan-400 font-semibold">Immutable SHA-256 Digest:</span>
                <span className="text-slate-300 truncate max-w-xs" title={patent.evidence_hash}>
                  {patent.evidence_hash}
                </span>
              </div>
            )}
          </div>
        )}

        {/* If Inquest Pending */}
        {isPending && (
          <div className="mt-4 p-5 rounded-xl bg-amber-950/30 border border-amber-500/50 text-center font-mono">
            <Radio className="h-8 w-8 text-amber-400 mx-auto mb-2 animate-pulse" />
            <h4 className="font-space font-bold text-amber-200 text-sm uppercase tracking-wider">
              Collision Audit Recorded — Awaiting Deliberation
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              Challenger has staked {formatGen(patent.challenger_bond)} GEN. Convene the Autonomous GenLayer AI Examination Bench to render and inspect the cited publication live on-chain.
            </p>
            {onAdjudicate && (
              <button
                onClick={() => onAdjudicate(patent.patent_id)}
                disabled={adjudicating}
                className="mt-3.5 inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-space font-bold uppercase tracking-wider text-[#070A11] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
              >
                <span>{adjudicating ? 'Bench in Deliberation...' : 'Convene Bench & Adjudicate Collision'}</span>
              </button>
            )}
          </div>
        )}

        {/* Deliberation Findings */}
        {!isPending && patent.verdict && patent.verdict !== 'PENDING' && (
          <div className="mt-4 space-y-3 font-mono">
            {/* Metric Bars */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#070A11] rounded-xl border border-[#1E293B]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-slate-400 font-space uppercase">Technical Equivalence</span>
                  <span className={`text-xs font-bold ${patent.overlap_score >= 75 ? 'text-rose-400' : 'text-teal-400'}`}>
                    {patent.overlap_score}% Equivalence
                  </span>
                </div>
                <div className="w-full h-2 bg-[#0F1523] rounded-full overflow-hidden border border-[#1E293B]">
                  <div
                    className={`h-full transition-all ${patent.overlap_score >= 75 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-teal-500'}`}
                    style={{ width: `${patent.overlap_score}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Anticipation threshold: ≥ 75%</p>
              </div>

              <div className="p-3 bg-[#070A11] rounded-xl border border-[#1E293B]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-slate-400 font-space uppercase">Validator Consensus</span>
                  <span className="text-xs font-bold text-cyan-300">
                    {patent.confidence}% Concord
                  </span>
                </div>
                <div className="w-full h-2 bg-[#0F1523] rounded-full overflow-hidden border border-[#1E293B]">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all"
                    style={{ width: `${patent.confidence}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Multi-validator semantic concordance</p>
              </div>
            </div>

            {/* Verdict Card */}
            <div className={`p-4 rounded-xl border ${isInvalidated ? 'bg-rose-950/30 border-rose-500/60' : isUpheld ? 'bg-teal-950/30 border-teal-500/60' : 'bg-purple-950/30 border-purple-500/60'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {isInvalidated ? (
                  <AlertOctagon className="h-5 w-5 text-rose-400" />
                ) : isUpheld ? (
                  <CheckCircle2 className="h-5 w-5 text-teal-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-purple-400" />
                )}
                <span className="font-space text-xs font-bold uppercase tracking-wider text-slate-100">
                  Consensus Decree: {patent.verdict.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                "{patent.reason}"
              </p>
            </div>

            {/* Cooling-off status */}
            {patent.status === 2 && (
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/50 text-xs text-indigo-200 flex items-start space-x-2.5">
                <Clock className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300 font-space uppercase">24-Block Legal Grace Window:</strong> Funds remain locked until block{' '}
                  <code className="text-cyan-300 font-bold">#{patent.payout_ready_at_block}</code>. Either counselor may lodge a formal appellate dispute before final settlement execution.
                </div>
              </div>
            )}

            {/* Under Dispute */}
            {patent.status === 6 && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/60 text-xs text-amber-200 flex items-start space-x-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-space uppercase">Dossier Frozen Under Dispute:</strong> {patent.dispute_reason || 'Contested by party.'} Escrow is sealed pending Protocol Admin arbitration.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span>Inventor: <strong className="text-cyan-300">{truncateAddress(patent.inventor)}</strong></span>
            <span>•</span>
            <span>Challenger: <strong className="text-rose-300">{truncateAddress(patent.challenger)}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-space font-semibold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
