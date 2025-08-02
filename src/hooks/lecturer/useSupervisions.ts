import { useCallback, useState } from 'react';

import lecturerService from '@/lib/services/lecturers.service';
import supervisionService from '@/lib/services/supervisions.service';
import { handleApiResponse } from '@/lib/utils/handleApi';

interface SupervisorInfo {
	id: string;
	fullName: string;
}

interface UseSupervisionReturn {
	supervisors: SupervisorInfo[];
	loading: boolean;
	error: string | null;
	fetchSupervisors: (thesisId: string) => Promise<SupervisorInfo[]>;
}

export function useSupervisions(): UseSupervisionReturn {
	const [supervisors, setSupervisors] = useState<SupervisorInfo[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchSupervisors = useCallback(
		async (thesisId: string): Promise<SupervisorInfo[]> => {
			if (!thesisId) {
				return [];
			}

			try {
				setLoading(true);
				setError(null);

				// Get supervision data
				const supervisionResponse =
					await supervisionService.getByThesisId(thesisId);
				const supervisionResult = handleApiResponse(supervisionResponse);

				if (!supervisionResult.success) {
					throw new Error(
						supervisionResult.error?.message || 'Failed to fetch supervisions',
					);
				}

				const supervisionData = supervisionResult.data || [];
				const supervisorInfos: SupervisorInfo[] = [];

				// Fetch lecturer details for each supervision
				for (const supervision of supervisionData) {
					try {
						const lecturerResponse = await lecturerService.findOne(
							supervision.lecturerId,
						);
						const lecturerResult = handleApiResponse(lecturerResponse);

						if (lecturerResult.success && lecturerResult.data) {
							supervisorInfos.push({
								id: lecturerResult.data.id,
								fullName: lecturerResult.data.fullName,
							});
						}
					} catch (lecturerError) {
						console.error(
							`Error fetching lecturer ${supervision.lecturerId}:`,
							lecturerError,
						);
						// Add unknown supervisor instead of failing completely
						supervisorInfos.push({
							id: supervision.lecturerId,
							fullName: 'Unknown Supervisor',
						});
					}
				}

				setSupervisors(supervisorInfos);
				return supervisorInfos;
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to fetch supervisors';
				setError(errorMessage);
				console.error('Error fetching supervisors:', error);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	return {
		supervisors,
		loading,
		error,
		fetchSupervisors,
	};
}
