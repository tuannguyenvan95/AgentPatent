import React, { useState } from 'react';
import { X, Sparkles, Shield, AlertCircle, Loader2, Scroll, Feather } from 'lucide-react';
import { PRESET_PATENTS, PresetPatent } from '../utils/helpers';

interface RegisterPatentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, claims: string, durationBlocks: number, depositGen: string) => Promise<void>;
  loading: boolean;
}

export const RegisterPatentModal: React.FC<RegisterPatentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}) => {
  const [title, setTitle] = useState('');
  const [claims, setClaims] = useState('');
  const [duration, setDuration] = useState('500');
  const [deposit, setDeposit] = useState('3.5');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: PresetPatent) => {
    setTitle(preset.title);
    setClaims(preset.claims);
    setDeposit(preset.depositGen);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || title.trim().length < 5) {
      setError('Patent title must be at least 5 characters.');
      return;
    }

    if (!claims.trim() || claims.trim().length < 20) {
      setError('Novelty claims and inventive specification must be at least 20 characters.');
      return;
    }

    const depNum = parseFloat(deposit);
    if (isNaN(depNum) || depNum <= 0) {
      setError('Escrow deposit must be greater than 0 GEN.');
      return;
    }

    const durNum = parseInt(duration, 10);
    if (isNaN(durNum) || durNum <= 0) {
      setError('Protection duration must be greater than 0 blocks.');
      return;
    }

    try {
      await onSubmit(title.trim(), claims.trim(), durNum, deposit);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to register patent claim.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0E162B] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#C5A059]/60 relative my-8 text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#233257]">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-[#881326]/60 border border-[#C5A059] flex items-center justify-center text-[#E5C158] shadow-burgundy-glow">
              <Scroll className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-cinzel text-xl font-bold text-[#F5EFE0]">
                Charter of Invention & Validity Bond
              </h2>
              <p className="text-xs font-cormorant italic text-[#C5A059]">
                Petition for On-Chain Novelty Protection • High Tribunal of Patents
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

        {/* Presets Bar */}
        <div className="mt-4 p-3.5 bg-[#080C18] rounded-xl border border-[#C5A059]/30">
          <div className="flex items-center space-x-1.5 text-xs font-cinzel font-bold text-[#E5C158] mb-2">
            <Feather className="h-3.5 w-3.5" />
            <span>Select Archival Formulation Preset (1-Click Fill):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_PATENTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-[11px] font-serif px-2.5 py-1 rounded-lg bg-[#121D38] border border-[#C5A059]/40 text-slate-200 hover:border-[#E5C158] hover:text-[#E5C158] transition-all text-left"
              >
                {preset.title.slice(0, 34)}... ({preset.depositGen} GEN)
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-cinzel font-semibold text-[#C5A059] mb-1">
              Title of the Claimed Invention
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Non-Euclidean Activation Manifold for Verifiable Inference"
              className="w-full px-3.5 py-2.5 text-xs font-serif bg-[#080C18] border border-[#233257] rounded-xl text-amber-100 focus:outline-none focus:border-[#E5C158] focus:ring-1 focus:ring-[#E5C158]"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-cinzel font-semibold text-[#C5A059] mb-1">
              Novelty Specification & Mathematical Formulation
            </label>
            <textarea
              rows={4}
              value={claims}
              onChange={(e) => setClaims(e.target.value)}
              placeholder="Detail the core inventive step, formulas, and structural architecture distinguishing this patent from all known scientific prior art..."
              className="w-full px-3.5 py-2.5 text-xs font-cormorant text-base bg-[#080C18] border border-[#233257] rounded-xl text-slate-200 focus:outline-none focus:border-[#E5C158] focus:ring-1 focus:ring-[#E5C158] leading-relaxed"
              disabled={loading}
            />
            <p className="text-[11px] font-cormorant italic text-slate-400 mt-1">
              Minimum 20 characters. The GenLayer AI Examination Board will cross-examine these exact claims against all adversarial prior art.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-cinzel font-semibold text-[#C5A059] mb-1">
                Validity Escrow Bond (GEN)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="3.5"
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-[#080C18] border border-[#233257] rounded-xl text-[#E5C158] focus:outline-none focus:border-[#E5C158]"
                disabled={loading}
              />
              <p className="text-[11px] font-cormorant italic text-slate-400 mt-1">
                Held in High Court Vault. Awarded to challenger if invalid; reclaimed if upheld.
              </p>
            </div>

            <div>
              <label className="block text-xs font-cinzel font-semibold text-[#C5A059] mb-1">
                Duration of Term (Blocks)
              </label>
              <input
                type="number"
                min="50"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="500"
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#080C18] border border-[#233257] rounded-xl text-slate-200 focus:outline-none focus:border-[#E5C158]"
                disabled={loading}
              />
              <p className="text-[11px] font-cormorant italic text-slate-400 mt-1">
                Window of blocks open to public prior art indictments.
              </p>
            </div>
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
              className="flex items-center space-x-2 px-6 py-2.5 text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#FFF6D6] via-[#E5C158] to-[#C5A059] hover:from-white hover:to-[#E5C158] rounded-xl shadow-gold-glow transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#090E1F]" />
                  <span>Enrolling Charter...</span>
                </>
              ) : (
                <span>Seal Charter & Lock Escrow</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
