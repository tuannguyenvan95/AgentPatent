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
  Gavel,
  Coins,
  Scroll,
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

  const getSealClass = () => {
    switch (statusMeta.sealType) {
      case 'red':
        return 'wax-seal-red text-rose-100';
      case 'green':
        return 'wax-seal-green text-emerald-100';
      case 'amber':
        return 'wax-seal-amber text-amber-100';
      default:
        return 'bg-slate-800 border-2 border-[#C5A059] text-slate-300';
    }
  };

  return (
    <div className={`bg-[#0E162B] rounded-2xl p-6 border transition-all duration-300 hover:shadow-gold-glow relative overflow-hidden ${statusMeta.borderColor}`}>
      {/* Decorative Gold Leaf Border Corner */}
      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 H100 V100 Z" fill="#C5A059" />
        </svg>
      </div>

      {/* Docket Header & Wax Seal Emblem */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#233257]">
        <div className="flex items-center space-x-2.5">
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#080C18] text-[#E5C158] border border-[#C5A059]/40 shadow-inner">
            DOCKET #{patent.patent_id}
          </span>
          <div>
            <span className={`text-[10px] font-cinzel font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusMeta.badgeBg}`}>
              {statusMeta.label}
            </span>
            <p className="text-[10px] font-cormorant italic text-[#C5A059] mt-0.5">
              {statusMeta.latinMotto}
            </p>
          </div>
        </div>

        {/* Wax Seal Badge on Card */}
        <div className="flex items-center space-x-2">
          <div className={`h-8 px-2.5 rounded-full flex items-center justify-center text-[10px] font-cinzel font-black tracking-wider uppercase shadow-md ${getSealClass()}`}>
            <span>§ {statusMeta.sealType === 'red' ? 'VOID' : statusMeta.sealType === 'green' ? 'RATUM' : 'PENDING'}</span>
          </div>
        </div>
      </div>

      {/* Patent Escrow Staked */}
      <div className="mt-3 flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-[#080C18]/60 border border-[#C5A059]/20">
        <span className="font-cinzel text-slate-400 flex items-center gap-1.5">
          <Coins className="h-3.5 w-3.5 text-[#E5C158]" />
          Validity Bond Escrow:
        </span>
        <div className="flex items-center space-x-1.5 font-mono">
          <strong className="text-[#E5C158] font-bold text-sm">{formatGen(patent.escrow_deposit)} GEN</strong>
          {BigInt(patent.challenger_bond || '0') > 0n && (
            <span className="text-rose-400 text-[11px]">
              (+{formatGen(patent.challenger_bond)} Bond)
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mt-3">
        <h3 className="font-cinzel text-lg font-bold text-[#F5EFE0] leading-snug group-hover:text-[#E5C158] transition-colors">
          {patent.patent_title}
        </h3>
      </div>

      {/* Claims Specification Scroll */}
      <div className="mt-2.5 p-3 rounded-xl bg-[#080C18]/70 border border-[#233257] relative">
        <Scroll className="h-3.5 w-3.5 text-[#C5A059] absolute top-2.5 right-2.5 opacity-40" />
        <p className="text-sm font-cormorant text-slate-300 italic leading-relaxed">
          "{expanded
            ? patent.novelty_claims
            : patent.novelty_claims.length > 170
            ? `${patent.novelty_claims.slice(0, 170)}...`
            : patent.novelty_claims}"
        </p>
        {patent.novelty_claims.length > 170 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-cinzel font-semibold text-[#E5C158] hover:text-white mt-1.5 inline-flex items-center gap-1"
          >
            {expanded ? (
              <>
                <span>Roll up charter</span>
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                <span>Read entire specification</span>
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Attributions: Inventor & Challenger */}
      <div className="mt-3.5 pt-2.5 border-t border-[#233257] grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] font-cinzel uppercase tracking-wider text-slate-400 block">
            Inventor (Applicant)
          </span>
          <span className="font-mono text-slate-300 text-[11px]">
            {truncateAddress(patent.inventor)}
            {isInventor && <span className="ml-1 text-[10px] text-emerald-400 font-sans font-bold">(Counselor)</span>}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-cinzel uppercase tracking-wider text-slate-400 block">
            Challenger (Adversary)
          </span>
          <span className="font-mono text-slate-300 text-[11px]">
            {truncateAddress(patent.challenger)}
            {isChallenger && <span className="ml-1 text-[10px] text-rose-400 font-sans font-bold">(Counselor)</span>}
          </span>
        </div>
      </div>

      {/* Prior Art Citation if Filed */}
      {patent.prior_art_url && (
        <div className="mt-3 p-2.5 bg-[#080C18] rounded-xl border border-[#C5A059]/30 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-cinzel text-[11px] text-amber-200/90 flex items-center gap-1">
              <Scale className="h-3.5 w-3.5 text-[#C5A059]" />
              Prior Art Cited:
            </span>
            <a
              href={patent.prior_art_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E5C158] hover:underline inline-flex items-center gap-1 text-[11px] font-serif"
            >
              <span>Examine Evidence</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          {patent.overlap_score > 0 && (
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Technical Equivalence:</span>
              <span className={`font-bold ${patent.overlap_score >= 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {patent.overlap_score}% Equivalence
              </span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className="mt-3 text-[11px] font-cormorant italic text-slate-400">
        <p>{statusMeta.description}</p>
      </div>

      {/* Action Toolbar */}
      <div className="mt-4 pt-3 border-t border-[#233257] flex flex-wrap items-center justify-end gap-2">
        {/* Critique Dossier Modal Trigger */}
        {patent.status !== 0 && (
          <button
            onClick={() => onOpenExamination(patent)}
            className="px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold text-[#E5C158] bg-[#121D38] hover:bg-[#1E2C4F] border border-[#C5A059]/40 transition-colors inline-flex items-center gap-1.5"
          >
            <FileSearch className="h-3.5 w-3.5" />
            <span>Bench Critique</span>
          </button>
        )}

        {/* Status 0: ACTIVE_PROTECTED */}
        {patent.status === 0 && (
          <>
            {!isInventor && (
              <button
                onClick={() => onOpenChallenge(patent)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold text-amber-100 bg-[#881326] hover:bg-[#A31B32] border border-[#C5A059]/60 shadow-burgundy-glow transition-all inline-flex items-center gap-1.5 active:scale-95"
              >
                <Scale className="h-3.5 w-3.5 text-[#E5C158]" />
                <span>Indict / Challenge</span>
              </button>
            )}
            {isInventor && (
              <button
                onClick={() => onReclaimExpired(patent.patent_id)}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold text-slate-200 bg-[#121D38] hover:bg-[#1E2C4F] border border-slate-600 transition-colors inline-flex items-center gap-1.5"
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
            className="px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#E5C158] to-[#C5A059] hover:from-white hover:to-[#E5C158] shadow-gold-glow transition-all inline-flex items-center gap-1.5 active:scale-95"
          >
            <Gavel className="h-3.5 w-3.5 text-[#090E1F]" />
            <span>Convene AI Bench</span>
          </button>
        )}

        {/* Status 2: AWAITING_PAYOUT (Cooling-off) */}
        {patent.status === 2 && (
          <>
            {(isInventor || isChallenger) && (
              <button
                onClick={() => onOpenDispute(patent)}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold text-orange-200 bg-orange-950/60 hover:bg-orange-900/80 border border-orange-600 transition-colors inline-flex items-center gap-1.5"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                <span>Writ of Appeal</span>
              </button>
            )}
            <button
              onClick={() => onFinalizeSettlement(patent.patent_id)}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#FFF6D6] via-[#E5C158] to-[#C5A059] hover:from-white hover:to-[#E5C158] shadow-gold-glow transition-all inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#090E1F]" />
              <span>Execute Decree</span>
            </button>
          </>
        )}

        {/* Status 6 or 7: DISPUTED or ESCALATED */}
        {(patent.status === 6 || patent.status === 7) && isAdmin && (
          <button
            onClick={() => onOpenAdminArbitration(patent)}
            disabled={actionLoading}
            className="px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold text-amber-200 bg-[#881326] hover:bg-[#A31B32] border border-[#C5A059] shadow-burgundy-glow transition-all inline-flex items-center gap-1.5"
          >
            <Gavel className="h-3.5 w-3.5 text-[#E5C158]" />
            <span>Sovereign Arbitration</span>
          </button>
        )}
      </div>
    </div>
  );
};
