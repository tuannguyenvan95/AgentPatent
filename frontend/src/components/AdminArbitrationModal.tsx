import React, { useState } from 'react';
import { X, Gavel, AlertCircle, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
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
      setError(err?.message || 'Failed to submit steward arbitration.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Gavel className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Protocol Steward Arbitration
              </h3>
              <p className="text-xs text-slate-500">
                Resolve Disputed/Escalated Patent #{patent.patent_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-200/80">
            <div className="flex justify-between">
              <span className="text-slate-500">Inventor:</span>
              <span className="font-mono text-slate-800">{truncateAddress(patent.inventor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Challenger:</span>
              <span className="font-mono text-slate-800">{truncateAddress(patent.challenger)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Locked Escrow + Bond:</span>
              <span className="font-bold text-teal-800">
                {formatGen(BigInt(patent.escrow_deposit || '0') + BigInt(patent.challenger_bond || '0'))} GEN
              </span>
            </div>
            {patent.dispute_reason && (
              <div className="pt-1.5 border-t border-slate-200">
                <span className="text-slate-500 block font-medium">Dispute Grounds:</span>
                <span className="text-slate-700 italic">{patent.dispute_reason}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Final Binding Resolution
            </label>
            <div className="space-y-2">
              <label className={`block p-3 rounded-lg border cursor-pointer transition-all ${resolution === 'INVALIDATE' ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="resolution"
                    value="INVALIDATE"
                    checked={resolution === 'INVALIDATE'}
                    onChange={() => setResolution('INVALIDATE')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-rose-800">INVALIDATE PATENT</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-5">
                  Challenger wins. All escrow + challenger bond disbursed to challenger.
                </p>
              </label>

              <label className={`block p-3 rounded-lg border cursor-pointer transition-all ${resolution === 'UPHOLD' ? 'border-teal-400 bg-teal-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="resolution"
                    value="UPHOLD"
                    checked={resolution === 'UPHOLD'}
                    onChange={() => setResolution('UPHOLD')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs font-bold text-teal-800">UPHOLD PATENT NOVELTY</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-5">
                  Inventor wins. Validity deposit returned + slashed challenger bond awarded to inventor.
                </p>
              </label>

              <label className={`block p-3 rounded-lg border cursor-pointer transition-all ${resolution === 'REFUND_SPLIT' ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="resolution"
                    value="REFUND_SPLIT"
                    checked={resolution === 'REFUND_SPLIT'}
                    onChange={() => setResolution('REFUND_SPLIT')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-indigo-800">MUTUAL REFUND (SAFE SPLIT)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-5">
                  Both parties refunded their exact original deposits. Protection canceled safely.
                </p>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-md shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Executing Resolution...</span>
                </>
              ) : (
                <span>Execute Final Steward Resolution</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
