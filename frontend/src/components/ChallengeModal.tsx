import React, { useState } from 'react';
import { X, Flame, AlertCircle, Loader2, Sparkles, Scale, ExternalLink } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0E162B] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-rose-600/60 relative my-8 text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#233257]">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#881326] to-[#450A13] border border-[#C5A059] flex items-center justify-center text-rose-300 shadow-burgundy-glow">
              <Scale className="h-6 w-6 text-[#E5C158]" />
            </div>
            <div>
              <h2 className="font-cinzel text-xl font-bold text-rose-200">
                Bill of Indictment: Prior Art Collision
              </h2>
              <p className="text-xs font-cormorant italic text-slate-400">
                Docket #{patent.patent_id} • Challenge to Novelty & Non-Obviousness
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Challenged Patent Summary */}
        <div className="mt-4 p-4 bg-[#080C18] rounded-xl border border-[#233257] text-xs space-y-2">
          <div className="flex justify-between">
            <span className="font-cinzel text-slate-400">Patent Validity Bond at Stake:</span>
            <span className="font-mono font-bold text-[#E5C158]">{formatGen(patent.escrow_deposit)} GEN</span>
          </div>
          <div className="flex justify-between">
            <span className="font-cinzel text-slate-400">Required Challenger Bond:</span>
            <span className="font-mono font-bold text-rose-400">Min {minBondGen} GEN (10%)</span>
          </div>
          <div className="pt-2 border-t border-[#233257]">
            <p className="font-cinzel text-slate-400 mb-1">Target Claim Under Indictment:</p>
            <p className="italic font-cormorant text-slate-200 bg-[#121D38] p-2.5 rounded-lg border border-[#233257] text-sm leading-relaxed">
              "{patent.novelty_claims}"
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4">
          <div className="flex items-center space-x-1.5 text-xs font-cinzel font-bold text-amber-200 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-[#E5C158]" />
            <span>Exemplary Prior Art Publications (arXiv / Whitepapers):</span>
          </div>
          <div className="space-y-1.5">
            {PRESET_PRIOR_ART.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset.url)}
                className="w-full text-left p-2.5 rounded-xl bg-[#080C18] border border-[#233257] hover:border-rose-500/60 hover:bg-[#881326]/20 transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-cinzel font-semibold text-slate-200 group-hover:text-amber-200">
                    {preset.title}
                  </p>
                  <p className="text-[11px] font-cormorant italic text-slate-400 truncate max-w-md">
                    {preset.desc}
                  </p>
                </div>
                <span className="text-[10px] font-cinzel font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-600/40">
                  Cite
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-cinzel font-semibold text-[#C5A059] mb-1">
              Public Prior Art Evidence URL (arXiv / Patent / Document)
            </label>
            <input
              type="url"
              value={priorArtUrl}
              onChange={(e) => setPriorArtUrl(e.target.value)}
              placeholder="https://raw.githubusercontent.com/.../paper.txt or https://arxiv.org/..."
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#080C18] border border-[#233257] rounded-xl text-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              disabled={loading}
            />
            <p className="text-[11px] font-cormorant italic text-slate-400 mt-1">
              The Intelligent Contract will inspect this publication live via <code className="text-[#E5C158]">gl.nondet.web.render</code>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-cinzel font-semibold text-[#C5A059] mb-1">
              Staked Anti-Griefing Bond (GEN)
            </label>
            <input
              type="number"
              step="0.01"
              min={minBondGen}
              value={bond}
              onChange={(e) => setBond(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-[#080C18] border border-[#233257] rounded-xl text-rose-400 focus:outline-none focus:border-rose-500"
              disabled={loading}
            />
            <p className="text-[11px] font-cormorant italic text-slate-400 mt-1">
              Refunded + 100% of patent escrow if collision is confirmed. Forfeited to inventor if claims are upheld.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/70 border border-rose-600 rounded-xl flex items-center space-x-2 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#233257]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-cinzel text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 text-xs font-cinzel font-bold text-white bg-[#881326] hover:bg-[#A31B32] border border-[#C5A059]/60 rounded-xl shadow-burgundy-glow transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Staking Indictment...</span>
                </>
              ) : (
                <span>Stake Bond & File Indictment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
