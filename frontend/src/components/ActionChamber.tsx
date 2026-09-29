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
  Cpu,
  Zap,
  Terminal,
  User,
  Info,
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
  onAdjudicate: (patentId: number | string) => void;
  onFinalizeSettlement: (patentId: number | string) => void;
  onReclaimExpired: (patentId: number | string) => void;
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
  const isInventor = !!(userAddress && patent && patent.inventor.toLowerCase() === userAddress.toLowerCase());
  const isChallenger = !!(userAddress && patent && patent.challenger.toLowerCase() === userAddress.toLowerCase());
  const isAdmin = !!(userAddress && stats.platform_admin && stats.platform_admin.toLowerCase() === userAddress.toLowerCase());
  const statusMeta = patent ? getStatusMeta(patent.status) : null;

  // Active Role computation
  let currentRoleLabel = 'OBSERVER (WALLET NOT CONNECTED)';
  let currentRoleBadge = 'bg-slate-800 text-slate-400 border-slate-700';
  let roleIconColor = 'text-slate-500';

  if (userAddress) {
    if (isAdmin) {
      currentRoleLabel = 'PROTOCOL ADMIN / STEWARD';
      currentRoleBadge = 'bg-purple-950/80 text-purple-300 border-purple-500/50';
      roleIconColor = 'text-purple-400';
    } else if (isInventor) {
      currentRoleLabel = 'PATENT APPLICANT / INVENTOR';
      currentRoleBadge = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
      roleIconColor = 'text-cyan-400';
    } else if (isChallenger) {
      currentRoleLabel = 'PRIOR ART CHALLENGER';
      currentRoleBadge = 'bg-rose-950/80 text-rose-300 border-rose-500/50';
      roleIconColor = 'text-rose-400';
    } else {
      currentRoleLabel = 'INDEPENDENT RESEARCHER / AUDITOR';
      currentRoleBadge = 'bg-teal-950/80 text-teal-300 border-teal-500/50';
      roleIconColor = 'text-teal-400';
    }
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const isExpired = patent?.expires_at_time ? nowSec > Number(patent.expires_at_time) : false;

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col bg-[#0A0E17]/95 border-l border-[#06B6D4]/20 h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-4">
      {/* Panel 1: Contextual Litigation Action Hub */}
      <div className="bg-[#0F1523]/80 rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#1E293B]">
          <Cpu className="h-4 w-4 text-cyan-400" />
          <h3 className="font-space text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center justify-between w-full">
            <span>Litigation Matrix</span>
            <span className="text-[10px] text-cyan-400 font-mono">// EXEC-01</span>
          </h3>
        </div>

        {/* User Role Telemetry Pill */}
        <div className="p-2.5 rounded-xl bg-[#070A11] border border-[#1E293B] space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <User className={`h-3.5 w-3.5 ${roleIconColor}`} />
              YOUR ROLE:
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${currentRoleBadge}`}>
              {currentRoleLabel.split(' / ')[0]}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            {userAddress ? `${truncateAddress(userAddress)}` : 'Connect wallet to execute on-chain decrees'}
          </p>
        </div>

        {patent ? (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-[#070A11] border border-[#1E293B] text-xs">
              <span className="text-[10px] font-space uppercase tracking-wider text-slate-400 block">
                TARGET DOSSIER IN SESSION:
              </span>
              <p className="font-space font-bold text-cyan-300 truncate">
                #{patent.patent_id} - {patent.patent_title}
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                {statusMeta?.description}
              </p>
            </div>

            {/* Action Buttons based on status & role */}
            <div className="space-y-2">
              {/* Status 0: ACTIVE_PROTECTED */}
              {patent.status === 0 && (
                <>
                  {isExpired ? (
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Term Lapsed Uncontested</span>
                      </div>
                      <p className="text-slate-400 text-[10px]">
                        Protection window elapsed without prior art opposition. Escrow ready for refund.
                      </p>
                    </div>
                  ) : !isInventor ? (
                    <button
                      onClick={() => onOpenChallenge(patent)}
                      disabled={actionLoading}
                      className="w-full py-2.5 px-3 rounded-lg text-xs font-space font-bold uppercase tracking-wider text-white bg-rose-950/80 hover:bg-rose-900 border border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center space-x-2 active:scale-98"
                    >
                      <Scale className="h-4 w-4 text-rose-300" />
                      <span>Stake Bond & Indict Prior Art</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Info className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Registered Inventor</span>
                      </div>
                      <p className="text-slate-400 text-[10px]">
                        Self-challenge is barred by contract consensus. Escrow is protected under term limit.
                      </p>
                    </div>
                  )}

                  {isInventor && (
                    <button
                      onClick={() => onReclaimExpired(patent.patent_id)}
                      disabled={actionLoading}
                      className={`w-full py-2.5 px-3 rounded-lg text-xs font-space font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                        isExpired
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-[#070A11] hover:from-emerald-300 hover:to-teal-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-98'
                          : 'text-cyan-200 bg-[#0A0E17] hover:bg-[#121A2E] border border-cyan-500/40'
                      }`}
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>{isExpired ? 'Reclaim Escrow (Term Lapsed)' : 'Reclaim Escrow (If Term Lapsed)'}</span>
                    </button>
                  )}
                </>
              )}

              {/* Status 1: IN_EXAMINATION */}
              {patent.status === 1 && (
                <div className="space-y-2">
                  <button
                    onClick={() => onAdjudicate(patent.patent_id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 px-3 rounded-lg text-xs font-space font-bold uppercase tracking-wider text-[#070A11] bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center space-x-2 active:scale-98"
                  >
                    <Gavel className="h-4 w-4 stroke-[2.5]" />
                    <span>Trigger AI Bench Deliberation</span>
                  </button>
                  <p className="text-[10px] font-mono text-slate-500 text-center">
                    Multi-validator consensus runs live web scraping via gl.nondet.web.render
                  </p>
                </div>
              )}

              {/* Status 2: AWAITING_PAYOUT (24-block Cooling-Off Grace Period) */}
              {patent.status === 2 && (
                <>
                  {(isInventor || isChallenger) ? (
                    <button
                      onClick={() => onOpenDispute(patent)}
                      disabled={actionLoading}
                      className="w-full py-2.5 px-3 rounded-lg text-xs font-space font-bold uppercase tracking-wider text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500 transition-all flex items-center justify-center space-x-2"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <span>Lodge Appellate Dispute (Writ)</span>
                    </button>
                  ) : (
                    <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/40 text-[10px] font-mono text-indigo-300">
                      24-Block cooling-off in effect. Only Inventor or Challenger can dispute before settlement.
                    </div>
                  )}

                  <button
                    onClick={() => onFinalizeSettlement(patent.patent_id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 px-3 rounded-lg text-xs font-space font-bold uppercase tracking-wider text-[#070A11] bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center space-x-2 active:scale-98"
                  >
                    <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                    <span>Finalize Settlement Payout</span>
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
                      className="w-full py-2.5 px-3 rounded-lg text-xs font-space font-bold uppercase tracking-wider text-purple-200 bg-purple-950/80 hover:bg-purple-900 border border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center space-x-2"
                    >
                      <Gavel className="h-4 w-4 text-purple-300" />
                      <span>Admin Arbitration Hearing</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-600/50 text-[11px] text-amber-200 text-center font-mono">
                      // ESCALATED: Pending Protocol Admin ({truncateAddress(stats.platform_admin || '')}) arbitration.
                    </div>
                  )}
                </>
              )}

              {/* Status 3, 4, 5: SETTLED */}
              {(patent.status === 3 || patent.status === 4 || patent.status === 5) && (
                <div className="p-2.5 rounded-lg bg-[#070A11] border border-teal-500/40 text-[11px] text-teal-300 text-center font-mono">
                  // DECREE FINALIZED: Escrow reconciled and disbursed on-chain.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-500 font-mono">
            // SELECT A DOSSIER TO ACTIVATE LITIGATION CONTROLS
          </div>
        )}
      </div>

      {/* Panel 2: Sovereign Vault Telemetry */}
      <div className="bg-[#0F1523]/80 rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#1E293B]">
          <Lock className="h-4 w-4 text-teal-400" />
          <h3 className="font-space text-xs font-bold uppercase tracking-wider text-slate-100">
            Escrow Vault Telemetry
          </h3>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center p-2 rounded-lg bg-[#070A11] border border-[#1E293B]">
            <span className="text-slate-400">Total Escrow Locked:</span>
            <span className="font-bold text-teal-300">{formatGen(stats.total_patent_locked)} GEN</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-[#070A11] border border-[#1E293B]">
            <span className="text-slate-400">Decrees Enacted:</span>
            <span className="font-bold text-cyan-300">{stats.total_disputes_resolved}</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-[#070A11] border border-[#1E293B]">
            <span className="text-slate-400">Canary Guard:</span>
            <span className="font-bold text-emerald-400">V2_ACTIVE</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-[#070A11] border border-[#1E293B]">
            <span className="text-slate-400">Protocol Admin:</span>
            <span className="font-bold text-slate-300">{truncateAddress(stats.platform_admin || '')}</span>
          </div>
        </div>
      </div>

      {/* Panel 3: Autonomous Diagnostic Ledger (Audit Trail) */}
      <div className="bg-[#0F1523]/80 rounded-2xl p-4 border border-[#1E293B] shadow-inner space-y-2 flex-1">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#1E293B]">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <h3 className="font-space text-xs font-bold uppercase tracking-wider text-slate-100">
            Audit Ledger Feed
          </h3>
        </div>

        <div className="space-y-2 text-[11px] font-mono">
          <div className="p-2 rounded-lg bg-[#070A11] border border-[#1E293B] text-slate-300">
            <span className="text-cyan-400">[SYS_GENVM]</span> Subjective Consensus v3 consensus layer operating normally.
          </div>
          <div className="p-2 rounded-lg bg-[#070A11] border border-[#1E293B] text-slate-300">
            <span className="text-teal-400">[ORACLE_WEB]</span> On-chain web scraper <code className="text-cyan-200">gl.nondet.web.render</code> active.
          </div>
          <div className="p-2 rounded-lg bg-[#070A11] border border-[#1E293B] text-slate-300">
            <span className="text-amber-400">[TIMELOCK_24B]</span> 24-Block Cooling-off window rule strictly enforced across all callers.
          </div>
        </div>
      </div>
    </aside>
  );
};
