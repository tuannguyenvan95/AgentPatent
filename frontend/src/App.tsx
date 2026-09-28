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
      showToast('error', 'MetaMask is not installed. Please install MetaMask to use AgentPatent.');
      return;
    }
    try {
      await ensureStudionet();
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      if (accounts && accounts[0]) {
        setUserAddress(accounts[0]);
        showToast('success', `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      }
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to connect MetaMask');
    }
  };

  const handleDisconnectWallet = () => {
    setUserAddress('');
    setUserBalance('0.00');
    showToast('info', 'Disconnected from dApp');
  };

  // Update Contract Address
  const handleSaveContractAddress = (newAddr: string) => {
    saveContractAddress(newAddr);
    setContractAddress(newAddr);
    showToast('success', `Contract updated to ${newAddr.slice(0, 8)}...`);
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
      showToast('info', 'Submitting patent claims and locking escrow...');
      const tx = await registerPatentClaimOnChain(
        contractAddress,
        userAddress,
        title,
        claims,
        durationBlocks,
        depositWei
      );
      showToast('success', `Patent registered! Tx: ${tx.slice(0, 10)}...`);
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
      showToast('info', 'Filing prior art challenge and staking anti-griefing bond...');
      const tx = await challengePriorArtOnChain(
        contractAddress,
        userAddress,
        patentId,
        priorArtUrl,
        bondWei
      );
      showToast('success', `Collision challenge filed! Tx: ${tx.slice(0, 10)}...`);
      await refreshData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to file challenge');
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
      showToast('info', 'Convening GenLayer AI Patent Examination Board. Scraping prior art on-chain...');
      const tx = await adjudicateCollisionOnChain(contractAddress, userAddress, patentId);
      showToast('success', `Collision adjudicated! 24-block cooling-off window opened. Tx: ${tx.slice(0, 10)}...`);
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
      showToast('info', 'Submitting on-chain appeal. Freezing escrow for protocol review...');
      const tx = await raiseDisputeOnChain(contractAddress, userAddress, patentId, reason);
      showToast('success', `Case disputed! Transferred to Protocol Steward. Tx: ${tx.slice(0, 10)}...`);
      await refreshData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to lodge dispute');
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
      showToast('info', 'Executing final settlement disbursement...');
      const tx = await finalizeSettlementOnChain(contractAddress, userAddress, patentId);
      showToast('success', `Escrow disbursed! Tx: ${tx.slice(0, 10)}...`);
      await refreshData();
    } catch (err: any) {
      showToast('error', err?.message || 'Settlement failed. Cooling-off may still be active.');
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
      showToast('info', `Admin executing resolution: ${resolution}...`);
      const tx = await resolveEscalationOnChain(contractAddress, userAddress, patentId, resolution);
      showToast('success', `Arbitration executed! Tx: ${tx.slice(0, 10)}...`);
      await refreshData();
    } catch (err: any) {
      showToast('error', err?.message || 'Admin arbitration failed');
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
      showToast('info', 'Reclaiming uncontested patent validity bond...');
      const tx = await reclaimExpiredPatentOnChain(contractAddress, userAddress, patentId);
      showToast('success', `Escrow reclaimed! Tx: ${tx.slice(0, 10)}...`);
      await refreshData();
    } catch (err: any) {
      showToast('error', err?.message || 'Reclaim failed. Duration may not have expired.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter patents
  const filteredPatents = patents.filter((p) => {
    // Search query match
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
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-[#0F172A]">
      {/* Navigation Header */}
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
            className={`p-4 rounded-xl shadow-lg border text-xs font-medium flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : notification.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-indigo-50 text-indigo-900 border-indigo-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Academic Hero Section */}
        <section className="mb-10 text-center sm:text-left bg-gradient-to-r from-white to-slate-50 p-8 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Scale className="h-3.5 w-3.5 text-teal-600" />
              <span>Subjective Consensus • AI IP & Scientific Research</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
              Autonomous AI Research Prior Art & Patent Collision Court
            </h1>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed font-sans">
              Solve the scientific novelty dilemma in the era of autonomous AI research. Inventors lock GEN validity bonds to publish claims; challengers stake anti-griefing bonds and submit prior art URLs. The <strong>GenLayer AI Patent Examination Board</strong> renders documents live on-chain, applies a 3-lens novelty test, and governs dispute settlement via multi-validator consensus.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 shadow-sm transition-all"
              >
                Deposit New Patent Claims
              </button>
              <a
                href={STUDIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all inline-flex items-center gap-1.5"
              >
                <span>GenLayer Studio</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </section>

        {/* Protocol Statistics Bar */}
        <StatsBar stats={stats} loading={loading} />

        {/* Ledger Toolbar & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              All Docket ({patents.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                activeTab === 'active'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Protected ({patents.filter((p) => p.status === 0).length})
            </button>
            <button
              onClick={() => setActiveTab('in_exam')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                activeTab === 'in_exam'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              In Examination ({patents.filter((p) => p.status === 1 || p.status === 2 || p.status === 6 || p.status === 7).length})
            </button>
            <button
              onClick={() => setActiveTab('settled')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                activeTab === 'settled'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Settled ({patents.filter((p) => p.status === 3 || p.status === 4 || p.status === 5).length})
            </button>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by title, claims, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Refresh ledger state"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Patents Docket Grid */}
        {loading && patents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <RefreshCw className="h-8 w-8 text-teal-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              Hydrating Scientific Patent Ledger from Studionet...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Querying contract at {contractAddress.slice(0, 10)}...
            </p>
          </div>
        ) : filteredPatents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-slate-800">
              No Patent Claims Found in this Category
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Be the first researcher or AI agent to register a patent claim with a GEN validity escrow bond!
            </p>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm"
            >
              Deposit Patent Claims
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

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Scale className="h-4 w-4 text-teal-600" />
            <span className="font-semibold text-slate-700">AgentPatent v3 Court</span>
            <span>•</span>
            <span>GenLayer Studionet Chain 61999</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 underline"
            >
              GenLayer Docs
            </a>
            <a
              href="https://studio.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 underline"
            >
              Studio IDE
            </a>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-[11px] text-slate-400">
              Contract: {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
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
