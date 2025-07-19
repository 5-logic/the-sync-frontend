import { Checklist, ChecklistItem } from '@/schemas/checklist';

// ========== MOCK CHECKLISTS THEO PHASE ==========
// NOTE: This is legacy mock data - the app now uses real API data

export const mockChecklists: Checklist[] = [];

export const mockChecklistByPhase: Record<string, ChecklistItem[]> = {};

// Legacy exports for backward compatibility
export default mockChecklists;
