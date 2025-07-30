import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface DraftReviewerAssignment {
	submissionId: string;
	thesisTitle: string;
	groupName: string;
	mainReviewerId?: string;
	mainReviewerName?: string;
	secondaryReviewerId?: string;
	secondaryReviewerName?: string;
}

interface DraftReviewerAssignmentState {
	draftReviewerAssignments: Record<string, DraftReviewerAssignment>;
	addDraftReviewerAssignment: (assignment: DraftReviewerAssignment) => void;
	removeDraftReviewerAssignment: (submissionId: string) => void;
	updateDraftReviewerAssignment: (
		submissionId: string,
		mainReviewerId?: string,
		mainReviewerName?: string,
		secondaryReviewerId?: string,
		secondaryReviewerName?: string,
	) => void;
	clearAllDraftReviewerDrafts: () => void;
	getDraftReviewerAssignmentsList: () => DraftReviewerAssignment[];
	getDraftReviewerAssignment: (
		submissionId: string,
	) => DraftReviewerAssignment | undefined;
	hasDraftReviewerAssignment: (submissionId: string) => boolean;
	getDraftReviewerCount: () => number;
}

export const useDraftReviewerAssignmentStore =
	create<DraftReviewerAssignmentState>()(
		devtools(
			persist(
				(set, get) => ({
					draftReviewerAssignments: {},

					addDraftReviewerAssignment: (
						assignment: DraftReviewerAssignment,
					): void => {
						set((state) => ({
							draftReviewerAssignments: {
								...state.draftReviewerAssignments,
								[assignment.submissionId]: assignment,
							},
						}));
					},

					removeDraftReviewerAssignment: (submissionId: string): void => {
						set((state) => {
							const newDrafts = { ...state.draftReviewerAssignments };
							delete newDrafts[submissionId];
							return { draftReviewerAssignments: newDrafts };
						});
					},

					updateDraftReviewerAssignment: (
						submissionId: string,
						mainReviewerId?: string,
						mainReviewerName?: string,
						secondaryReviewerId?: string,
						secondaryReviewerName?: string,
					): void => {
						set((state) => {
							const existing = state.draftReviewerAssignments[submissionId];
							if (existing) {
								return {
									draftReviewerAssignments: {
										...state.draftReviewerAssignments,
										[submissionId]: {
											...existing,
											mainReviewerId,
											mainReviewerName,
											secondaryReviewerId,
											secondaryReviewerName,
										},
									},
								};
							}
							return state;
						});
					},

					clearAllDraftReviewerDrafts: (): void => {
						set({ draftReviewerAssignments: {} });
					},

					getDraftReviewerAssignmentsList: (): DraftReviewerAssignment[] => {
						return Object.values(get().draftReviewerAssignments);
					},

					getDraftReviewerAssignment: (
						submissionId: string,
					): DraftReviewerAssignment | undefined => {
						return get().draftReviewerAssignments[submissionId];
					},

					hasDraftReviewerAssignment: (submissionId: string): boolean => {
						return submissionId in get().draftReviewerAssignments;
					},

					getDraftReviewerCount: (): number => {
						return Object.keys(get().draftReviewerAssignments).length;
					},
				}),
				{
					name: 'draft-reviewer-assignment-store',
					partialize: (state) => ({
						draftReviewerAssignments: state.draftReviewerAssignments,
					}),
				},
			),
			{
				name: 'draft-reviewer-assignment-store',
			},
		),
	);
