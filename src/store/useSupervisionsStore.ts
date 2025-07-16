import { create } from 'zustand';

import lecturersService from '@/lib/services/lecturers.service';
import supervisionsService from '@/lib/services/supervisions.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { Supervision } from '@/schemas/supervision';

export interface LecturerInfo {
	id: string;
	fullName: string;
	email: string;
	phoneNumber?: string;
}

interface SupervisionsState {
	supervisors: LecturerInfo[];
	loading: boolean;
	error: string | null;
	thesisId: string | null;

	fetchSupervisors: (thesisId: string) => Promise<void>;
	clearSupervisors: () => void;
}

export const useSupervisionsStore = create<SupervisionsState>((set) => ({
	supervisors: [],
	loading: false,
	error: null,
	thesisId: null,

	fetchSupervisors: async (thesisId: string) => {
		set({ loading: true, error: null, thesisId });

		try {
			// Fetch supervisions data
			const supervisionsResponse =
				await supervisionsService.getByThesisId(thesisId);
			const supervisionsResult = handleApiResponse(
				supervisionsResponse,
				'Success',
			);

			if (supervisionsResult.success && supervisionsResult.data) {
				// Fetch lecturer details for each supervision
				const lecturerPromises = supervisionsResult.data.map(
					async (supervision: Supervision) => {
						const lecturerResponse = await lecturersService.findOne(
							supervision.lecturer.id,
						);
						const lecturerResult = handleApiResponse(
							lecturerResponse,
							'Success',
						);

						if (lecturerResult.success && lecturerResult.data) {
							return {
								id: lecturerResult.data.id,
								fullName: lecturerResult.data.fullName,
								email: lecturerResult.data.email,
								phoneNumber: lecturerResult.data.phoneNumber,
							};
						}
						return null;
					},
				);

				const lecturers = await Promise.all(lecturerPromises);
				const validLecturers = lecturers.filter(Boolean) as LecturerInfo[];

				set({
					supervisors: validLecturers,
					loading: false,
					error: null,
				});
			} else {
				set({
					supervisors: [],
					loading: false,
					error:
						supervisionsResult.error?.message || 'Failed to fetch supervisions',
				});
			}
		} catch (error) {
			console.error('Error fetching supervisors:', error);
			set({
				supervisors: [],
				loading: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			});
		}
	},

	clearSupervisors: () => {
		set({ supervisors: [], loading: false, error: null, thesisId: null });
	},
}));
