import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { formatGen } from '../utils/helpers';

export const STUDIONET_CHAIN_ID = 61999;
export const STUDIONET_CHAIN_ID_HEX = '0xf22f'; // 61999 in hex (or 0xF1EF)
export const STUDIONET_RPC_URL = 'https://studio.genlayer.com/api';
export const STUDIO_URL = 'https://studio.genlayer.com';

// Default contract address (can be updated dynamically in UI)
export const DEFAULT_CONTRACT_ADDRESS = '0xCE8973E9d7ed7eA05b93aCb178e2715Ea9f1Ff39';

export function getSavedContractAddress(): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('agentpatent_contract_address');
      if (
        !stored ||
        stored.toLowerCase() === '0xb96502213797c276008b49704e6c273030432f89'.toLowerCase()
      ) {
        localStorage.setItem('agentpatent_contract_address', DEFAULT_CONTRACT_ADDRESS);
        return DEFAULT_CONTRACT_ADDRESS;
      }
      if (stored && stored.trim().startsWith('0x')) {
        return stored.trim();
      }
    } catch (e) {
      // ignore
    }
  }
  return DEFAULT_CONTRACT_ADDRESS;
}

export function saveContractAddress(address: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('agentpatent_contract_address', address.trim());
  }
}

/**
 * Fetch real on-chain GEN balance directly from Studionet RPC endpoint
 */
export async function fetchStudionetBalance(address: string): Promise<string> {
  if (!address) return '0';

  try {
    const res = await fetch(STUDIONET_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: Date.now(),
      }),
    });
    const json = await res.json();
    if (json && json.result !== undefined && json.result !== null) {
      return formatGen(json.result);
    }
  } catch (err) {
    console.warn('Direct Studionet RPC eth_getBalance error:', err);
  }

  if (typeof window !== 'undefined' && (window as any).ethereum) {
    try {
      const balHex = await (window as any).ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      if (balHex) {
        return formatGen(balHex);
      }
    } catch (e) {
      console.warn('MetaMask eth_getBalance fallback error:', e);
    }
  }

  return '0';
}

export interface PatentCaseData {
  patent_id: number;
  inventor: string;
  challenger: string;
  escrow_deposit: string;
  challenger_bond: string;
  patent_title: string;
  novelty_claims: string;
  prior_art_url: string;
  evidence_hash: string;
  status: number; // 0: ACTIVE, 1: IN_EXAM, 2: AWAITING_PAYOUT, 3: INVALIDATED, 4: UPHELD, 5: RECLAIMED, 6: DISPUTED, 7: ESCALATED
  verdict: string;
  reason: string;
  confidence: number;
  overlap_score: number;
  created_at_block: string;
  expires_at_block: string;
  examination_started_block?: string;
  payout_ready_at_block?: string;
  disputed?: boolean;
  dispute_reason?: string;
}

export interface ProtocolStats {
  total_patents: number;
  total_patent_locked: string;
  total_disputes_resolved: number;
  active_examinations?: number;
  platform_admin?: string;
}

/**
 * Get GenLayer client configured with Studionet
 */
export function getGenLayerClient(accountAddress?: string) {
  const config: any = {
    chain: studionet,
    endpoint: STUDIONET_RPC_URL,
  };

  if (typeof window !== 'undefined' && (window as any).ethereum && accountAddress) {
    config.provider = (window as any).ethereum;
    config.account = accountAddress as `0x${string}`;
  }

  return createClient(config);
}

/**
 * Switch or add GenLayer Studionet chain in MetaMask (Chain ID: 61999)
 */
export async function ensureStudionet(): Promise<boolean> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use AgentPatent.');
  }

  const ethereum = (window as any).ethereum;

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: STUDIONET_CHAIN_ID_HEX }],
    });
    return true;
  } catch (switchError: any) {
    if (
      switchError.code === 4902 ||
      switchError?.data?.originalError?.code === 4902 ||
      switchError?.message?.includes('Unrecognized chain') ||
      switchError?.message?.includes('wallet_addEthereumChain')
    ) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: STUDIONET_CHAIN_ID_HEX,
              chainName: 'GenLayer Studionet',
              nativeCurrency: {
                name: 'GEN',
                symbol: 'GEN',
                decimals: 18,
              },
              rpcUrls: [STUDIONET_RPC_URL],
              blockExplorerUrls: ['https://genlayer-explorer.vercel.app'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add Studionet chain to MetaMask:', addError);
        throw addError;
      }
    }
    console.error('Failed to switch to Studionet chain:', switchError);
    throw switchError;
  }
}

/**
 * Fetch aggregated protocol stats from contract
 */
export async function fetchStats(contractAddress: string): Promise<ProtocolStats> {
  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    return {
      total_patents: 0,
      total_patent_locked: '0',
      total_disputes_resolved: 0,
      active_examinations: 0,
    };
  }

  try {
    const client = getGenLayerClient();
    const raw = await client.readContract({
      address: contractAddress as `0x${string}`,
      functionName: 'get_stats',
      args: [],
    });

    if (typeof raw === 'string') {
      return JSON.parse(raw);
    }
    return raw as unknown as ProtocolStats;
  } catch (err) {
    console.warn('fetchStats error:', err);
    return {
      total_patents: 0,
      total_patent_locked: '0',
      total_disputes_resolved: 0,
      active_examinations: 0,
    };
  }
}

