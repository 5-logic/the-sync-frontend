import { useCallback, useState } from 'react';

import groupService from '@/lib/services/groups.service';
import lecturerService from '@/lib/services/lecturers.service';
import supervisionService, {
	SupervisionData,
} from '@/lib/services/supervisions.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { GroupDashboard } from '@/schemas/group';

export interface GroupWithSupervisors extends GroupDashboard {
	supervisors: string[];
}

interface UseGroupProgressReturn {
	selectedGroupDetail: GroupWithSupervisors | null;
	loading: boolean;
	error: string | null;
	fetchGroupDetail: (groupId: string) => Promise<void>;
	clearSelectedGroup: () => void;
}

export function useGroupProgress(): UseGroupProgressReturn {
	const [selectedGroupDetail, setSelectedGroupDetail] =
		useState<GroupWithSupervisors | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchGroupDetail = useCallback(async (groupId: string) => {
		try {
			setLoading(true);
			setError(null);

			// Fetch group detail
			const groupResponse = await groupService.findOne(groupId);
			const groupResult = handleApiResponse(groupResponse);

			if (!groupResult.success || !groupResult.data) {
				throw new Error(
					groupResult.error?.message || 'Failed to fetch group detail',
				);
			}

			const groupData = groupResult.data;
			let supervisors: string[] = [];

			// If group has thesis, fetch supervisions
			if (groupData.thesis?.id) {
				try {
					const supervisionResponse = await supervisionService.getByThesisId(
						groupData.thesis.id,
					);
					const supervisionResult = handleApiResponse(supervisionResponse);

					if (supervisionResult.success && supervisionResult.data) {
						// Fetch lecturer names for each supervision
						const lecturerPromises = supervisionResult.data.map(
							async (supervision: SupervisionData) => {
								try {
									const lecturerResponse = await lecturerService.findOne(
										supervision.lecturerId,
									);
									const lecturerResult = handleApiResponse(lecturerResponse);

									if (lecturerResult.success && lecturerResult.data) {
										return lecturerResult.data.fullName;
									}
									return supervision.lecturerId; // Fallback to ID if name not found
								} catch (lecturerError) {
									console.warn(
										`Failed to fetch lecturer ${supervision.lecturerId}:`,
										lecturerError,
									);
									return supervision.lecturerId; // Fallback to ID
								}
							},
						);

						supervisors = await Promise.all(lecturerPromises);
					}
				} catch (supervisionError) {
					console.warn('Failed to fetch supervisions:', supervisionError);
					// Don't fail the whole operation if supervisions fail
				}
			}

			// Combine group data with supervisors
			const groupWithSupervisors: GroupWithSupervisors = {
				...groupData,
				supervisors,
			};

			setSelectedGroupDetail(groupWithSupervisors);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to fetch group detail';
			setError(errorMessage);
			console.error('Error fetching group detail:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	const clearSelectedGroup = useCallback(() => {
		setSelectedGroupDetail(null);
		setError(null);
	}, []);

	return {
		selectedGroupDetail,
		loading,
		error,
		fetchGroupDetail,
		clearSelectedGroup,
	};
}
