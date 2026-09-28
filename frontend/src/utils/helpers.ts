export function formatGen(wei: string | bigint | number | undefined): string {
  if (!wei) return '0.00';
  try {
    const weiBig = typeof wei === 'bigint' ? wei : BigInt(wei.toString());
    const whole = weiBig / 10n ** 18n;
    const remainder = weiBig % 10n ** 18n;
    const fraction = remainder.toString().padStart(18, '0').slice(0, 4);
    return `${whole}.${fraction}`;
  } catch (e) {
    return '0.00';
  }
}

export function parseGenToWei(genStr: string | number): bigint {
  try {
    const clean = String(genStr).trim();
    if (!clean || isNaN(Number(clean))) return 0n;
    const [wholePart, decPart = ''] = clean.split('.');
    const paddedDec = decPart.padEnd(18, '0').slice(0, 18);
    return BigInt(wholePart) * 10n ** 18n + BigInt(paddedDec);
  } catch (e) {
    return 0n;
  }
}

export function truncateAddress(addr: string): string {
  if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'None';
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export interface StatusMeta {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  description: string;
}

export function getStatusMeta(status: number): StatusMeta {
  switch (status) {
    case 0:
      return {
        label: 'ACTIVE PROTECTED',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        badgeText: 'text-emerald-700',
        borderColor: 'border-emerald-300',
        description: 'Under on-chain novelty protection. Open for peer examination.',
      };
    case 1:
      return {
        label: 'IN EXAMINATION',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        badgeText: 'text-amber-700',
        borderColor: 'border-amber-300',
        description: 'Challenger staked bond. GenLayer AI Board convened.',
      };
    case 2:
      return {
        label: 'COOLING-OFF DISPUTE',
        badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        badgeText: 'text-indigo-700',
        borderColor: 'border-indigo-300',
        description: 'AI verdict reached. 24-block grace period active for appeal.',
      };
    case 3:
      return {
        label: 'INVALIDATED (SLASHED)',
        badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
        badgeText: 'text-rose-700',
        borderColor: 'border-rose-300',
        description: 'Prior art collision proven. Escrow awarded to challenger.',
      };
    case 4:
      return {
        label: 'UPHELD (DEFENDED)',
        badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
        badgeText: 'text-teal-700',
        borderColor: 'border-teal-300',
        description: 'Genuine inventive step defended. Challenger bond forfeited.',
      };
    case 5:
      return {
        label: 'EXPIRED & RECLAIMED',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        badgeText: 'text-slate-600',
        borderColor: 'border-slate-300',
        description: 'Protection duration concluded uncontested. Escrow returned.',
      };
    case 6:
      return {
        label: 'UNDER DISPUTE',
        badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
        badgeText: 'text-orange-700',
        borderColor: 'border-orange-300',
        description: 'Verdict contested by party. Frozen for protocol steward arbitration.',
      };
    case 7:
      return {
        label: 'ESCALATED SAFETY',
        badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
        badgeText: 'text-purple-700',
        borderColor: 'border-purple-300',
        description: 'AI confidence threshold alert or canary trigger. Under steward review.',
      };
    default:
      return {
        label: 'UNKNOWN',
        badgeBg: 'bg-gray-100 text-gray-800 border-gray-200',
        badgeText: 'text-gray-700',
        borderColor: 'border-gray-200',
        description: 'Unknown status code.',
      };
  }
}

export interface PresetPatent {
  title: string;
  claims: string;
  depositGen: string;
}

export const PRESET_PATENTS: PresetPatent[] = [
  {
    title: 'Autonomous Verifiable Transformer Kernel Cache',
    claims: 'A method and system for caching intermediate transformer multi-head attention activation matrices across decentralized storage nodes, verified using polynomial zero-knowledge commitments without re-computation.',
    depositGen: '2.5',
  },
  {
    title: 'Topological Quantum Routing in Subjective BFT Networks',
    claims: 'A novel cryptographic routing protocol combining topological braid group invariants with asynchronous subjective consensus to prevent adversarial eclipse attacks across decentralized AI validator swarms.',
    depositGen: '5.0',
  },
  {
    title: 'Decentralized Retrosynthesis Predictor with Proof of Reaction',
    claims: 'An autonomous biochemical reaction network synthesizing novel catalytic polymers through generative graph neural networks, verified on-chain via immutable thermodynamic equilibrium constraints.',
    depositGen: '1.0',
  }
];

export const PRESET_PRIOR_ART = [
  {
    title: 'arXiv:2106.09685 - LoRA: Low-Rank Adaptation of Large Language Models',
    url: 'https://raw.githubusercontent.com/microsoft/LoRA/main/README.md',
    desc: 'Seminal paper disclosing rank-decomposition matrix adaptation.'
  },
  {
    title: 'arXiv:1706.03762 - Attention Is All You Need',
    url: 'https://raw.githubusercontent.com/tensorflow/tensor2tensor/master/README.md',
    desc: 'Foundational transformer architecture specification.'
  },
  {
    title: 'GenLayer Whitepaper - Subjective Consensus & Intelligent Contracts',
    url: 'https://raw.githubusercontent.com/yeagerai/genlayer-simulator/develop/README.md',
    desc: 'Official public specification of decentralized subjective LLM execution.'
  }
];
