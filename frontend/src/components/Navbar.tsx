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
  Gavel,
  Scroll,
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
    <header className="sticky top-0 z-30 bg-[#090E1F]/95 backdrop-blur-md border-b border-[#C5A059]/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-22 py-2">
          {/* Imperial Crest & Tribunal Name */}
          <div className="flex items-center space-x-3.5">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#881326] to-[#450A13] flex items-center justify-center text-amber-300 shadow-burgundy-glow border border-[#C5A059]/60 relative group">
              <Scale className="h-6 w-6 text-[#E5C158]" />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#C5A059] flex items-center justify-center text-[9px] text-[#0A1128] font-bold">
                §
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-cinzel text-xl sm:text-2xl font-black tracking-wider text-[#F5EFE0] drop-shadow-sm">
                  AGENTPATENT
                </span>
                <span className="text-[10px] uppercase tracking-widest font-serif font-bold px-2 py-0.5 rounded bg-[#881326]/60 text-amber-200 border border-[#C5A059]/40">
                  Supreme Tribunal
                </span>
              </div>
              <p className="text-[11px] font-cormorant italic text-[#C5A059] tracking-wide">
                Curia Maxima de Collisionibus Inventionum • GenLayer Studionet
              </p>
            </div>
          </div>

          {/* Network & Court Controls */}
          <div className="flex items-center space-x-3">
            {/* Studionet Pill */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#121D38] border border-[#C5A059]/30 text-xs font-mono text-amber-200/90 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Studionet ({STUDIONET_CHAIN_ID})</span>
            </div>

            {/* Treasury GEN Guide */}
            <button
              onClick={() => setShowFaucetHelp(!showFaucetHelp)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-semibold text-amber-200 bg-[#881326]/30 hover:bg-[#881326]/50 border border-[#C5A059]/40 transition-colors shadow-sm"
              title="How to obtain Treasury GEN"
            >
              <Coins className="h-3.5 w-3.5 text-[#E5C158]" />
              <span className="hidden sm:inline">Treasury GEN</span>
              <ChevronDown className="h-3 w-3 text-[#C5A059]" />
            </button>

            {/* Enact Patent Deed */}
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#FFF6D6] via-[#E5C158] to-[#C5A059] hover:from-white hover:to-[#E5C158] shadow-gold-glow transition-all active:scale-95"
            >
              <Scroll className="h-4 w-4 text-[#090E1F]" />
              <span>Enroll Patent Claim</span>
            </button>

            {/* Wallet Section */}
            {userAddress ? (
              <div className="flex items-center space-x-2 bg-[#121D38] border border-[#C5A059]/40 rounded-xl p-1 shadow-md">
                <div className="px-3 py-1 text-xs">
                  <span className="text-[#94A3B8] font-serif text-[11px]">Vault: </span>
                  <span className="font-mono font-bold text-[#E5C158]">{userBalance} GEN</span>
                </div>
                <button
                  onClick={copyAddress}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono bg-[#090E1F] border border-[#C5A059]/30 rounded-lg hover:border-[#C5A059] transition-colors text-slate-300"
                  title="Copy Advocate Address"
                >
                  {copied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-[#C5A059]" />
                  )}
                  <span>{truncateAddress(userAddress)}</span>
                </button>
                <button
                  onClick={onDisconnectWallet}
                  className="px-2 py-1 text-xs font-serif text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                  title="Recuse Counselor"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-cinzel font-bold text-amber-200 bg-[#881326] hover:bg-[#A31B32] border border-[#C5A059]/60 shadow-burgundy-glow transition-all"
              >
                <Wallet className="h-4 w-4 text-[#E5C158]" />
                <span>Connect MetaMask</span>
              </button>
            )}

            {/* Tribunal Seal Settings */}
            <button
              onClick={() => {
                setTempAddress(contractAddress);
                setShowSettings(true);
              }}
              className="p-2 rounded-xl text-[#C5A059] hover:text-amber-100 hover:bg-[#121D38] border border-transparent hover:border-[#C5A059]/30 transition-colors"
              title="Configure Deployed Contract"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Treasury Help Banner */}
      {showFaucetHelp && (
        <div className="bg-[#121D38] border-b border-[#C5A059]/30 px-4 py-3 text-xs text-amber-100/90 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-[#E5C158] flex-shrink-0" />
              <span>
                <strong>Require GEN for Escrow or Litigation?</strong> In GenLayer Studionet, disburse 10–50 GEN directly into your MetaMask from pre-funded accounts in the{' '}
                <a
                  href={STUDIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold text-[#E5C158] hover:text-white inline-flex items-center"
                >
                  GenLayer Studio Accounts Console
                  <ExternalLink className="h-3 w-3 ml-0.5 inline" />
                </a>.
              </span>
            </div>
            <button
              onClick={() => setShowFaucetHelp(false)}
              className="text-[#C5A059] hover:text-white text-xs font-cinzel underline font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Contract Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#0E162B] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#C5A059]/50 text-slate-200">
            <div className="flex items-center space-x-2.5 mb-2">
              <Gavel className="h-5 w-5 text-[#E5C158]" />
              <h3 className="font-cinzel text-lg font-bold text-amber-200">
                Tribunal Registry Registry
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-serif mb-4 leading-relaxed">
              Connect to your deployed AgentPatent Intelligent Contract on GenLayer Studionet (Chain 61999).
            </p>

            <form onSubmit={handleSaveSettings}>
              <div className="mb-4">
                <label className="block text-xs font-cinzel font-semibold text-[#C5A059] mb-1">
                  Contract Address (Hexadecimal)
                </label>
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 text-xs font-mono bg-[#080C18] border border-[#C5A059]/40 rounded-lg text-amber-200 focus:outline-none focus:ring-1 focus:ring-[#E5C158]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 text-xs font-serif text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#E5C158] to-[#C5A059] hover:from-white hover:to-[#E5C158] rounded-lg shadow-gold-glow"
                >
                  Ratify Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