/**
 * Fetch all patents registered in the contract
 */
export async function fetchAllPatents(contractAddress: string): Promise<PatentCaseData[]> {
  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    return [];
  }

  const client = getGenLayerClient();

  // Primary fast path: get_all_patents view
  try {
    const rawAll = await client.readContract({
      address: contractAddress as `0x${string}`,
      functionName: 'get_all_patents',
      args: [],
    });
    if (rawAll) {
      const parsed: PatentCaseData[] = typeof rawAll === 'string' ? JSON.parse(rawAll) : rawAll;
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }

  // Fallback path: count + get_patent_id_by_index + get_patent
  try {
    const countRaw = await client.readContract({
      address: contractAddress as `0x${string}`,
      functionName: 'get_patent_count',
      args: [],
    });

    const count = Number(countRaw);
    if (isNaN(count) || count <= 0) return [];

    const patents: PatentCaseData[] = [];
    for (let i = 0; i < count; i++) {
      try {
        const pid = (await client.readContract({
          address: contractAddress as `0x${string}`,
          functionName: 'get_patent_id_by_index',
          args: [i],
        })) as any;

        if (pid !== undefined) {
          const rawPatent = await client.readContract({
            address: contractAddress as `0x${string}`,
            functionName: 'get_patent',
            args: [Number(pid)],
          });
          const parsed: PatentCaseData = typeof rawPatent === 'string' ? JSON.parse(rawPatent) : rawPatent;
          patents.push(parsed);
        }
      } catch (err) {
        console.error(`Error reading patent index ${i}:`, err);
      }
    }
    return patents;
  } catch (err) {
    console.warn('fetchAllPatents fallback error:', err);
    return [];
  }
}

/**
 * Register scientific patent claims with GEN escrow validity bond
 */
export async function registerPatentClaimOnChain(
  contractAddress: string,
  userAddress: string,
  title: string,
  claims: string,
  durationBlocks: number,
  depositWei: bigint
): Promise<string> {
  await ensureStudionet();
  const client = getGenLayerClient(userAddress);

  const txHash = await client.writeContract({
    address: contractAddress as `0x${string}`,
    functionName: 'register_patent_claim',
    args: [title.trim(), claims.trim(), durationBlocks],
    value: depositWei,
  });

  await client.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

/**
 * Submit prior art URL and stake anti-griefing challenge bond
 */
export async function challengePriorArtOnChain(
  contractAddress: string,
  userAddress: string,
  patentId: number,
  priorArtUrl: string,
  bondWei: bigint
): Promise<string> {
  await ensureStudionet();
  const client = getGenLayerClient(userAddress);

  const txHash = await client.writeContract({
    address: contractAddress as `0x${string}`,
    functionName: 'challenge_prior_art',
    args: [patentId, priorArtUrl.trim()],
    value: bondWei,
  });

  await client.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

/**
 * Trigger AI Patent Examination Board consensus adjudication
 */
export async function adjudicateCollisionOnChain(
  contractAddress: string,
  userAddress: string,
  patentId: number
): Promise<string> {
  await ensureStudionet();
  const client = getGenLayerClient(userAddress);

  const txHash = await client.writeContract({
    address: contractAddress as `0x${string}`,
    functionName: 'adjudicate_collision',
    args: [patentId],
    value: 0n,
  });

  await client.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

/**
 * Raise a dispute during the 24-block cooling-off window
 */
export async function raiseDisputeOnChain(
  contractAddress: string,
  userAddress: string,
  patentId: number,
  reason: string
): Promise<string> {
  await ensureStudionet();
  const client = getGenLayerClient(userAddress);

  const txHash = await client.writeContract({
    address: contractAddress as `0x${string}`,
    functionName: 'raise_dispute',
    args: [patentId, reason.trim()],
    value: 0n,
  });

  await client.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

/**
 * Finalize settlement after cooling-off window has elapsed
 */
export async function finalizeSettlementOnChain(
  contractAddress: string,
  userAddress: string,
  patentId: number
): Promise<string> {
  await ensureStudionet();
  const client = getGenLayerClient(userAddress);

  const txHash = await client.writeContract({
    address: contractAddress as `0x${string}`,
    functionName: 'finalize_settlement',
    args: [patentId],
    value: 0n,
  });

  await client.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

/**
 * Admin resolution of an escalated or disputed patent case
 */
export async function resolveEscalationOnChain(
  contractAddress: string,
  userAddress: string,
  patentId: number,
  resolution: 'INVALIDATE' | 'UPHOLD' | 'REFUND_SPLIT'
): Promise<string> {
  await ensureStudionet();
  const client = getGenLayerClient(userAddress);

  const txHash = await client.writeContract({
    address: contractAddress as `0x${string}`,
    functionName: 'resolve_escalation',
    args: [patentId, resolution],
    value: 0n,
  });

  await client.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

/**
 * Inventor reclaims escrow after patent protection duration expires uncontested
 */
export async function reclaimExpiredPatentOnChain(
  contractAddress: string,
  userAddress: string,
  patentId: number
): Promise<string> {
  await ensureStudionet();
  const client = getGenLayerClient(userAddress);

  const txHash = await client.writeContract({
    address: contractAddress as `0x${string}`,
    functionName: 'reclaim_expired_patent',
    args: [patentId],
    value: 0n,
  });

  await client.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}
