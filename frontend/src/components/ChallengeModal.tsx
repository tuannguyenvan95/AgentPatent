import React, { useState } from 'react';
import { X, Flame, AlertCircle, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { PatentCaseData } from '../config/genlayer';
import { formatGen, PRESET_PRIOR_ART } from '../utils/helpers';

interface ChallengeModalProps {
  isOpen: boolean;
  patent: PatentCaseData | null;
  onClose: () => void;
  onSubmit: (patentId: number, priorArtUrl: string, bondGen: string) => Promise<void>;
  loading: boolean;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  patent,
  onClose,
  onSubmit,
  loading,
}) => {
  if (!isOpen || !patent) return null;

  // Min bond is 10% of patent escrow deposit
  const escrowWei = BigInt(patent.escrow_deposit || '0');
  const minBondWei = escrowWei / 10n > 0n ? escrowWei / 10n : 1n;
  const minBondGen = formatGen(minBondWei);

  const [priorArtUrl, setPriorArtUrl] = useState('');
  const [bond, setBond] = useState(minBondGen);
  const [error, setError] = useState('');

  const handleApplyPreset = (url: string) => {
    setPriorArtUrl(url);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUrl = priorArtUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setError('Prior art evidence must be a valid public web URL (http:// or https://).');
      return;
    }

    const bondVal = parseFloat(bond);
    if (isNaN(bondVal) || bondVal < parseFloat(minBondGen)) {
      setError(`Must stake at least 10% anti-griefing bond (${minBondGen} GEN).`);
      return;
    }

    try {
      await onSubmit(patent.patent_id, cleanUrl, bond);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit prior art challenge.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-900">
                File Prior Art Collision Challenge
              </h2>
              <p className="text-xs text-slate-500">
                Case #{patent.patent_id}: {patent.patent_title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Challenged Patent Summary */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Patent Validity Escrow:</span>
            <span className="font-semibold text-teal-800">{formatGen(patent.escrow_deposit)} GEN</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Required Anti-Griefing Bond:</span>
            <span className="font-semibold text-rose-700">Min {minBondGen} GEN (10%)</span>
          </div>
          <div className="pt-2 border-t border-slate-200/60">
            <p className="text-slate-500 font-medium mb-1">Patent Claim to Invalidate:</p>
            <p className="italic text-slate-700 bg-white p-2 rounded border border-slate-200 text-[11px] leading-relaxed">
              "{patent.novelty_claims}"
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-rose-600" />
            <span>Preset Prior Art Documents (arXiv / Specifications):</span>
          </div>
          <div className="space-y-1.5">
            {PRESET_PRIOR_ART.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset.url)}
                className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-rose-900">
                    {preset.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate max-w-md">
                    {preset.desc}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Select
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Public Prior Art Evidence URL (arXiv / Patent / Document)
            </label>
            <input
              type="url"
              value={priorArtUrl}
              onChange={(e) => setPriorArtUrl(e.target.value)}
              placeholder="https://raw.githubusercontent.com/.../paper.txt or https://arxiv.org/..."
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              disabled={loading}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The Intelligent Contract will fetch and render this URL live via <code className="text-slate-600">gl.nondet.web.render</code>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Staked Anti-Griefing Bond (GEN)
            </label>
            <input
              type="number"
              step="0.01"
              min={minBondGen}
              value={bond}
              onChange={(e) => setBond(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold text-rose-700"
              disabled={loading}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Refunded + 100% of patent escrow if patent is invalidated. Forfeited to inventor if patent is upheld.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Staking Challenge...</span>
                </>
              ) : (
                <span>Stake Bond & File Collision</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
