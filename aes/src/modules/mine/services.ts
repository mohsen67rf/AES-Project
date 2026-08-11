// src/modules/mine/services.ts

import type { 
  Mine, 
  Pit, 
  SubBlock, 
  SubBlockStatus, 
  Sample, 
  MaterialProfile, 
  DestinationDecision 
} from '../../core/domain/types/mine.types';

// ============================================
// کلیدهای localStorage
// ============================================

const MINES_KEY = 'aes_mines';
const PITS_KEY = 'aes_pits';
const SUBBLOCKS_KEY = 'aes_subblocks';
const SAMPLES_KEY = 'aes_samples';
const MATERIAL_PROFILES_KEY = 'aes_material_profiles';
const DESTINATION_DECISIONS_KEY = 'aes_destination_decisions';

// ============================================
// سرویس‌های SubBlock
// ============================================

export function getSubBlocks(blockId?: string): SubBlock[] {
  try {
    const data = localStorage.getItem(SUBBLOCKS_KEY);
    const subBlocks: SubBlock[] = data ? JSON.parse(data) : [];
    return blockId ? subBlocks.filter(sb => sb.blockId === blockId) : subBlocks;
  } catch {
    return [];
  }
}

export function getSubBlockById(id: string): SubBlock | null {
  try {
    const data = localStorage.getItem(SUBBLOCKS_KEY);
    const subBlocks: SubBlock[] = data ? JSON.parse(data) : [];
    return subBlocks.find(sb => sb.id === id) || null;
  } catch {
    return null;
  }
}

export function updateSubBlock(id: string, data: Partial<SubBlock>): SubBlock | null {
  const subBlocks = getSubBlocks();
  const index = subBlocks.findIndex(sb => sb.id === id);
  if (index === -1) return null;
  
  subBlocks[index] = {
    ...subBlocks[index],
    ...data,
    version: (subBlocks[index].version || 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(SUBBLOCKS_KEY, JSON.stringify(subBlocks));
  return subBlocks[index];
}

// ============================================
// سرویس‌های Sample (نمونه‌برداری)
// ============================================

export function getSamples(subBlockId?: string): Sample[] {
  try {
    const data = localStorage.getItem(SAMPLES_KEY);
    const samples: Sample[] = data ? JSON.parse(data) : [];
    return subBlockId ? samples.filter(s => s.subBlockId === subBlockId) : samples;
  } catch {
    return [];
  }
}

export function addSample(sample: Omit<Sample, 'id' | 'createdAt' | 'updatedAt'>): Sample {
  const samples = getSamples();
  const newSample: Sample = {
    id: crypto.randomUUID(),
    ...sample,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  samples.push(newSample);
  localStorage.setItem(SAMPLES_KEY, JSON.stringify(samples));
  
  updateSubBlock(sample.subBlockId, { status: 'SAMPLED' as SubBlockStatus });
  
  return newSample;
}

// ============================================
// سرویس‌های MaterialProfile (طبقه‌بندی)
// ============================================

export function getMaterialProfiles(subBlockId?: string): MaterialProfile[] {
  try {
    const data = localStorage.getItem(MATERIAL_PROFILES_KEY);
    const profiles: MaterialProfile[] = data ? JSON.parse(data) : [];
    return subBlockId ? profiles.filter(p => p.subBlockId === subBlockId) : profiles;
  } catch {
    return [];
  }
}

export function addMaterialProfile(
  profile: Omit<MaterialProfile, 'id' | 'createdAt' | 'updatedAt'>
): MaterialProfile {
  const profiles = getMaterialProfiles();
  const newProfile: MaterialProfile = {
    id: crypto.randomUUID(),
    ...profile,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  profiles.push(newProfile);
  localStorage.setItem(MATERIAL_PROFILES_KEY, JSON.stringify(profiles));
  
  updateSubBlock(profile.subBlockId, { status: 'CLASSIFIED' as SubBlockStatus });
  
  return newProfile;
}

// ============================================
// سرویس‌های DestinationDecision (تصمیم مقصد)
// ============================================

export function getDestinationDecisions(subBlockId?: string): DestinationDecision[] {
  try {
    const data = localStorage.getItem(DESTINATION_DECISIONS_KEY);
    const decisions: DestinationDecision[] = data ? JSON.parse(data) : [];
    return subBlockId ? decisions.filter(d => d.subBlockId === subBlockId) : decisions;
  } catch {
    return [];
  }
}

export function addDestinationDecision(
  decision: Omit<DestinationDecision, 'id' | 'createdAt' | 'updatedAt'>
): DestinationDecision {
  const decisions = getDestinationDecisions();
  const newDecision: DestinationDecision = {
    id: crypto.randomUUID(),
    ...decision,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  decisions.push(newDecision);
  localStorage.setItem(DESTINATION_DECISIONS_KEY, JSON.stringify(decisions));
  
  updateSubBlock(decision.subBlockId, { status: 'DESTINATION_ASSIGNED' as SubBlockStatus });
  
  return newDecision;
}