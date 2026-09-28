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
  if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'UNASSIGNED';
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`.toUpperCase();
}

export interface StatusMeta {
  code: string;
  label: string;
  badgeBg: string;
  ledColor: string;
  borderColor: string;
  description: string;
  latinMotto: string;
  sealType: 'red' | 'green' | 'amber' | 'neutral';
}

export function getStatusMeta(status: number): StatusMeta {
  switch (status) {
    case 0:
      return {
        code: 'SEC-0',
        label: 'NOVELTY_ACTIVE',
        badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
        ledColor: 'bg-teal-400 animate-pulse',
        borderColor: 'border-teal-500/30 hover:border-teal-400/50',
        description: 'Patent novelty claims locked on-chain. Open for peer examination.',
        latinMotto: 'Sub Sigillo Inventoris',
        sealType: 'neutral',
      };
    case 1:
      return {
        code: 'RAD-1',
        label: 'RADAR_SCANNING',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        ledColor: 'bg-amber-400 animate-pulse',
        borderColor: 'border-amber-500/40 hover:border-amber-400/60',
        description: 'Challenger staked bond. GenLayer AI Examination Board convened.',
        latinMotto: 'Inquisitio Iudicialis',
        sealType: 'amber',
      };
    case 2:
      return {
        code: 'TIM-2',
        label: 'COOLING_OFF (24B)',
        badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        ledColor: 'bg-cyan-400 animate-ping',
        borderColor: 'border-cyan-500/40 hover:border-cyan-400/60',
        description: 'AI verdict reached. 24-block timelock grace period active for dispute.',
        latinMotto: 'Indutiae Legales',
        sealType: 'amber',
      };
    case 3:
      return {
        code: 'ALR-3',
        label: 'COLLISION_SLASHED',
        badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        ledColor: 'bg-rose-500',
        borderColor: 'border-rose-500/50 hover:border-rose-400/70',
        description: 'Prior Art anticipated core claims. Escrow bond slashed to challenger.',
        latinMotto: 'Decretum Invaliditatis',
        sealType: 'red',
      };
    case 4:
      return {
        code: 'VER-4',
        label: 'NOVEL_VERIFIED',
        badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        ledColor: 'bg-emerald-400',
        borderColor: 'border-emerald-500/40 hover:border-emerald-400/60',
        description: 'Inventive step verified. Challenger bond forfeited to inventor.',
        latinMotto: 'Inventum Confirmatum',
        sealType: 'green',
      };
    case 5:
      return {
        code: 'EXP-5',
        label: 'TERM_RECLAIMED',
        badgeBg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
        ledColor: 'bg-slate-500',
        borderColor: 'border-slate-700 hover:border-slate-500',
        description: 'Protection duration concluded uncontested. Escrow returned to inventor.',
        latinMotto: 'Terminus Exspiratus',
        sealType: 'neutral',
      };
    case 6:
      return {
        code: 'DSP-6',
        label: 'DISPUTE_FROZEN',
        badgeBg: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
        ledColor: 'bg-orange-400 animate-pulse',
        borderColor: 'border-orange-500/50 hover:border-orange-400/70',
        description: 'Verdict contested under formal writ. Escrow frozen for protocol arbitration.',
        latinMotto: 'Sub Lite Pendente',
        sealType: 'amber',
      };
    case 7:
      return {
        code: 'ESC-7',
        label: 'STEWARD_ESCALATED',
        badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        ledColor: 'bg-purple-400 animate-pulse',
        borderColor: 'border-purple-500/50 hover:border-purple-400/70',
        description: 'Canary token alert or confidence threshold triggered. Under steward review.',
        latinMotto: 'Ad Iudicem Supremum',
        sealType: 'amber',
      };
    default:
      return {
        code: 'UNK',
        label: 'UNKNOWN_STATE',
        badgeBg: 'bg-gray-800 text-gray-400 border-gray-700',
        ledColor: 'bg-gray-500',
        borderColor: 'border-gray-800',
        description: 'Unrecognized patent status.',
        latinMotto: 'Status Incognitus',
        sealType: 'neutral',
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
    title: 'Topological Quantum Routing in Subjective BFT Networks',
    claims: 'An autonomous multi-validator routing protocol combining topological braid group invariants with asynchronous subjective consensus to eliminate adversarial eclipse attacks across decentralized AI validator swarms.',
    depositGen: '3.5',
  },
  {
    title: 'Non-Euclidean Activation Manifold for Verifiable Inference',
    claims: 'A method and system for caching intermediate transformer multi-head attention activation tensors on Riemannian manifolds, verifiable via polynomial zero-knowledge commitments without re-computation.',
    depositGen: '5.0',
  },
  {
    title: 'Autonomous Chemical Retrosynthesis with Thermodynamic Invariants',
    claims: 'An autonomous biochemical reaction network synthesizing novel catalytic polymers through equivariant graph neural networks, verified on-chain via immutable Gibbs free energy constraints.',
    depositGen: '2.0',
  }
];

export const PRESET_PRIOR_ART = [
  {
    title: 'arXiv:2106.09685 - LoRA: Low-Rank Adaptation of Large Language Models',
    url: 'https://raw.githubusercontent.com/microsoft/LoRA/main/README.md',
    desc: 'Foundational paper disclosing rank-decomposition matrix adaptation for parameter-efficient tuning.'
  },
  {
    title: 'arXiv:1706.03762 - Attention Is All You Need',
    url: 'https://raw.githubusercontent.com/tensorflow/tensor2tensor/master/README.md',
    desc: 'Seminal work establishing multi-head self-attention mechanisms in sequence transduction.'
  },
  {
    title: 'GenLayer Official Whitepaper - Subjective Consensus Protocols',
    url: 'https://raw.githubusercontent.com/yeagerai/genlayer-simulator/develop/README.md',
    desc: 'Public foundational specification of decentralized non-deterministic LLM execution.'
  }
];
