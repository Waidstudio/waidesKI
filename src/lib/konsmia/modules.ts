import type { KonsmiaModule } from './types';

// KonsOS — Sovereign Governance Layer
export const konsOS: KonsmiaModule = {
  id: 'konsos',
  name: 'KonsOS',
  description: 'Sovereign governance layer — manages permissions, rules, and system-level decision authority',
  status: 'online',
  lastSync: new Date().toISOString(),
  integrity: 98,
};

// KonsAi — Moral & Consciousness Alignment
export const konsAi: KonsmiaModule = {
  id: 'konsai',
  name: 'KonsAi',
  description: 'Moral and consciousness alignment — ensures all decisions pass ethical review',
  status: 'online',
  lastSync: new Date().toISOString(),
  integrity: 100,
};

// WombLayer — Memory + Identity Source
export const wombLayer: KonsmiaModule = {
  id: 'womblayer',
  name: 'WombLayer',
  description: 'Memory and identity source — stores historical patterns, learned behaviors, and core identity',
  status: 'online',
  lastSync: new Date().toISOString(),
  integrity: 95,
};

// KonsNet — Data & Signal Flow (dynamically tracks sync state)
let konsNetSyncStart = Date.now();
let konsNetReady = false;

export const konsNet: KonsmiaModule = {
  id: 'konsnet',
  name: 'KonsNet',
  description: 'Data and signal flow network — routes market data, signals, and intelligence between modules',
  get status() {
    // Transition from syncing to online after 5 seconds
    if (!konsNetReady && Date.now() - konsNetSyncStart > 5000) {
      konsNetReady = true;
    }
    return konsNetReady ? 'online' : 'syncing';
  },
  lastSync: new Date().toISOString(),
  integrity: 92,
};

// Reset KonsNet sync (call when data pipeline reconnects)
export function resetKonsNetSync() {
  konsNetSyncStart = Date.now();
  konsNetReady = false;
}

// Webonyix — Value Reserve & Transmutation
export const webonyix: KonsmiaModule = {
  id: 'webonyix',
  name: 'Webonyix',
  description: 'Value reserve and transmutation — manages asset allocation, risk budgets, and value transformation',
  status: 'online',
  lastSync: new Date().toISOString(),
  integrity: 97,
};

// Shavoka KI — Ethical & Purity Firewall
export const shavokaKI: KonsmiaModule = {
  id: 'shavoka',
  name: 'Shavoka KI',
  description: 'Ethical and purity firewall — final gate that blocks signals not aligned with Konsmik principles',
  status: 'online',
  lastSync: new Date().toISOString(),
  integrity: 100,
};

export const allModules: KonsmiaModule[] = [konsOS, konsAi, wombLayer, konsNet, webonyix, shavokaKI];

// Governance check via KonsOS
export function checkGovernance(action: string): boolean {
  return konsOS.status === 'online' && konsOS.integrity > 80;
}

// Ethical alignment via KonsAi + Shavoka
export function checkEthicalAlignment(signalScore: number): boolean {
  if (konsAi.status !== 'online' || shavokaKI.status !== 'online') return false;
  if (konsAi.integrity < 90 || shavokaKI.integrity < 90) return false;
  return signalScore > -50;
}

// Memory recall via WombLayer
export function recallPattern(asset: string): string {
  if (wombLayer.status !== 'online') return 'Memory unavailable';
  return `Historical pattern for ${asset} loaded from WombLayer`;
}

// Data flow via KonsNet
export function getDataFlowStatus(): { active: boolean; latency: number } {
  return {
    active: konsNet.status !== 'offline',
    latency: konsNet.status === 'syncing' ? 250 : 50,
  };
}

// Value check via Webonyix
export function checkRiskBudget(exposure: number): boolean {
  if (webonyix.status !== 'online') return false;
  return exposure < 0.1;
}

// System health aggregate
export function getSystemHealth(): { overall: number; modules: { name: string; status: string; integrity: number }[] } {
  const modules = allModules.map(m => ({ name: m.name, status: m.status, integrity: m.integrity }));
  const overall = Math.round(modules.reduce((a, m) => a + m.integrity, 0) / modules.length);
  return { overall, modules };
}
