import React from 'react';
import {
  Gavel,
  Shield,
  Coins,
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Lock,
  UserCheck,
  ShieldCheck,
  Activity,
  FileText,
} from 'lucide-react';
import { PatentCaseData, ProtocolStats } from '../config/genlayer';
import { formatGen, truncateAddress, getStatusMeta } from '../utils/helpers';

interface ActionChamberProps {
  patent: PatentCaseData | null;
  stats: ProtocolStats;
  userAddress: string;
  onOpenChallenge: (patent: PatentCaseData) => void;
  onOpenDispute: (patent: PatentCaseData) => void;
  onOpenAdminArbitration: (patent: PatentCaseData) => void;
  onAdjudicate: (patentId: number) => void;
  onFinalizeSettlement: (patentId: number) => void;
  onReclaimExpired: (patentId: number) => void;
  actionLoading: boolean;
}

export const ActionChamber: React.FC<ActionChamberProps> = ({
  patent,
  stats,
  userAddress,
  onOpenChallenge,
  onOpenDispute,
  onOpenAdminArbitration,
  onAdjudicate,
  onFinalizeSettlement,
  onReclaimExpired,
  actionLoading,
}) => {
  const isInventor = userAddress && patent && patent.inventor.toLowerCase() === userAddress.toLowerCase();
  const isChallenger = userAddress && patent && patent.challenger.toLowerCase() === userAddress.toLowerCase();
  const isAdmin = userAddress && stats.platform_admin && stats.platform_admin.toLowerCase() === userAddress.toLowerCase();
  const statusMeta = patent ? getStatusMeta(patent.status) : null;

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col bg-[#0B1020] border-l border-[#C5A059]/20 h-[calc(100vh-5.5rem)] overflow-y-auto p-4 space-y-5">
      {/* Panel 1: Contextual Litigation Action Hub */}
      <div className="bg-[#0E1529] rounded-2xl p-4 border border-[#C5A059]/40 shadow-court-panel space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#233257]">
          <Gavel className="h-4 w-4 text-[#E5C158]" />
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#F5EFE0]">
            Litigation Action Chamber
          </h3>
        </div>

        {patent ? (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-[#080C18] border border-[#233257] text-xs">
              <span className="text-[10px] font-cinzel text-slate-400 block uppercase">
                Active Docket In Session:
              </span>
              <p className="font-cinzel font-bold text-amber-200 truncate">
                #{patent.patent_id} - {patent.patent_title}
              </p>
              <p className="text-[11px] font-cormorant italic text-slate-400 mt-1">
                {statusMeta?.description}
              </p>
            </div>

            {/* Action Buttons based on status */}
            <div className="space-y-2">
              {/* Status 0: ACTIVE_PROTECTED */}
              {patent.status === 0 && (
                <>
                  {!isInventor && (
                    <button
                      onClick={() => onOpenChallenge(patent)}
                      disabled={actionLoading}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-cinzel font-bold text-white bg-[#881326] hover:bg-[#A31B32] border border-[#C5A059]/60 shadow-burgundy-glow transition-all flex items-center justify-center space-x-2 active:scale-98"
                    >
                      <Scale className="h-4 w-4 text-[#E5C158]" />
                      <span>Stake Bond & Indict Prior Art</span>
                    </button>
                  )}
                  {isInventor && (
                    <button
                      onClick={() => onReclaimExpired(patent.patent_id)}
                      disabled={actionLoading}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-cinzel font-semibold text-slate-200 bg-[#121D38] hover:bg-[#1E2C4F] border border-slate-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="h-4 w-4 text-[#C5A059]" />
                      <span>Reclaim Escrow (If Term Lapsed)</span>
                    </button>
                  )}
                </>
              )}

              {/* Status 1: IN_EXAMINATION */}
              {patent.status === 1 && (
                <button
                  onClick={() => onAdjudicate(patent.patent_id)}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#E5C158] to-[#C5A059] shadow-gold-glow transition-all flex items-center justify-center space-x-2 active:scale-98"
                >
                  <Gavel className="h-4 w-4 text-[#090E1F]" />
                  <span>Convene AI Bench & Adjudicate</span>
                </button>
              )}

              {/* Status 2: AWAITING_PAYOUT */}
              {patent.status === 2 && (
                <>
                  {(isInventor || isChallenger) && (
                    <button
                      onClick={() => onOpenDispute(patent)}
                      disabled={actionLoading}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-cinzel font-bold text-orange-200 bg-orange-950/60 hover:bg-orange-900/80 border border-orange-600 transition-all flex items-center justify-center space-x-2"
                    >
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      <span>Lodge Appellate Writ of Error</span>
                    </button>
                  )}
                  <button
                    onClick={() => onFinalizeSettlement(patent.patent_id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#FFF6D6] via-[#E5C158] to-[#C5A059] shadow-gold-glow transition-all flex items-center justify-center space-x-2 active:scale-98"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#090E1F]" />
                    <span>Execute Sovereign Decree</span>
                  </button>
                </>
              )}

              {/* Status 6 or 7: DISPUTED or ESCALATED */}
              {(patent.status === 6 || patent.status === 7) && (
                <>
                  {isAdmin ? (
                    <button
                      onClick={() => onOpenAdminArbitration(patent)}
                      disabled={actionLoading}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-cinzel font-bold text-amber-200 bg-[#881326] hover:bg-[#A31B32] border border-[#C5A059] shadow-burgundy-glow transition-all flex items-center justify-center space-x-2"
                    >
                      <Gavel className="h-4 w-4 text-[#E5C158]" />
                      <span>Lord Chief Justice Sovereign Hearing</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-orange-950/50 border border-orange-600/50 text-[11px] text-orange-200 text-center font-serif">
                      Case sealed under appellate writ. Awaiting Sovereign Protocol Steward arbitration.
                    </div>
                  )}
                </>
              )}

              {/* Status 3, 4, 5: SETTLED */}
              {(patent.status === 3 || patent.status === 4 || patent.status === 5) && (
                <div className="p-2.5 rounded-lg bg-[#080C18] border border-emerald-600/40 text-[11px] text-emerald-300 text-center font-serif">
                  Decree fully executed and archived. Escrow disbursed.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-400 font-serif">
            Select a patent docket to activate judicial litigation controls.
          </div>
        )}
      </div>

      {/* Panel 2: Sovereign Vault Telemetry */}
      <div className="bg-[#0E1529] rounded-2xl p-4 border border-[#233257] shadow-court-panel space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#233257]">
          <Lock className="h-4 w-4 text-[#E5C158]" />
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#F5EFE0]">
            Sovereign Vault Telemetry
          </h3>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center p-2 rounded-lg bg-[#080C18] border border-[#233257]">
            <span className="text-slate-400 font-serif">Total Escrow Locked:</span>
            <span className="font-bold text-[#E5C158]">{formatGen(stats.total_patent_locked)} GEN</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-[#080C18] border border-[#233257]">
            <span className="text-slate-400 font-serif">Decrees Enacted:</span>
            <span className="font-bold text-emerald-400">{stats.total_disputes_resolved}</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-[#080C18] border border-[#233257]">
            <span className="text-slate-400 font-serif">Security Canary:</span>
            <span className="font-bold text-amber-300">V2 VERIFIED</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-[#080C18] border border-[#233257]">
            <span className="text-slate-400 font-serif">Chief Steward:</span>
            <span className="font-bold text-slate-300">{truncateAddress(stats.platform_admin || '')}</span>
          </div>
        </div>
      </div>

      {/* Panel 3: Live Court Ledger (Audit Trail) */}
      <div className="bg-[#0E1529] rounded-2xl p-4 border border-[#233257] shadow-court-panel space-y-2 flex-1">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#233257]">
          <Activity className="h-4 w-4 text-[#E5C158]" />
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#F5EFE0]">
            Tribunal Journal of Decrees
          </h3>
        </div>

        <div className="space-y-2 text-[11px] font-serif">
          <div className="p-2 rounded-lg bg-[#080C18] border border-slate-800 text-slate-300">
            <span className="text-[#C5A059] font-mono">[GENVM]</span> Subjective Consensus v3 consensus layer operating normally.
          </div>
          <div className="p-2 rounded-lg bg-[#080C18] border border-slate-800 text-slate-300">
            <span className="text-emerald-400 font-mono">[ORACLE]</span> On-chain web scraper <code className="text-slate-400">gl.nondet.web.render</code> active.
          </div>
          <div className="p-2 rounded-lg bg-[#080C18] border border-slate-800 text-slate-300">
            <span className="text-amber-400 font-mono">[TIMELOCK]</span> 24-Block Cooling-off window rule strictly enforced across all callers.
          </div>
        </div>
      </div>
    </aside>
  );
};
