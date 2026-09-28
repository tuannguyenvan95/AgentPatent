import React, { useState } from 'react';
import { X, Sparkles, Shield, AlertCircle, Loader2 } from 'lucide-react';
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
  const [deposit, setDeposit] = useState('2.0');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-900">
                Deposit Patent Claim & Escrow
              </h2>
              <p className="text-xs text-slate-500">
                Lock GEN validity bond to assert scientific novelty on-chain.
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

        {/* Presets Bar */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Quick Scientific Presets (1-Click Fill):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_PATENTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-teal-500 hover:text-teal-700 hover:shadow-xs transition-all text-left"
              >
                {preset.title.slice(0, 32)}... ({preset.depositGen} GEN)
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patent / Invention Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Autonomous Verifiable Transformer Activation Cache"
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Novelty Claims & Mathematical / Architectural Specification
            </label>
            <textarea
              rows={4}
              value={claims}
              onChange={(e) => setClaims(e.target.value)}
              placeholder="Detail the core inventive step, formula, or architecture that is not anticipated by prior scientific publications..."
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 leading-relaxed font-sans"
              disabled={loading}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum 20 characters. Will be compared directly against submitted prior art by the GenLayer AI Board.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Validity Escrow Bond (GEN)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="2.0"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold text-teal-800"
                disabled={loading}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Locked in escrow. Awarded to challenger if invalid; reclaimed if defended.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Protection Duration (Blocks)
              </label>
              <input
                type="number"
                min="50"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="500"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                disabled={loading}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Duration during which prior art challenges are accepted.
              </p>
            </div>
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
              className="flex items-center space-x-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-teal-300" />
                  <span>Staking & Registering...</span>
                </>
              ) : (
                <span>Lock Escrow & Assert Novelty</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
