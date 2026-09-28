import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle, Loader2, Scroll } from 'lucide-react';
import { PatentCaseData } from '../config/genlayer';

interface DisputeModalProps {
  isOpen: boolean;
  patent: PatentCaseData | null;
  onClose: () => void;
  onSubmit: (patentId: number, reason: string) => Promise<void>;
  loading: boolean;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  patent,
  onClose,
  onSubmit,
  loading,
}) => {
  if (!isOpen || !patent) return null;

  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = reason.trim();
    if (!clean || clean.length < 10) {
      setError('Grounds of appellate review must be at least 10 characters detailing legal or technical error.');
      return;
    }

    try {
      await onSubmit(patent.patent_id, clean);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to lodge appellate writ.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0E162B] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-orange-500/60 relative text-slate-200">
        <div className="flex items-start justify-between pb-3 border-b border-[#233257]">
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-xl bg-orange-950/60 border border-orange-500/60 flex items-center justify-center text-orange-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-amber-200">
                Petition for Appellate Review
              </h3>
              <p className="text-xs font-cormorant italic text-slate-400">
                Docket #{patent.patent_id} • Writ of Error within 24-Block Grace Period
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
          <div className="p-3 bg-[#080C18] rounded-xl border border-[#233257] text-xs text-slate-300 space-y-1.5">
            <p className="font-cinzel text-amber-200 font-bold">
              Current Bench Finding: <span className="font-mono text-white">{patent.verdict}</span>
            </p>
            <p className="text-slate-400 font-serif leading-relaxed">
              Lodging a formal appeal freezes automated decree execution and moves the escrow into <code>DISPUTED</code> status for sovereign review by the Protocol Steward. Only the inventor or challenger address may lodge this petition.
            </p>
          </div>

          <div>
            <label className="block text-xs font-cinzel font-semibold text-[#C5A059] mb-1">
              Grounds of Error / Technical Counter-Specification
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State clearly the misconstruction of claims, hallucinated citations, or non-equivalent prior art features..."
              className="w-full px-3 py-2 text-xs font-serif bg-[#080C18] border border-[#233257] rounded-xl text-slate-200 focus:outline-none focus:border-orange-500"
              disabled={loading}
            />
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
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-cinzel font-bold text-white bg-orange-700 hover:bg-orange-800 rounded-xl shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sealing Writ...</span>
                </>
              ) : (
                <span>Freeze Escrow & Lodge Writ</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
