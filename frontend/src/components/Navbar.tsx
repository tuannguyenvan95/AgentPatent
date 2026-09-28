import React, { useState } from 'react';
import {
  Cpu,
  Wallet,
  Settings,
  PlusCircle,
  ExternalLink,
  Coins,
  CheckCircle2,
  Copy,
  ChevronDown,
  ShieldCheck,
  Radio,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';
import { truncateAddress } from '../utils/helpers';
import { STUDIONET_CHAIN_ID, STUDIO_URL } from '../config/genlayer';

interface NavbarProps {
  userAddress: string;
  userBalance: string;
  contractAddress: string;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onOpenRegisterModal: () => void;
  onSaveContractAddress: (newAddr: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userAddress,
  userBalance,
  contractAddress,
  onConnectWallet,
  onDisconnectWallet,
  onOpenRegisterModal,
  onSaveContractAddress,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [tempAddress, setTempAddress] = useState(contractAddress);
  const [showFaucetHelp, setShowFaucetHelp] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempAddress.trim().startsWith('0x')) {
      onSaveContractAddress(tempAddress.trim());
      setShowSettings(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(userAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070A11]/95 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left Zone: Brand & Identity (Aligned with Docket Sidebar) */}
          <div className="flex items-center space-x-3 min-w-[240px] xl:min-w-[280px]">
            {/* Cyber Forensic Logo with Rotating Orbit Light Beam */}
            <div className="relative h-10 w-10 rounded-xl p-[1.5px] overflow-hidden flex items-center justify-center group flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              {/* Rotating glowing laser beam running around the logo border */}
              <div
                className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_280deg,#06B6D4_330deg,#14B8A6_360deg)] animate-spin"
                style={{ animationDuration: '3.5s' }}
              />
              {/* Inner dark core */}
              <div className="relative h-full w-full rounded-[10px] bg-[#0A0E17] flex items-center justify-center border border-cyan-500/30">
                <Cpu className="h-5 w-5 text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-space text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  AGENTPATENT
                  <span className="text-cyan-400 font-mono text-xs">//</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    LAB-01
                  </span>
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 tracking-wide flex items-center gap-1.5">
                <span className="text-teal-400 flex items-center gap-1">
                  <Radio className="h-2.5 w-2.5 animate-pulse" />
                  ONLINE
                </span>
                <span>•</span>
                <span className="hidden sm:inline text-slate-400">AI Prior Art & Collision Court</span>
              </p>
            </div>
          </div>

          {/* Center Zone: Cyber Telemetry HUD (Balanced with Forensic Bench) */}
          <div className="hidden md:flex items-center justify-center space-x-2.5 flex-1 max-w-xl mx-auto">
            {/* Studionet Chain Indicator */}
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-[#0A0E17] border border-[#1E293B] text-[11px] font-mono text-slate-300">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-slate-400">NET:</span>
              <span className="text-cyan-300 font-bold">STUDIONET ({STUDIONET_CHAIN_ID})</span>
            </div>

            {/* Smart Contract Indicator with quick edit */}
            <button
              onClick={() => {
                setTempAddress(contractAddress);
                setShowSettings(true);
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#0A0E17] border border-cyan-500/30 hover:border-cyan-400/60 text-[11px] font-mono text-slate-300 transition-colors group"
              title="Click to inspect or change contract address"
            >
              <Terminal className="h-3 w-3 text-cyan-400 group-hover:text-cyan-300" />
              <span className="text-slate-400">CONTRACT:</span>
              <span className="text-teal-300 font-semibold">{truncateAddress(contractAddress)}</span>
            </button>

            {/* Canary Guard Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#0A0E17] border border-[#1E293B] text-[11px] font-mono text-slate-300">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">CANARY V2</span>
            </div>
          </div>

          {/* Right Zone: Controls & Wallet Actions (Aligned with Action Chamber) */}
          <div className="flex items-center space-x-2.5 justify-end min-w-[240px] xl:min-w-[280px]">
            {/* Treasury Faucet Link */}
            <button
              onClick={() => setShowFaucetHelp(!showFaucetHelp)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
              title="Need GEN for escrow or bond?"
            >
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">GET GEN</span>
              <ChevronDown className="h-3 w-3 text-amber-400" />
            </button>

            {/* Register Patent Button */}
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-space font-bold uppercase tracking-wider text-[#070A11] bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 hover:from-cyan-300 hover:to-teal-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">DEPOSIT CLAIMS</span>
              <span className="sm:hidden">NEW</span>
            </button>

            {/* Wallet Connect / Telemetry Pill */}
            {userAddress ? (
              <div className="flex items-center space-x-1.5 bg-[#0A0E17] border border-[#1E293B] rounded-lg p-1">
                <div className="px-2 py-0.5 text-xs font-mono hidden xl:block">
                  <span className="text-slate-500 text-[10px]">VAULT: </span>
                  <span className="font-bold text-teal-300">{userBalance} GEN</span>
                </div>
                <button
                  onClick={copyAddress}
                  className="flex items-center space-x-1 px-2 py-1 text-xs font-mono bg-[#0F1523] border border-[#1E293B] rounded hover:border-cyan-500/50 transition-colors text-slate-300"
                  title="Click to copy address"
                >
                  {copied ? (
                    <CheckCircle2 className="h-3 w-3 text-teal-400" />
                  ) : (
                    <Copy className="h-3 w-3 text-slate-500" />
                  )}
                  <span>{truncateAddress(userAddress)}</span>
                </button>
                <button
                  onClick={onDisconnectWallet}
                  className="px-1.5 py-1 text-[11px] font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded transition-colors"
                  title="Disconnect Wallet"
                >
                  EXIT
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-space font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all"
              >
                <Wallet className="h-3.5 w-3.5 text-cyan-400" />
                <span>CONNECT</span>
              </button>
            )}

            {/* Settings */}
            <button
              onClick={() => {
                setTempAddress(contractAddress);
                setShowSettings(true);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#0A0E17] border border-transparent hover:border-[#1E293B] transition-colors"
              title="Contract Configuration"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Faucet Help Dropdown Banner */}
      {showFaucetHelp && (
        <div className="bg-[#0A0E17] border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200/90 shadow-lg">
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span className="font-mono text-[11px]">
                <strong>Need GEN to stake or register?</strong> On GenLayer Studionet, fund your MetaMask wallet by transferring 10-50 GEN from the pre-funded accounts in the{' '}
                <a
                  href={STUDIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold text-amber-300 hover:text-white inline-flex items-center"
                >
                  GenLayer Studio Accounts Console
                  <ExternalLink className="h-3 w-3 ml-0.5 inline" />
                </a>.
              </span>
            </div>
            <button
              onClick={() => setShowFaucetHelp(false)}
              className="text-amber-400 hover:text-white text-xs font-mono font-bold uppercase underline"
            >
              [DISMISS]
            </button>
          </div>
        </div>
      )}

      {/* Contract Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#0A0E17] rounded-2xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(6,182,212,0.2)] border border-cyan-500/40 text-slate-200">
            <div className="flex items-center space-x-2.5 mb-2">
              <Terminal className="h-5 w-5 text-cyan-400" />
              <h3 className="font-space text-base font-bold uppercase tracking-wider text-slate-100">
                INTELLIGENT CONTRACT ROUTING
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
              Target GenLayer Studionet (Chain ID 61999) deployed contract instance.
            </p>

            <form onSubmit={handleSaveSettings}>
              <div className="mb-4">
                <label className="block text-xs font-mono font-semibold text-cyan-300 mb-1">
                  CONTRACT_ADDRESS_HEX
                </label>
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 text-xs font-mono bg-[#070A11] border border-[#1E293B] rounded-lg text-cyan-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                />
              </div>

              <div className="flex justify-end space-x-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-space font-bold uppercase tracking-wider text-[#070A11] bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-lg shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                >
                  SAVE_ROUTING
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
