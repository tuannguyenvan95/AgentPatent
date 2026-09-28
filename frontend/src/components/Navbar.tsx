import React, { useState } from 'react';
import {
  Scale,
  Wallet,
  Settings,
  PlusCircle,
  ExternalLink,
  Coins,
  CheckCircle2,
  Copy,
  ChevronDown,
  ShieldCheck,
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
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-lg bg-[#0F172A] flex items-center justify-center text-white shadow-md ring-1 ring-slate-900/10">
              <Scale className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#0F172A]">
                  AgentPatent
                </span>
                <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  v3 Court
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Autonomous AI Research Prior Art & Patent Collision Court
              </p>
            </div>
          </div>

          {/* Network & Actions */}
          <div className="flex items-center space-x-3">
            {/* Studionet Pill */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Studionet ({STUDIONET_CHAIN_ID})</span>
            </div>

            {/* Faucet Aid Button */}
            <button
              onClick={() => setShowFaucetHelp(!showFaucetHelp)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              title="How to get testnet GEN"
            >
              <Coins className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden sm:inline">Get GEN</span>
              <ChevronDown className="h-3 w-3 text-amber-600" />
            </button>

            {/* Register Patent Button */}
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 shadow-sm transition-all active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-teal-300" />
              <span>Deposit Patent Claims</span>
            </button>

            {/* Wallet Connect / User Pill */}
            {userAddress ? (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
                <div className="px-2.5 py-1 text-xs font-medium text-slate-700">
                  <span className="text-slate-400 font-normal">Balance: </span>
                  <span className="font-semibold text-teal-700">{userBalance} GEN</span>
                </div>
                <button
                  onClick={copyAddress}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                  title="Click to copy full address"
                >
                  {copied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  <span>{truncateAddress(userAddress)}</span>
                </button>
                <button
                  onClick={onDisconnectWallet}
                  className="px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Disconnect Wallet"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 shadow-sm transition-all"
              >
                <Wallet className="h-4 w-4 text-teal-600" />
                <span>Connect MetaMask</span>
              </button>
            )}

            {/* Settings Trigger */}
            <button
              onClick={() => {
                setTempAddress(contractAddress);
                setShowSettings(true);
              }}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Contract Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Faucet Help Dropdown Banner */}
      {showFaucetHelp && (
        <div className="bg-amber-50/95 border-b border-amber-200 px-4 py-3 text-xs text-amber-900 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>Need GEN to stake or register?</strong> On GenLayer Studionet, fund your MetaMask wallet by transferring 10-50 GEN from the pre-funded accounts in{' '}
                <a
                  href={STUDIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold hover:text-amber-950 inline-flex items-center"
                >
                  GenLayer Studio Accounts panel
                  <ExternalLink className="h-3 w-3 ml-0.5 inline" />
                </a>.
              </span>
            </div>
            <button
              onClick={() => setShowFaucetHelp(false)}
              className="text-amber-700 hover:text-amber-950 text-xs font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Contract Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-serif text-lg font-bold text-slate-900 mb-1">
              Contract Configuration
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Connect to your deployed AgentPatent Intelligent Contract on GenLayer Studionet.
            </p>

            <form onSubmit={handleSaveSettings}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contract Address (Hex)
                </label>
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
