import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle, Loader2, Link2, Coins, ShieldCheck, ExternalLink } from 'lucide-react';
import { PatentCaseData } from '../config/genlayer';
import { formatGen } from '../utils/helpers';

interface DisputeModalProps {
  isOpen: boolean;
  patent: PatentCaseData | null;
  onClose: () => void;
  onSubmit: (patentId: number | string, newEvidenceUrl: string, bondWei: bigint) => Promise<void>;
  loading: boolean;
}

const PRESET_APPEAL_EVIDENCE = [
  {
    label: 'LoRA Official Rebuttal Doc',
    url: 'https://raw.githubusercontent.com/microsoft/LoRA/main/README.md',
  },
  {
    label: 'Attention Mechanism Prior Art',
    url: 'https://raw.githubusercontent.com/tensorflow/tensor2tensor/master/README.md',
  },
  {
    label: 'GenLayer Consensus Specification',
    url: 'https://docs.genlayer.com/full-documentation.txt',
  },
];

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  patent,
  onClose,
  onSubmit,
  loading,
}) => {
  if (!isOpen || !patent) return null;

  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [error, setError] = useState('');

  // Required 10% appeal bond by contract rules
  let bondWei = 0n;
  try {
    const escrowBig = BigInt(patent.escrow_deposit || '0');
    bondWei = (escrowBig * 10n) / 100n;
    if (bondWei === 0n && escrowBig > 0n) {
      bondWei = 1n;
    }
  } catch {
    bondWei = 0n;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUrl = evidenceUrl.trim();
    if (!cleanUrl) {
      setError('Public rebuttal evidence URL is required.');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setError('Evidence URL must be a valid public link starting with http:// or https://');
      return;
    }

    try {
      await onSubmit(patent.patent_id, cleanUrl, bondWei);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to lodge appellate dispute.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0A0E17] rounded-2xl max-w-lg w-full p-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] border border-amber-500/50 relative text-slate-200">
        <div className="flex items-start justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-space text-base font-bold uppercase tracking-wider text-amber-200">
                Lodge Appellate Dispute Writ
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Dossier #{patent.patent_id} • 10% Payable Appeal Bond
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 bg-[#070A11] rounded-xl border border-[#1E293B] text-xs font-mono text-slate-300 space-y-1.5">
            <p className="font-space font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
              <span>Current AI Bench Verdict:</span>
              <span className="font-mono text-white px-2 py-0.5 rounded bg-[#0F1523] border border-amber-500/30">
                {patent.verdict}
              </span>
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Lodging a formal appeal freezes automatic payout execution and escalates the dossier to <code>STATUS_DISPUTED</code>. The Supreme Appellate AI Jury on GenLayer will independently cross-examine your counter-evidence.
            </p>
          </div>

          {/* Payable Appeal Bond Summary */}
          <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/40 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-amber-400" />
              <span className="text-amber-200 font-semibold">Contract-Required Appeal Bond:</span>
            </div>
            <span className="text-teal-300 font-bold text-sm">
              {formatGen(bondWei)} GEN
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-space font-semibold uppercase tracking-wider text-cyan-300">
                Rebuttal / Counter-Evidence Public URL
              </label>
              <span className="text-[10px] font-mono text-slate-500">http(s):// required</span>
            </div>
            <div className="relative">
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://raw.githubusercontent.com/... or https://arxiv.org/abs/..."
                className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-[#070A11] border border-[#1E293B] rounded-xl text-cyan-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                disabled={loading}
                required
              />
              <Link2 className="h-4 w-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>

            {/* Quick Evidence Presets */}
            <div className="mt-2 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Quick Rebuttal Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_APPEAL_EVIDENCE.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEvidenceUrl(preset.url)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0F1523] border border-[#1E293B] hover:border-amber-500/50 text-slate-300 hover:text-amber-200 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-950/70 border border-rose-600 rounded-xl flex items-center space-x-2 text-xs text-rose-300 font-mono">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-space uppercase tracking-wider text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-space font-bold uppercase tracking-wider text-[#070A11] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 transition-all active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Staking Bond & Filing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
                  <span>Stake Bond ({formatGen(bondWei)} GEN) & Lodge Writ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
