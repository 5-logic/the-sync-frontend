import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface DraftAssignment {
	thesisId: string;
	thesisTitle: string;
	groupName: string;
	lecturerIds: string[];
	lecturerNames: string[];
}

interface DraftAssignmentState {
	// Data
	draftAssignments: Record<string, DraftAssignment>;

	// Actions
	addDraftAssignment: (assignment: DraftAssignment) => void;
	removeDraftAssignment: (thesisId: string) => void;
	updateDraftAssignment: (
		thesisId: string,
		lecturerIds: string[],
		lecturerNames: string[],
	) => void;
	clearAllDrafts: () => void;
	getDraftAssignmentsList: () => DraftAssignment[];
	getDraftAssignment: (thesisId: string) => DraftAssignment | undefined;
	hasDraftAssignment: (thesisId: string) => boolean;
	getDraftCount: () => number;
}

export const useDraftAssignmentStore = create<DraftAssignmentState>()(
	devtools(
		persist(
			(set, get) => ({
				// Initial state
				draftAssignments: {},

				// Add or update draft assignment
				addDraftAssignment: (assignment: DraftAssignment): void => {
					set((state) => {
						const newState = {
							...state.draftAssignments,
							[assignment.thesisId]: assignment,
						};
						return {
							draftAssignments: newState,
						};
					});
				},

				// Remove draft assignment
				removeDraftAssignment: (thesisId: string): void => {
					set((state) => {
						const newDrafts = { ...state.draftAssignments };
						delete newDrafts[thesisId];
						return { draftAssignments: newDrafts };
					});
				},

				// Update draft assignment lecturers
				updateDraftAssignment: (
					thesisId: string,
					lecturerIds: string[],
					lecturerNames: string[],
				): void => {
					set((state) => {
						const existing = state.draftAssignments[thesisId];
						if (existing) {
							return {
								draftAssignments: {
									...state.draftAssignments,
									[thesisId]: {
										...existing,
										lecturerIds,
										lecturerNames,
									},
								},
							};
						}
						return state;
					});
				},

				// Clear all drafts
				clearAllDrafts: (): void => {
					set({ draftAssignments: {} });
				},

				// Get drafts as array
				getDraftAssignmentsList: (): DraftAssignment[] => {
					return Object.values(get().draftAssignments);
				},

				// Get specific draft
				getDraftAssignment: (thesisId: string): DraftAssignment | undefined => {
					return get().draftAssignments[thesisId];
				},

				// Check if thesis has draft
				hasDraftAssignment: (thesisId: string): boolean => {
					return thesisId in get().draftAssignments;
				},

				// Get draft count
				getDraftCount: (): number => {
					return Object.keys(get().draftAssignments).length;
				},
			}),
			{
				name: 'draft-assignment-store',
				partialize: (state) => ({ draftAssignments: state.draftAssignments }),
			},
		),
		{
			name: 'draft-assignment-store',
		},
	),
);
