import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
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
      setError('Dispute reason must be at least 10 characters detailing the grounds of appeal.');
      return;
    }

    try {
      await onSubmit(patent.patent_id, clean);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to lodge on-chain dispute.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Lodge On-Chain Appeal / Dispute
              </h3>
              <p className="text-xs text-slate-500">
                Case #{patent.patent_id} • 24-Block Cooling-Off Window
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
          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 space-y-1">
            <p><strong>Current Verdict:</strong> <span className="font-semibold">{patent.verdict}</span></p>
            <p className="text-slate-500">
              Raising an appeal halts automated settlement and transitions the case into <code>DISPUTED</code> status for Protocol Steward arbitration. Only the inventor or challenger address may invoke this function.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Grounds of Dispute / Technical Counter-Rationale
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the AI Examination Board critique contains a factual error or misapplied prior art..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
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
              className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting Dispute...</span>
                </>
              ) : (
                <span>Freeze Escrow & Lodge Dispute</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
