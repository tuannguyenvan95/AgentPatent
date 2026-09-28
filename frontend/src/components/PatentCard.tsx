import React, { useState } from 'react';
import {
  Shield,
  FileSearch,
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Gavel,
  Coins,
} from 'lucide-react';
import { PatentCaseData } from '../config/genlayer';
import { formatGen, truncateAddress, getStatusMeta } from '../utils/helpers';

interface PatentCardProps {
  patent: PatentCaseData;
  userAddress: string;
  platformAdmin?: string;
  onOpenChallenge: (patent: PatentCaseData) => void;
  onOpenExamination: (patent: PatentCaseData) => void;
  onOpenDispute: (patent: PatentCaseData) => void;
  onOpenAdminArbitration: (patent: PatentCaseData) => void;
  onAdjudicate: (patentId: number) => void;
  onFinalizeSettlement: (patentId: number) => void;
  onReclaimExpired: (patentId: number) => void;
  actionLoading: boolean;
}

export const PatentCard: React.FC<PatentCardProps> = ({
  patent,
  userAddress,
  platformAdmin,
  onOpenChallenge,
  onOpenExamination,
  onOpenDispute,
  onOpenAdminArbitration,
  onAdjudicate,
  onFinalizeSettlement,
  onReclaimExpired,
  actionLoading,
}) => {
  const [expanded, setExpanded] = useState(false);
  const statusMeta = getStatusMeta(patent.status);

  const isInventor = userAddress && patent.inventor.toLowerCase() === userAddress.toLowerCase();
  const isChallenger = userAddress && patent.challenger.toLowerCase() === userAddress.toLowerCase();
  const isAdmin = userAddress && platformAdmin && platformAdmin.toLowerCase() === userAddress.toLowerCase();

  return (
    <div className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-md ${statusMeta.borderColor}`}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            Case #{patent.patent_id}
          </span>
          <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusMeta.badgeBg}`}>
            {statusMeta.label}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
          <Coins className="h-3.5 w-3.5 text-teal-600" />
          <span>Escrow: <strong className="text-teal-800">{formatGen(patent.escrow_deposit)} GEN</strong></span>
          {BigInt(patent.challenger_bond || '0') > 0n && (
            <span className="text-rose-600 font-mono text-[11px]">
              (+{formatGen(patent.challenger_bond)} Bond)
            </span>
          )}
        </div>
      </div>

      {/* Patent Title */}
      <div className="mt-3">
        <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">
          {patent.patent_title}
        </h3>
      </div>

      {/* Novelty Claims */}
      <div className="mt-2.5">
        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          {expanded
            ? patent.novelty_claims
            : patent.novelty_claims.length > 180
            ? `${patent.novelty_claims.slice(0, 180)}...`
            : patent.novelty_claims}
        </p>
        {patent.novelty_claims.length > 180 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 mt-1 inline-flex items-center gap-0.5"
          >
            {expanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                <span>Read full specification</span>
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Parties Attribution */}
      <div className="mt-4 pt-3 border-t border-slate-100/80 grid grid-cols-2 gap-2 text-xs text-slate-500">
        <div>
          <span className="text-[11px] text-slate-400 block">Inventor (Applicant):</span>
          <span className="font-mono text-slate-700 font-medium">
            {truncateAddress(patent.inventor)}
            {isInventor && <span className="ml-1 text-[10px] text-teal-700 font-sans font-bold">(You)</span>}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">Challenger:</span>
          <span className="font-mono text-slate-700 font-medium">
            {truncateAddress(patent.challenger)}
            {isChallenger && <span className="ml-1 text-[10px] text-rose-700 font-sans font-bold">(You)</span>}
          </span>
        </div>
      </div>

      {/* Prior Art Evidence Link if challenged */}
      {patent.prior_art_url && (
        <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Prior Art Reference:</span>
            <a
              href={patent.prior_art_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
            >
              <span>Examine Evidence</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          {patent.overlap_score > 0 && (
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Technical Overlap:</span>
              <span className={`font-mono font-bold ${patent.overlap_score >= 75 ? 'text-rose-600' : 'text-teal-700'}`}>
                {patent.overlap_score}% Equivalence
              </span>
            </div>
          )}
        </div>
      )}

      {/* Status Details / Notice */}
      <div className="mt-3 text-[11px] text-slate-500">
        <p>{statusMeta.description}</p>
      </div>

      {/* Actions Toolbar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
        {/* Critique Inspector is always available if challenged or evaluated */}
        {patent.status !== 0 && (
          <button
            onClick={() => onOpenExamination(patent)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
          >
            <FileSearch className="h-3.5 w-3.5 text-slate-600" />
            <span>Critique</span>
          </button>
        )}

        {/* Status 0: ACTIVE_PROTECTED */}
        {patent.status === 0 && (
          <>
            {!isInventor && (
              <button
                onClick={() => onOpenChallenge(patent)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors inline-flex items-center gap-1 active:scale-95"
              >
                <Scale className="h-3.5 w-3.5" />
                <span>Challenge Prior Art</span>
              </button>
            )}
            {isInventor && (
              <button
                onClick={() => onReclaimExpired(patent.patent_id)}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                title="Reclaim escrow deposit after expiration block"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reclaim Escrow</span>
              </button>
            )}
          </>
        )}

        {/* Status 1: IN_EXAMINATION */}
        {patent.status === 1 && (
          <button
            onClick={() => onAdjudicate(patent.patent_id)}
            disabled={actionLoading}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 shadow-xs transition-colors inline-flex items-center gap-1 active:scale-95"
          >
            <Scale className="h-3.5 w-3.5 text-amber-200" />
            <span>Adjudicate Collision</span>
          </button>
        )}

        {/* Status 2: AWAITING_PAYOUT (Cooling-off) */}
        {patent.status === 2 && (
          <>
            {(isInventor || isChallenger) && (
              <button
                onClick={() => onOpenDispute(patent)}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors inline-flex items-center gap-1"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                <span>Lodge Appeal</span>
              </button>
            )}
            <button
              onClick={() => onFinalizeSettlement(patent.patent_id)}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors inline-flex items-center gap-1"
              title="Disburse escrow funds after 24-block dispute window"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
              <span>Finalize Settlement</span>
            </button>
          </>
        )}

        {/* Status 6 or 7: DISPUTED or ESCALATED */}
        {(patent.status === 6 || patent.status === 7) && isAdmin && (
          <button
            onClick={() => onOpenAdminArbitration(patent)}
            disabled={actionLoading}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 shadow-xs transition-colors inline-flex items-center gap-1"
          >
            <Gavel className="h-3.5 w-3.5 text-indigo-300" />
            <span>Steward Arbitration</span>
          </button>
        )}
      </div>
    </div>
  );
};
