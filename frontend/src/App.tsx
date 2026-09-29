import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DossierSidebar } from './components/DossierSidebar';
import { ForensicBench } from './components/ForensicBench';
import { ActionChamber } from './components/ActionChamber';
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
} from './config/genlayer';
import { parseGenToWei } from './utils/helpers';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  // Web3 state
  const [contractAddress, setContractAddress] = useState<string>(getSavedContractAddress());
  const [userAddress, setUserAddress] = useState<string>('');
  const [userBalance, setUserBalance] = useState<string>('0');

  // App data state
  const [patents, setPatents] = useState<PatentCaseData[]>([]);
  const [selectedPatent, setSelectedPatent] = useState<PatentCaseData | null>(null);
  const [stats, setStats] = useState<ProtocolStats>({
    total_patents: 0,
    total_patent_locked: '0',
    total_disputes_resolved: 0,
    active_examinations: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Filter state
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'in_exam' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState<PatentCaseData | null>(null);
  const [examinationTarget, setExaminationTarget] = useState<PatentCaseData | null>(null);
  const [disputeTarget, setDisputeTarget] = useState<PatentCaseData | null>(null);
  const [adminArbitrationTarget, setAdminArbitrationTarget] = useState<PatentCaseData | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 7000);
  };

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
        showToast('success', `OPERATOR AUTHENTICATED: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      }
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to authenticate wallet');
    }
  };

  const handleDisconnectWallet = () => {
    setUserAddress('');
    setUserBalance('0');
    showToast('info', 'Operator session terminated');
  };

  const handleSaveContractAddress = (newAddr: string) => {
    saveContractAddress(newAddr);
    setContractAddress(newAddr);
    showToast('success', `Intelligent Contract synchronized to ${newAddr.slice(0, 8)}...`);
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [allPatents, pStats] = await Promise.all([
        fetchAllPatents(contractAddress),
        fetchStats(contractAddress),
      ]);
      setPatents(allPatents);
      setStats(pStats);

      // Auto-select first patent or maintain current selection
      setSelectedPatent((prev) => {
        if (!prev && allPatents.length > 0) return allPatents[0];
        if (prev) {
          const updated = allPatents.find((p) => p.patent_id === prev.patent_id);
          return updated || allPatents[0] || null;
        }
        return null;
      });

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
    patentId: number | string,
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

  const handleAdjudicateCollision = async (patentId: number | string) => {
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
    } catch (err: any) {
      showToast('error', err?.message || 'Adjudication failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRaiseDispute = async (patentId: number | string, reason: string) => {
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

  const handleFinalizeSettlement = async (patentId: number | string) => {
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
    patentId: number | string,
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

  const handleReclaimExpired = async (patentId: number | string) => {
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
    <div className="min-h-screen bg-[#070A11] flex flex-col font-sans text-slate-200 overflow-hidden">
      {/* Cyber Forensic Telemetry Header */}
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
        <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] border text-xs font-mono flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-[#0A161E]/95 text-teal-200 border-teal-500/80 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                : notification.type === 'error'
                ? 'bg-[#1F0A10]/95 text-rose-200 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-[#0F1523]/95 text-cyan-200 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-cyan-400" />
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

      {/* 3-Column Split-Screen Courtroom Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Dossier Filing Cabinet */}
        <DossierSidebar
          patents={filteredPatents}
          selectedPatentId={selectedPatent ? selectedPatent.patent_id : null}
          onSelectPatent={(p) => setSelectedPatent(p)}
          onOpenRegisterModal={() => setIsRegisterOpen(true)}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
        />

        {/* Center Stage: The Dual-Chamber Forensic Collision Arena */}
        <ForensicBench
          patent={selectedPatent}
          onOpenChallenge={(p) => setChallengeTarget(p)}
          onAdjudicate={handleAdjudicateCollision}
          actionLoading={actionLoading}
          userAddress={userAddress}
        />

        {/* Right Column: Litigation Action Chamber & Vault */}
        <ActionChamber
          patent={selectedPatent}
          stats={stats}
          userAddress={userAddress}
          onOpenChallenge={(p) => setChallengeTarget(p)}
          onOpenDispute={(p) => setDisputeTarget(p)}
          onOpenAdminArbitration={(p) => setAdminArbitrationTarget(p)}
          onAdjudicate={handleAdjudicateCollision}
          onFinalizeSettlement={handleFinalizeSettlement}
          onReclaimExpired={handleReclaimExpired}
          actionLoading={actionLoading}
        />
      </div>

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
