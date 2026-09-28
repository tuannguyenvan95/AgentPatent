import React, { useState } from 'react';
import { X, Gavel, AlertCircle, Loader2 } from 'lucide-react';
import { PatentCaseData } from '../config/genlayer';
import { formatGen, truncateAddress } from '../utils/helpers';

interface AdminArbitrationModalProps {
  isOpen: boolean;
  patent: PatentCaseData | null;
  onClose: () => void;
  onSubmit: (patentId: number, resolution: 'INVALIDATE' | 'UPHOLD' | 'REFUND_SPLIT') => Promise<void>;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0E162B] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#C5A059]/60 relative text-slate-200">
        <div className="flex items-start justify-between pb-3 border-b border-[#233257]">
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#881326] to-[#450A13] border border-[#C5A059] flex items-center justify-center text-[#E5C158] shadow-burgundy-glow">
              <Gavel className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-amber-200">
                Lord Chief Justice Tribunal
              </h3>
              <p className="text-xs font-cormorant italic text-slate-400">
                Final Sovereign Decree • Case Docket #{patent.patent_id}
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
          <div className="p-3.5 bg-[#080C18] rounded-xl text-xs space-y-2 border border-[#233257]">
            <div className="flex justify-between">
              <span className="font-cinzel text-slate-400">Inventor:</span>
              <span className="font-mono text-slate-200">{truncateAddress(patent.inventor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-cinzel text-slate-400">Challenger:</span>
              <span className="font-mono text-slate-200">{truncateAddress(patent.challenger)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-cinzel text-slate-400">Total Vaulted Escrow & Bond:</span>
              <span className="font-mono font-bold text-[#E5C158]">
                {formatGen(BigInt(patent.escrow_deposit || '0') + BigInt(patent.challenger_bond || '0'))} GEN
              </span>
            </div>
            {patent.dispute_reason && (
              <div className="pt-2 border-t border-[#233257]">
                <span className="font-cinzel text-amber-200/90 block mb-1">Grounds of Appeal Recorded:</span>
                <span className="font-cormorant text-slate-300 italic text-sm">{patent.dispute_reason}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-cinzel font-semibold text-[#C5A059] mb-2">
              Sovereign Judicial Determination
            </label>
            <div className="space-y-2">
              <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${resolution === 'INVALIDATE' ? 'border-rose-500 bg-rose-950/40 shadow-burgundy-glow' : 'border-[#233257] bg-[#080C18] hover:border-slate-600'}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="resolution"
                    value="INVALIDATE"
                    checked={resolution === 'INVALIDATE'}
                    onChange={() => setResolution('INVALIDATE')}
                    className="text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-xs font-cinzel font-bold text-rose-300">ANNUL PATENT (INVALIDATE AB INITIO)</span>
                </div>
                <p className="text-[11px] font-cormorant italic text-slate-400 mt-1 pl-5">
                  Challenger wins indictment. 100% of escrow + challenger bond disbursed to challenger.
                </p>
              </label>

              <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${resolution === 'UPHOLD' ? 'border-emerald-500 bg-emerald-950/40' : 'border-[#233257] bg-[#080C18] hover:border-slate-600'}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="resolution"
                    value="UPHOLD"
                    checked={resolution === 'UPHOLD'}
                    onChange={() => setResolution('UPHOLD')}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-cinzel font-bold text-emerald-300">UPHOLD PATENT AS INVENTIVE STEP</span>
                </div>
                <p className="text-[11px] font-cormorant italic text-slate-400 mt-1 pl-5">
                  Inventor wins defense. Validity deposit returned + slashed challenger bond awarded to inventor.
                </p>
              </label>

              <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${resolution === 'REFUND_SPLIT' ? 'border-[#C5A059] bg-[#881326]/30 shadow-gold-glow' : 'border-[#233257] bg-[#080C18] hover:border-slate-600'}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="resolution"
                    value="REFUND_SPLIT"
                    checked={resolution === 'REFUND_SPLIT'}
                    onChange={() => setResolution('REFUND_SPLIT')}
                    className="text-[#E5C158] focus:ring-[#E5C158]"
                  />
                  <span className="text-xs font-cinzel font-bold text-amber-200">MUTUAL DISSOLUTION (EQUITABLE RETURN)</span>
                </div>
                <p className="text-[11px] font-cormorant italic text-slate-400 mt-1 pl-5">
                  Both parties refunded their exact original deposits. Litigation concluded with zero loss.
                </p>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-950/70 border border-rose-600 rounded-xl flex items-center space-x-2 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#233257]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-cinzel text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#FFF6D6] via-[#E5C158] to-[#C5A059] hover:from-white hover:to-[#E5C158] rounded-xl shadow-gold-glow disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#090E1F]" />
                  <span>Enacting Decree...</span>
                </>
              ) : (
                <span>Affix Sovereign Seal & Execute</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
