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
  Scroll,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0E162B] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#C5A059]/60 relative my-8 text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#233257]">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#121D38] to-[#080C18] border border-[#C5A059] flex items-center justify-center text-[#E5C158] shadow-inner">
              <Gavel className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-cinzel text-xl font-bold text-[#F5EFE0]">
                  High Bench Examination Critique
                </h2>
                <span className={`text-[10px] font-cinzel font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusMeta.badgeBg}`}>
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-xs font-cormorant italic text-[#C5A059]">
                Judicial Case Docket #{patent.patent_id} • Subjective AI Consensus Record
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
        <div className="mt-4 p-4 bg-[#080C18] rounded-xl border border-[#233257]">
          <p className="text-[10px] font-cinzel font-bold text-[#C5A059] uppercase tracking-wider mb-1">
            Examined Invention Specification
          </p>
          <h3 className="font-cinzel text-base font-bold text-amber-100 mb-2">
            {patent.patent_title}
          </h3>
          <p className="text-sm font-cormorant text-slate-300 bg-[#121D38] p-3 rounded-lg border border-[#233257] leading-relaxed italic">
            "{patent.novelty_claims}"
          </p>
        </div>

        {/* Prior Art Evidence Filed */}
        {patent.prior_art_url && (
          <div className="mt-3 p-3.5 bg-[#080C18] rounded-xl border border-[#233257] text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-cinzel font-bold text-slate-300 flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-[#C5A059]" />
                Adduced Prior Art Document:
              </span>
              <a
                href={patent.prior_art_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E5C158] hover:underline inline-flex items-center gap-1 font-serif text-[11px]"
              >
                <span>Inspect Evidence URL</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="font-mono text-[11px] text-slate-400 break-all bg-[#121D38] p-2 rounded-lg border border-[#233257]">
              {patent.prior_art_url}
            </p>

            {patent.evidence_hash && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Fingerprint className="h-3.5 w-3.5 text-[#E5C158] flex-shrink-0" />
                <span className="font-cinzel font-semibold text-[#C5A059]">Immutable SHA-256 Snapshot Seal:</span>
                <span className="font-mono text-slate-300 truncate max-w-xs" title={patent.evidence_hash}>
                  {patent.evidence_hash}
                </span>
              </div>
            )}
          </div>
        )}

        {/* If Inquest Pending */}
        {isPending && (
          <div className="mt-4 p-5 rounded-xl bg-amber-950/30 border border-amber-600/50 text-center">
            <Clock className="h-8 w-8 text-amber-400 mx-auto mb-2 animate-pulse" />
            <h4 className="font-cinzel font-bold text-amber-200 text-sm">
              Bill of Indictment Filed — Awaiting Bench Deliberation
            </h4>
            <p className="text-xs font-cormorant italic text-slate-300 mt-1 max-w-md mx-auto">
              Adversary has staked {formatGen(patent.challenger_bond)} GEN. Convene the Autonomous GenLayer AI Patent Examination Bench to render and inspect the cited publication live on-chain.
            </p>
            {onAdjudicate && (
              <button
                onClick={() => onAdjudicate(patent.patent_id)}
                disabled={adjudicating}
                className="mt-3.5 inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#E5C158] to-[#C5A059] hover:from-white hover:to-[#E5C158] shadow-gold-glow transition-all"
              >
                <span>{adjudicating ? 'Bench in Deliberation...' : 'Convene Bench & Adjudicate Collision'}</span>
              </button>
            )}
          </div>
        )}

        {/* Deliberation Findings */}
        {!isPending && patent.verdict && patent.verdict !== 'PENDING' && (
          <div className="mt-4 space-y-3">
            {/* Metric Bars */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#080C18] rounded-xl border border-[#233257]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-cinzel font-semibold text-slate-400">Technical Equivalence</span>
                  <span className={`text-xs font-bold font-mono ${patent.overlap_score >= 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {patent.overlap_score}% Equivalence
                  </span>
                </div>
                <div className="w-full h-2 bg-[#121D38] rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className={`h-full transition-all ${patent.overlap_score >= 75 ? 'bg-rose-500 shadow-burgundy-glow' : 'bg-emerald-500'}`}
                    style={{ width: `${patent.overlap_score}%` }}
                  />
                </div>
                <p className="text-[10px] font-cormorant italic text-slate-400 mt-1">Anticipation threshold: ≥ 75%</p>
              </div>

              <div className="p-3 bg-[#080C18] rounded-xl border border-[#233257]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-cinzel font-semibold text-slate-400">Bench Consensus Confidence</span>
                  <span className="text-xs font-bold font-mono text-[#E5C158]">
                    {patent.confidence}% Confidence
                  </span>
                </div>
                <div className="w-full h-2 bg-[#121D38] rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-[#C5A059] to-[#E5C158] transition-all"
                    style={{ width: `${patent.confidence}%` }}
                  />
                </div>
                <p className="text-[10px] font-cormorant italic text-slate-400 mt-1">Multi-validator semantic concordance</p>
              </div>
            </div>

            {/* Verdict Card */}
            <div className={`p-4 rounded-xl border ${isInvalidated ? 'bg-rose-950/40 border-rose-600/70' : isUpheld ? 'bg-teal-950/40 border-teal-600/70' : 'bg-purple-950/40 border-purple-600/70'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {isInvalidated ? (
                  <AlertOctagon className="h-5 w-5 text-rose-400" />
                ) : isUpheld ? (
                  <CheckCircle2 className="h-5 w-5 text-teal-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-purple-400" />
                )}
                <span className="font-cinzel text-sm font-bold uppercase tracking-wider text-amber-200">
                  Judicial Decree: {patent.verdict.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm font-cormorant text-slate-200 leading-relaxed italic">
                "{patent.reason}"
              </p>
            </div>

            {/* Cooling-off status */}
            {patent.status === 2 && (
              <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/60 text-xs text-indigo-200 flex items-start space-x-2.5">
                <Clock className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="font-serif">
                  <strong className="text-amber-200 font-cinzel">24-Block Legal Grace Window (Indutiae Legales):</strong> Funds remain locked until block{' '}
                  <code className="font-mono text-[#E5C158] font-bold">#{patent.payout_ready_at_block}</code>. Either counselor may lodge a formal writ of appeal before final decree execution.
                </div>
              </div>
            )}

            {/* Under Dispute */}
            {patent.status === 6 && (
              <div className="p-3 rounded-xl bg-orange-950/50 border border-orange-600/70 text-xs text-orange-200 flex items-start space-x-2.5">
                <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="font-serif">
                  <strong className="text-amber-200 font-cinzel">Docket Frozen Under Appellate Writ:</strong> {patent.dispute_reason || 'Contested by party.'} Escrow is sealed pending Lord Chief Justice sovereign arbitration.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-[#233257] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span>Inventor: <strong className="text-slate-200">{truncateAddress(patent.inventor)}</strong></span>
            <span>•</span>
            <span>Challenger: <strong className="text-slate-200">{truncateAddress(patent.challenger)}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-cinzel font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Docket
          </button>
        </div>
      </div>
    </div>
  );
};
