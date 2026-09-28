import React from 'react';
import { Shield, Lock, FileSearch, CheckCircle2, UserCheck } from 'lucide-react';
import { ProtocolStats } from '../config/genlayer';
import { formatGen, truncateAddress } from '../utils/helpers';

interface StatsBarProps {
  stats: ProtocolStats;
  loading: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Patents */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Patents Filed
            </p>
            <p className="mt-1 font-serif text-3xl font-bold text-slate-900">
              {loading ? '—' : stats.total_patents}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
            <Shield className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] text-slate-500">
          <span className="font-medium text-teal-700">Novelty claims</span>
          <span className="mx-1">•</span>
          <span>Subject to AI prior art search</span>
        </div>
      </div>

      {/* Total Escrow Locked */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Locked Escrow
            </p>
            <p className="mt-1 font-serif text-3xl font-bold text-teal-800">
              {loading ? '—' : `${formatGen(stats.total_patent_locked)}`}
              <span className="text-sm font-sans font-normal text-slate-500 ml-1">GEN</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
            <Lock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] text-slate-500">
          <span className="font-medium text-indigo-700">Validity & challenge bonds</span>
          <span className="mx-1">•</span>
          <span>Zero loss protocol</span>
        </div>
      </div>

      {/* Active Examinations */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Inquiries
            </p>
            <p className="mt-1 font-serif text-3xl font-bold text-amber-700">
              {loading ? '—' : stats.active_examinations ?? 0}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <FileSearch className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] text-slate-500">
          <span className="font-medium text-amber-700">Under examination</span>
          <span className="mx-1">•</span>
          <span>24-block cooling off window</span>
        </div>
      </div>

      {/* Total Collisions Resolved */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Adjudications Settled
            </p>
            <p className="mt-1 font-serif text-3xl font-bold text-slate-900">
              {loading ? '—' : stats.total_disputes_resolved}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-[11px] text-slate-500">
          {stats.platform_admin ? (
            <span className="inline-flex items-center gap-1 font-mono text-slate-600">
              <UserCheck className="h-3 w-3 text-slate-400" />
              Steward: {truncateAddress(stats.platform_admin)}
            </span>
          ) : (
            <span>Autonomous on-chain resolution</span>
          )}
        </div>
      </div>
    </div>
  );
};
