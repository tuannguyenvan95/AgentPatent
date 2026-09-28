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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  Patent Examination Board Critique
                </h2>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusMeta.badgeBg}`}>
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official Case Docket #{patent.patent_id} • On-Chain GenLayer AI Consensus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Patent Title & Claims */}
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Examined Invention
          </p>
          <h3 className="font-serif text-base font-bold text-slate-900 mb-2">
            {patent.patent_title}
          </h3>
          <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed font-sans">
            "{patent.novelty_claims}"
          </p>
        </div>

        {/* Prior Art Evidence Filed */}
        {patent.prior_art_url && (
          <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-slate-500" />
                Submitted Prior Art Evidence Document:
              </span>
              <a
                href={patent.prior_art_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                <span>View Source</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="font-mono text-[11px] text-slate-600 break-all bg-white p-2 rounded border border-slate-200">
              {patent.prior_art_url}
            </p>

            {patent.evidence_hash && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Fingerprint className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                <span className="font-medium text-slate-700">SHA-256 Snapshot Hash:</span>
                <span className="font-mono text-slate-600 truncate max-w-xs" title={patent.evidence_hash}>
                  {patent.evidence_hash}
                </span>
              </div>
            )}
          </div>
        )}

        {/* If Still Awaiting Examination */}
        {isPending && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-center">
            <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2 animate-bounce" />
            <h4 className="font-semibold text-amber-900 text-sm">
              Challenge Filed — Awaiting Collision Adjudication
            </h4>
            <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
              Challenger has staked {formatGen(patent.challenger_bond)} GEN. Click below to convene the GenLayer AI Patent Examination Board to render the prior art web document.
            </p>
            {onAdjudicate && (
              <button
                onClick={() => onAdjudicate(patent.patent_id)}
                disabled={adjudicating}
                className="mt-3 inline-flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 shadow-sm transition-all"
              >
                <span>{adjudicating ? 'Convening AI Board...' : 'Convene AI Board & Adjudicate'}</span>
              </button>
            )}
          </div>
        )}

        {/* Deliberation Findings (When Verdict Rendered) */}
        {!isPending && patent.verdict && patent.verdict !== 'PENDING' && (
          <div className="mt-4 space-y-3">
            {/* Metric Bars */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-600">Technical Overlap</span>
                  <span className={`text-xs font-bold font-mono ${patent.overlap_score >= 75 ? 'text-rose-600' : 'text-teal-700'}`}>
                    {patent.overlap_score}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${patent.overlap_score >= 75 ? 'bg-rose-500' : 'bg-teal-500'}`}
                    style={{ width: `${patent.overlap_score}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Threshold for invalidation: ≥ 75%</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-600">AI Consensus Confidence</span>
                  <span className="text-xs font-bold font-mono text-indigo-700">
                    {patent.confidence}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all"
                    style={{ width: `${patent.confidence}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Multi-validator semantic agreement</p>
              </div>
            </div>

            {/* Verdict Card */}
            <div className={`p-4 rounded-xl border ${isInvalidated ? 'bg-rose-50/60 border-rose-200' : isUpheld ? 'bg-teal-50/60 border-teal-200' : 'bg-purple-50/60 border-purple-200'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {isInvalidated ? (
                  <AlertOctagon className="h-5 w-5 text-rose-600" />
                ) : isUpheld ? (
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-purple-600" />
                )}
                <span className="font-serif text-sm font-bold uppercase tracking-wider text-slate-900">
                  Verdict: {patent.verdict.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {patent.reason}
              </p>
            </div>

            {/* Dispute / Cooling Off Notice */}
            {patent.status === 2 && (
              <div className="p-3 rounded-lg bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-900 flex items-start space-x-2">
                <Clock className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>24-Block Cooling-Off Window Active:</strong> Funds are locked until block{' '}
                  <code className="font-semibold text-indigo-950 font-mono">#{patent.payout_ready_at_block}</code>. Either party may lodge an on-chain dispute before settlement execution.
                </div>
              </div>
            )}

            {/* Active Dispute Alert */}
            {patent.status === 6 && (
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Case Under Active Dispute:</strong> {patent.dispute_reason || 'Contested by party.'} Escrow is frozen pending Protocol Steward arbitration.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <span>Inventor: <strong className="font-mono text-slate-700">{truncateAddress(patent.inventor)}</strong></span>
            <span>•</span>
            <span>Challenger: <strong className="font-mono text-slate-700">{truncateAddress(patent.challenger)}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close Critique
          </button>
        </div>
      </div>
    </div>
  );
};
