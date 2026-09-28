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
    <header className="sticky top-0 z-30 bg-[#070A11]/95 backdrop-blur-xl border-b border-[#1A2338] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Terminal Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-xl bg-[#0A0E17] border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-teal-glow relative group">
              <Cpu className="h-6 w-6 text-teal-400 group-hover:scale-105 transition-transform" />
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-teal-400 animate-ping" />
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-teal-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  AGENTPATENT
                  <span className="text-teal-400 font-mono text-sm">//</span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                    LAB-01
                  </span>
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 tracking-wide flex items-center gap-2">
                <span className="text-teal-400 flex items-center gap-1">
                  <Radio className="h-3 w-3 animate-pulse" />
                  ONLINE
                </span>
                <span>•</span>
                <span>Prior Art Collision Radar • GenLayer Studionet</span>
              </p>
            </div>
          </div>

          {/* Controls & Telemetry */}
          <div className="flex items-center space-x-3">
            {/* Studionet Radar Pill */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0A0E17] border border-[#1A2338] text-xs font-mono text-slate-300 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <span>STUDIONET ({STUDIONET_CHAIN_ID})</span>
            </div>

            {/* Treasury GEN Guide */}
            <button
              onClick={() => setShowFaucetHelp(!showFaucetHelp)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
              title="How to get testnet GEN"
            >
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">GET GEN</span>
              <ChevronDown className="h-3 w-3 text-amber-400" />
            </button>

            {/* Register Patent Button */}
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-display font-bold text-[#070A11] bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-400 hover:brightness-110 shadow-teal-glow transition-all active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-[#070A11]" />
              <span>+ DEPOSIT CLAIMS</span>
            </button>

            {/* Wallet Connect / Telemetry Pill */}
            {userAddress ? (
              <div className="flex items-center space-x-2 bg-[#0A0E17] border border-[#1A2338] rounded-xl p-1">
                <div className="px-3 py-1 text-xs font-mono">
                  <span className="text-slate-500 text-[11px]">VAULT: </span>
                  <span className="font-bold text-teal-300">{userBalance} GEN</span>
                </div>
                <button
                  onClick={copyAddress}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono bg-[#0F1523] border border-[#1A2338] rounded-lg hover:border-teal-500/50 transition-colors text-slate-300"
                  title="Click to copy address"
                >
                  {copied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                  )}
                  <span>{truncateAddress(userAddress)}</span>
                </button>
                <button
                  onClick={onDisconnectWallet}
                  className="px-2 py-1 text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded transition-colors"
                  title="Disconnect Wallet"
                >
                  EXIT
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-display font-bold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 shadow-teal-glow transition-all"
              >
                <Wallet className="h-4 w-4 text-teal-400" />
                <span>CONNECT METAMASK</span>
              </button>
            )}

            {/* Terminal Settings */}
            <button
              onClick={() => {
                setTempAddress(contractAddress);
                setShowSettings(true);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-teal-300 hover:bg-[#0A0E17] border border-transparent hover:border-[#1A2338] transition-colors"
              title="Terminal Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Faucet Help Dropdown Banner */}
      {showFaucetHelp && (
        <div className="bg-[#0A0E17] border-b border-amber-500/30 px-4 py-3 text-xs text-amber-200/90">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0A0E17] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-500/40 text-slate-200">
            <div className="flex items-center space-x-2.5 mb-2">
              <Terminal className="h-5 w-5 text-teal-400" />
              <h3 className="font-display text-lg font-bold text-white">
                INTELLIGENT CONTRACT ROUTING
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
              Target GenLayer Studionet (Chain ID 61999) deployed contract instance.
            </p>

            <form onSubmit={handleSaveSettings}>
              <div className="mb-4">
                <label className="block text-xs font-mono font-semibold text-teal-300 mb-1">
                  CONTRACT_ADDRESS_HEX
                </label>
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 text-xs font-mono bg-[#070A11] border border-[#1A2338] rounded-lg text-teal-200 focus:outline-none focus:border-teal-400"
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
                  className="px-4 py-1.5 font-bold text-[#070A11] bg-teal-400 hover:bg-teal-300 rounded-lg shadow-teal-glow"
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
