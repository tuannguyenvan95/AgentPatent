import React, { useState, useEffect, useCallback } from 'react';
import {
  Scale,
  Shield,
  FileSearch,
  Filter,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Award,
  Lock,
  ArrowRight,
  Gavel,
  Scroll,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { PatentCard } from './components/PatentCard';
import { RegisterPatentModal } from './components/RegisterPatentModal';
import { ChallengeModal } from './components/ChallengeModal';
import { ExaminationModal } from './components/ExaminationModal';
import { DisputeModal } from './components/DisputeModal';
import { AdminArbitrationModal } from './components/AdminArbitrationModal';
import {
  getSavedContractAddress,
  saveContractAddress,
  fetchStudionetBalance,
  fetchStats,
  fetchAllPatents,
  ensureStudionet,
  registerPatentClaimOnChain,
  challengePriorArtOnChain,
  adjudicateCollisionOnChain,
  raiseDisputeOnChain,
  finalizeSettlementOnChain,
  resolveEscalationOnChain,
  reclaimExpiredPatentOnChain,
  PatentCaseData,
  ProtocolStats,
  STUDIONET_CHAIN_ID,
  STUDIO_URL,
} from './config/genlayer';
import { parseGenToWei } from './utils/helpers';

export const App: React.FC = () => {
  // Web3 state
  const [contractAddress, setContractAddress] = useState<string>(getSavedContractAddress());
  const [userAddress, setUserAddress] = useState<string>('');
  const [userBalance, setUserBalance] = useState<string>('0.00');

  // App data state
  const [patents, setPatents] = useState<PatentCaseData[]>([]);
  const [stats, setStats] = useState<ProtocolStats>({
    total_patents: 0,
    total_patent_locked: '0',
    total_disputes_resolved: 0,
    active_examinations: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Filter state: 'all' | 'active' | 'in_exam' | 'settled'
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'in_exam' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState<PatentCaseData | null>(null);
  const [examinationTarget, setExaminationTarget] = useState<PatentCaseData | null>(null);
  const [disputeTarget, setDisputeTarget] = useState<PatentCaseData | null>(null);
  const [adminArbitrationTarget, setAdminArbitrationTarget] = useState<PatentCaseData | null>(null);

  // Helper for notification toast
  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 7000);
  };

  // Connect MetaMask
  const handleConnectWallet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      showToast('error', 'MetaMask is not detected. Please install MetaMask to access the High Court.');
      return;
    }
    try {
      await ensureStudionet();
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      if (accounts && accounts[0]) {
        setUserAddress(accounts[0]);
        showToast('success', `Admitted: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      }
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to authenticate advocate');
    }
  };

  const handleDisconnectWallet = () => {
    setUserAddress('');
    setUserBalance('0.00');
    showToast('info', 'Counselor recused from Tribunal session');
  };

  // Update Contract Address
  const handleSaveContractAddress = (newAddr: string) => {
    saveContractAddress(newAddr);
    setContractAddress(newAddr);
    showToast('success', `Tribunal Rolls synchronized to ${newAddr.slice(0, 8)}...`);
  };

  // Refresh data from Studionet RPC
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [allPatents, pStats] = await Promise.all([
        fetchAllPatents(contractAddress),
        fetchStats(contractAddress),
      ]);
      setPatents(allPatents);
      setStats(pStats);

      if (userAddress) {
        const bal = await fetchStudionetBalance(userAddress);
        setUserBalance(bal);
      }
    } catch (err: any) {
      console.warn('Data refresh failed:', err);
    } finally {
      setLoading(false);
    }
  }, [contractAddress, userAddress]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // MetaMask event listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      const handleAccountsChanged = (accs: string[]) => {
        if (accs.length === 0) {
          handleDisconnectWallet();
        } else {
          setUserAddress(accs[0]);
        }
      };
      const handleChainChanged = () => {
        window.location.reload();
      };
      eth.on('accountsChanged', handleAccountsChanged);
      eth.on('chainChanged', handleChainChanged);
      return () => {
        eth.removeListener('accountsChanged', handleAccountsChanged);
        eth.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // ── Write Actions ──────────────────────────────────────────────────

  const handleRegisterPatent = async (
    title: string,
    claims: string,
    durationBlocks: number,
    depositGen: string
  ) => {
    if (!userAddress) {
      await handleConnectWallet();
      return;
    }
    setActionLoading(true);
    try {
      const depositWei = parseGenToWei(depositGen);
      showToast('info', 'Sealing patent charter & depositing bond into court vault...');
      const tx = await registerPatentClaimOnChain(
        contractAddress,
        userAddress,
        title,
        claims,
        durationBlocks,
        depositWei
      );
      showToast('success', `Patent Charter enrolled! Record: ${tx.slice(0, 10)}...`);
      await refreshData();
    } catch (err: any) {
      showToast('error', err?.message || 'Transaction failed');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleChallengePriorArt = async (
    patentId: number,
    priorArtUrl: string,
    bondGen: string
  ) => {
    if (!userAddress) {
      await handleConnectWallet();
      return;
    }
    setActionLoading(true);
    try {
      const bondWei = parseGenToWei(bondGen);
      showToast('info', 'Filing bill of indictment & staking anti-griefing bond...');
      const tx = await challengePriorArtOnChain(
        contractAddress,
        userAddress,
        patentId,
        priorArtUrl,
        bondWei
      );
      showToast('success', `Indictment accepted! Docket #${patentId} sub judice. Tx: ${tx.slice(0, 10)}...`);
      await refreshData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to file indictment');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjudicateCollision = async (patentId: number) => {
    if (!userAddress) {
      await handleConnectWallet();
      return;
    }
    setActionLoading(true);
    try {
      showToast('info', 'Convening Autonomous GenLayer AI Examination Bench live on-chain...');
      const tx = await adjudicateCollisionOnChain(contractAddress, userAddress, patentId);
      showToast('success', `Bench decree delivered! 24-Block appeal window active. Tx: ${tx.slice(0, 10)}...`);
      await refreshData();
      if (examinationTarget && examinationTarget.patent_id === patentId) {
        const updated = await fetchAllPatents(contractAddress);
        const match = updated.find((p) => p.patent_id === patentId);
        if (match) setExaminationTarget(match);
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Adjudication failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRaiseDispute = async (patentId: number, reason: string) => {
    if (!userAddress) {
      await handleConnectWallet();
      return;
    }
    setActionLoading(true);
    try {
      showToast('info', 'Filing writ of appeal. Freezing escrow for Lord Chief Justice...');
      const tx = await raiseDisputeOnChain(contractAddress, userAddress, patentId, reason);
      showToast('success', `Writ accepted! Docket #${patentId} transferred to Steward. Tx: ${tx.slice(0, 10)}...`);
      await refreshData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to file appeal');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizeSettlement = async (patentId: number) => {
    if (!userAddress) {
      await handleConnectWallet();
      return;
    }
    setActionLoading(true);
    try {
      showToast('info', 'Executing final sovereign decree disbursement...');
      const tx = await finalizeSettlementOnChain(contractAddress, userAddress, patentId);
      showToast('success', `Decree executed! Escrow disbursed. Tx: ${tx.slice(0, 10)}...`);
      await refreshData();
    } catch (err: any) {
      showToast('error', err?.message || 'Execution halted. Cooling-off timelock may still be active.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveEscalation = async (
    patentId: number,
    resolution: 'INVALIDATE' | 'UPHOLD' | 'REFUND_SPLIT'
  ) => {
    if (!userAddress) {
      await handleConnectWallet();
      return;
    }
    setActionLoading(true);
    try {
      showToast('info', `Lord Chief Justice executing sovereign decree: ${resolution}...`);
      const tx = await resolveEscalationOnChain(contractAddress, userAddress, patentId, resolution);
      showToast('success', `Sovereign resolution enacted! Tx: ${tx.slice(0, 10)}...`);
      await refreshData();
    } catch (err: any) {
      showToast('error', err?.message || 'Arbitration execution failed');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleReclaimExpired = async (patentId: number) => {
    if (!userAddress) {
      await handleConnectWallet();
      return;
    }
    setActionLoading(true);
    try {
      showToast('info', 'Reclaiming unassailed validity bond upon term expiration...');
      const tx = await reclaimExpiredPatentOnChain(contractAddress, userAddress, patentId);
      showToast('success', `Bond reclaimed in full! Tx: ${tx.slice(0, 10)}...`);
      await refreshData();
    } catch (err: any) {
      showToast('error', err?.message || 'Reclaim failed. Term has not yet lapsed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter patents
  const filteredPatents = patents.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.patent_title.toLowerCase().includes(q);
      const matchClaims = p.novelty_claims.toLowerCase().includes(q);
      const matchId = String(p.patent_id).includes(q);
      if (!matchTitle && !matchClaims && !matchId) return false;
    }

    if (activeTab === 'active') return p.status === 0;
    if (activeTab === 'in_exam') return p.status === 1 || p.status === 2 || p.status === 6 || p.status === 7;
    if (activeTab === 'settled') return p.status === 3 || p.status === 4 || p.status === 5;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080C18] flex flex-col font-sans text-slate-200">
      {/* Supreme Tribunal Header */}
      <Navbar
        userAddress={userAddress}
        userBalance={userBalance}
        contractAddress={contractAddress}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onOpenRegisterModal={() => setIsRegisterOpen(true)}
        onSaveContractAddress={handleSaveContractAddress}
      />

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl border text-xs font-serif flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/70 shadow-lg'
                : notification.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-600/70 shadow-burgundy-glow'
                : 'bg-[#121D38] text-amber-200 border-[#C5A059]/60 shadow-gold-glow'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-[#E5C158]" />
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white font-bold ml-2 text-sm"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Judicial Chamber */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Supreme Court Grand Banner */}
        <section className="mb-10 text-center sm:text-left bg-gradient-to-r from-[#0E162B] via-[#121D38] to-[#0A1128] p-8 sm:p-10 rounded-3xl border border-[#C5A059]/40 shadow-2xl relative overflow-hidden">
          {/* Subtle Coat of Arms watermark */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 opacity-5 pointer-events-none">
            <Scale className="w-full h-full text-[#C5A059]" />
          </div>

          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#881326]/50 border border-[#C5A059]/40 text-[#E5C158] text-[11px] font-cinzel font-bold uppercase tracking-widest mb-3 shadow-burgundy-glow">
              <Gavel className="h-3.5 w-3.5" />
              <span>Lex Aeterna • Autonomous AI Prior Art & Collision Court</span>
            </div>
            <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5EFE0] tracking-tight leading-tight drop-shadow-md">
              Supreme High Tribunal of AI Inventions & Prior Art Collisions
            </h1>
            <p className="mt-3 text-sm sm:text-base font-cormorant italic text-slate-300 leading-relaxed max-w-2xl">
              "Iustitia in Scientia • Consensu Subiectivo Ratum." In an era of autonomous synthetic laboratories and algorithmic inventors, traditional patent offices fail. Here, inventors lock validity bonds to assert novel claims; challengers stake anti-griefing bonds and submit prior art publications. The <strong>Autonomous GenLayer AI Patent Bench</strong> scrapes documents live on-chain, applies a 3-lens forensic test, and adjudicates through decentralized subjective consensus.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="px-6 py-2.5 rounded-xl text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#FFF6D6] via-[#E5C158] to-[#C5A059] hover:from-white hover:to-[#E5C158] shadow-gold-glow transition-all active:scale-95"
              >
                Enroll New Patent Claims
              </button>
              <a
                href={STUDIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-xs font-cinzel font-semibold text-amber-200 bg-[#080C18] hover:bg-[#121D38] border border-[#C5A059]/40 shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                <span>GenLayer Studio Console</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#C5A059]" />
              </a>
            </div>
          </div>
        </section>

        {/* Treasury & Registry Statistics Bar */}
        <StatsBar stats={stats} loading={loading} />

        {/* Judicial Rolls Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex items-center bg-[#0E162B] p-1.5 rounded-2xl border border-[#233257] text-xs font-cinzel font-bold text-slate-400 w-full sm:w-auto shadow-inner">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-[#E5C158] to-[#C5A059] text-[#090E1F] shadow-gold-glow font-black'
                  : 'hover:text-[#E5C158]'
              }`}
            >
              All Dockets ({patents.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
                activeTab === 'active'
                  ? 'bg-gradient-to-r from-[#E5C158] to-[#C5A059] text-[#090E1F] shadow-gold-glow font-black'
                  : 'hover:text-[#E5C158]'
              }`}
            >
              Enrolled ({patents.filter((p) => p.status === 0).length})
            </button>
            <button
              onClick={() => setActiveTab('in_exam')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
                activeTab === 'in_exam'
                  ? 'bg-gradient-to-r from-[#E5C158] to-[#C5A059] text-[#090E1F] shadow-gold-glow font-black'
                  : 'hover:text-[#E5C158]'
              }`}
            >
              Sub Judice ({patents.filter((p) => p.status === 1 || p.status === 2 || p.status === 6 || p.status === 7).length})
            </button>
            <button
              onClick={() => setActiveTab('settled')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
                activeTab === 'settled'
                  ? 'bg-gradient-to-r from-[#E5C158] to-[#C5A059] text-[#090E1F] shadow-gold-glow font-black'
                  : 'hover:text-[#E5C158]'
              }`}
            >
              Decreed ({patents.filter((p) => p.status === 3 || p.status === 4 || p.status === 5).length})
            </button>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search docket, title, or claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-3.5 py-2 text-xs font-serif bg-[#0E162B] border border-[#233257] rounded-xl text-amber-100 placeholder-slate-500 focus:outline-none focus:border-[#E5C158] shadow-inner"
            />
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2 rounded-xl border border-[#233257] bg-[#0E162B] hover:border-[#C5A059] text-[#C5A059] transition-colors"
              title="Refresh Tribunal Rolls"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dockets Grid */}
        {loading && patents.length === 0 ? (
          <div className="bg-[#0E162B] rounded-3xl border border-[#233257] p-16 text-center shadow-court-panel">
            <RefreshCw className="h-10 w-10 text-[#E5C158] animate-spin mx-auto mb-3" />
            <p className="text-base font-cinzel font-bold text-amber-200">
              Unrolling Ancient & Modern Patent Rolls from Studionet...
            </p>
            <p className="text-xs font-cormorant italic text-slate-400 mt-1">
              Synchronizing with sovereign contract at {contractAddress.slice(0, 10)}...
            </p>
          </div>
        ) : filteredPatents.length === 0 ? (
          <div className="bg-[#0E162B] rounded-3xl border border-dashed border-[#233257] p-16 text-center shadow-court-panel">
            <Scroll className="h-12 w-12 text-[#C5A059] mx-auto mb-3 opacity-60" />
            <h3 className="font-cinzel text-xl font-bold text-amber-100">
              No Case Dockets Registered Under This Inquest Tab
            </h3>
            <p className="text-xs font-cormorant italic text-slate-400 mt-2 max-w-md mx-auto text-base">
              Be the premier research fellow or autonomous AI agent to enroll an inventive step with a locked GEN validity escrow bond!
            </p>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="mt-5 px-6 py-2.5 rounded-xl text-xs font-cinzel font-bold text-[#090E1F] bg-gradient-to-r from-[#E5C158] to-[#C5A059] hover:from-white hover:to-[#E5C158] shadow-gold-glow"
            >
              Enroll Patent Claim
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPatents.map((patent) => (
              <PatentCard
                key={patent.patent_id}
                patent={patent}
                userAddress={userAddress}
                platformAdmin={stats.platform_admin}
                onOpenChallenge={(p) => setChallengeTarget(p)}
                onOpenExamination={(p) => setExaminationTarget(p)}
                onOpenDispute={(p) => setDisputeTarget(p)}
                onOpenAdminArbitration={(p) => setAdminArbitrationTarget(p)}
                onAdjudicate={handleAdjudicateCollision}
                onFinalizeSettlement={handleFinalizeSettlement}
                onReclaimExpired={handleReclaimExpired}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </main>

      {/* Supreme Court Footer */}
      <footer className="mt-auto border-t border-[#C5A059]/20 bg-[#060913] py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-serif">
          <div className="flex items-center space-x-2.5">
            <Scale className="h-4 w-4 text-[#E5C158]" />
            <span className="font-cinzel font-bold text-[#F5EFE0]">Curia Maxima AgentPatent</span>
            <span className="text-slate-600">•</span>
            <span className="font-cormorant italic text-[#C5A059]">Autonomous Judicial Machine for AI Intellectual Property</span>
          </div>
          <div className="flex items-center space-x-4 text-xs font-cinzel">
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E5C158] underline"
            >
              GenLayer Codex
            </a>
            <a
              href="https://studio.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E5C158] underline"
            >
              Studio Chamber
            </a>
            <span className="text-slate-700">|</span>
            <span className="font-mono text-[11px] text-[#C5A059]">
              Seal: {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RegisterPatentModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSubmit={handleRegisterPatent}
        loading={actionLoading}
      />

      <ChallengeModal
        isOpen={!!challengeTarget}
        patent={challengeTarget}
        onClose={() => setChallengeTarget(null)}
        onSubmit={handleChallengePriorArt}
        loading={actionLoading}
      />

      <ExaminationModal
        isOpen={!!examinationTarget}
        patent={examinationTarget}
        onClose={() => setExaminationTarget(null)}
        onAdjudicate={handleAdjudicateCollision}
        adjudicating={actionLoading}
      />

      <DisputeModal
        isOpen={!!disputeTarget}
        patent={disputeTarget}
        onClose={() => setDisputeTarget(null)}
        onSubmit={handleRaiseDispute}
        loading={actionLoading}
      />

      <AdminArbitrationModal
        isOpen={!!adminArbitrationTarget}
        patent={adminArbitrationTarget}
        onClose={() => setAdminArbitrationTarget(null)}
        onSubmit={handleResolveEscalation}
        loading={actionLoading}
      />
    </div>
  );
};

export default App;
