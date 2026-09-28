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
  if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'Unassigned';
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export interface StatusMeta {
  label: string;
  latinMotto: string;
  badgeBg: string;
  sealType: 'green' | 'red' | 'amber' | 'neutral';
  borderColor: string;
  description: string;
}

export function getStatusMeta(status: number): StatusMeta {
  switch (status) {
    case 0:
      return {
        label: 'ENROLLED & DEFENDED',
        latinMotto: 'Sub Sigillo Inventoris',
        badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50',
        sealType: 'green',
        borderColor: 'border-emerald-700/50',
        description: 'Enrolled under High Court Seal. Open for public prior art examination.',
      };
    case 1:
      return {
        label: 'SUB JUDICE / INQUIRY',
        latinMotto: 'Sub Judice Lis Pendens',
        badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-600/50',
        sealType: 'amber',
        borderColor: 'border-amber-600/60',
        description: 'Adversary bond staked. Convening Autonomous AI Patent Bench.',
      };
    case 2:
      return {
        label: 'PROVISIONAL DECREE (COOLING-OFF)',
        latinMotto: 'Indutiae Legales (24 Blocks)',
        badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50',
        sealType: 'amber',
        borderColor: 'border-indigo-500/60',
        description: 'Verdict rendered. 24-block grace period active for appellate challenge.',
      };
    case 3:
      return {
        label: 'DECLARED VOID (ANNULLED)',
        latinMotto: 'Nullum atque Inane Ab Initio',
        badgeBg: 'bg-rose-950/90 text-rose-300 border-rose-600/60',
        sealType: 'red',
        borderColor: 'border-rose-700/70',
        description: 'Prior Art anticipation proven beyond doubt. Validity escrow slashed to challenger.',
      };
    case 4:
      return {
        label: 'UPHELD BY SOVEREIGN DECREE',
        latinMotto: 'Inventum Inviolabile Ratum',
        badgeBg: 'bg-teal-950/90 text-teal-300 border-teal-500/60',
        sealType: 'green',
        borderColor: 'border-teal-600/70',
        description: 'Novelty established. Challenger bond forfeited to inventor.',
      };
    case 5:
      return {
        label: 'EXPIRED & RECLAIMED',
        latinMotto: 'Tempus Reversionis Absolutum',
        badgeBg: 'bg-slate-900/90 text-slate-300 border-slate-700/60',
        sealType: 'neutral',
        borderColor: 'border-slate-700/60',
        description: 'Patent term concluded without invalidating claims. Escrow returned to inventor.',
      };
    case 6:
      return {
        label: 'APPELLATE WRIT OF DISPUTE',
        latinMotto: 'Provocatio ad Tribunal',
        badgeBg: 'bg-orange-950/90 text-orange-300 border-orange-600/60',
        sealType: 'red',
        borderColor: 'border-orange-600/70',
        description: 'Verdict contested under formal writ. Escrow frozen for Chief Justice arbitration.',
      };
    case 7:
      return {
        label: 'CHIEF JUSTICE ESCALATION',
        latinMotto: 'Ad Judicium Praesidis',
        badgeBg: 'bg-purple-950/90 text-purple-300 border-purple-600/60',
        sealType: 'amber',
        borderColor: 'border-purple-600/70',
        description: 'Security canary or uncertainty threshold triggered. Under sovereign review.',
      };
    default:
      return {
        label: 'UNKNOWN STATUS',
        latinMotto: 'Incognitus',
        badgeBg: 'bg-gray-900 text-gray-300 border-gray-700',
        sealType: 'neutral',
        borderColor: 'border-gray-700',
        description: 'Docket status not recognized.',
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
