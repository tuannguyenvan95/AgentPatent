import React, { useState } from 'react';
import { X, Gavel, AlertCircle, Loader2, ShieldCheck, Scale } from 'lucide-react';
import { PatentCaseData } from '../config/genlayer';
import { formatGen, truncateAddress } from '../utils/helpers';

interface AdminArbitrationModalProps {
  isOpen: boolean;
  patent: PatentCaseData | null;
  onClose: () => void;
  onSubmit: (patentId: number | string, resolution: 'INVALIDATE' | 'UPHOLD' | 'REFUND_SPLIT') => Promise<void>;
  loading: boolean;
}

export const AdminArbitrationModal: React.FC<AdminArbitrationModalProps> = ({
  isOpen,
  patent,
  onClose,
  onSubmit,
  loading,
}) => {
  if (!isOpen || !patent) return null;

  const [resolution, setResolution] = useState<'INVALIDATE' | 'UPHOLD' | 'REFUND_SPLIT'>('REFUND_SPLIT');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await onSubmit(patent.patent_id, resolution);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit sovereign decree.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0A0E17] rounded-2xl max-w-lg w-full p-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] border border-purple-500/50 relative text-slate-200">
        <div className="flex items-start justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-xl bg-purple-950/80 border border-purple-500/60 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
              <Gavel className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-space text-base font-bold uppercase tracking-wider text-purple-200">
                Protocol Admin Sovereign Arbitration
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Final Settlement Hearing • Dossier #{patent.patent_id}
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
          <div className="p-3.5 bg-[#070A11] rounded-xl text-xs font-mono space-y-2 border border-[#1E293B]">
            <div className="flex justify-between">
              <span className="text-slate-400">Inventor:</span>
              <span className="text-cyan-300">{truncateAddress(patent.inventor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Challenger:</span>
              <span className="text-rose-300">{truncateAddress(patent.challenger)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Vaulted Escrow & Bond:</span>
              <span className="font-bold text-teal-300">
                {formatGen(BigInt(patent.escrow_deposit || '0') + BigInt(patent.challenger_bond || '0'))} GEN
              </span>
            </div>
            {patent.dispute_reason && (
              <div className="pt-2 border-t border-[#1E293B]">
                <span className="text-amber-300 block mb-1 uppercase font-space text-[10px]">Grounds of Appeal Recorded:</span>
                <span className="text-slate-300 text-xs">{patent.dispute_reason}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-space font-semibold uppercase tracking-wider text-cyan-300 mb-2">
              Sovereign Arbitration Resolution
            </label>
            <div className="space-y-2">
              <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${resolution === 'INVALIDATE' ? 'border-rose-500 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-[#1E293B] bg-[#070A11] hover:border-slate-600'}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="resolution"
                    value="INVALIDATE"
                    checked={resolution === 'INVALIDATE'}
                    onChange={() => setResolution('INVALIDATE')}
                    className="text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-xs font-space font-bold uppercase tracking-wider text-rose-300">ANNUL PATENT (INVALIDATE AB INITIO)</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-1 pl-5">
                  Challenger wins audit. 100% of escrow + challenger bond disbursed to challenger.
                </p>
              </label>

              <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${resolution === 'UPHOLD' ? 'border-teal-500 bg-teal-950/40 shadow-[0_0_15px_rgba(20,184,166,0.2)]' : 'border-[#1E293B] bg-[#070A11] hover:border-slate-600'}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="resolution"
                    value="UPHOLD"
                    checked={resolution === 'UPHOLD'}
                    onChange={() => setResolution('UPHOLD')}
                    className="text-teal-500 focus:ring-teal-500"
                  />
                  <span className="text-xs font-space font-bold uppercase tracking-wider text-teal-300">UPHOLD PATENT AS NOVEL RESEARCH</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-1 pl-5">
                  Inventor wins defense. Validity deposit returned + slashed challenger bond awarded to inventor.
                </p>
              </label>

              <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${resolution === 'REFUND_SPLIT' ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-[#1E293B] bg-[#070A11] hover:border-slate-600'}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="resolution"
                    value="REFUND_SPLIT"
                    checked={resolution === 'REFUND_SPLIT'}
                    onChange={() => setResolution('REFUND_SPLIT')}
                    className="text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-xs font-space font-bold uppercase tracking-wider text-cyan-200">MUTUAL DISSOLUTION (EQUITABLE RETURN)</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-1 pl-5">
                  Both parties refunded their exact original deposits. Dispute concluded with zero loss.
                </p>
              </label>
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
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-space font-bold uppercase tracking-wider text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Executing Decree...</span>
                </>
              ) : (
                <span>Execute Sovereign Decree</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
