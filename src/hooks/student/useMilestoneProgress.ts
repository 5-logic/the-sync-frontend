'use client';

import { useCallback, useEffect, useState } from 'react';

import groupService from '@/lib/services/groups.service';
import milestoneService from '@/lib/services/milestones.service';
import { StorageService } from '@/lib/services/storage.service';
import { handleApiError } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { Milestone } from '@/schemas/milestone';
import { Submission } from '@/schemas/submission';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

export interface MilestoneSubmission
	extends Omit<Submission, 'createdAt' | 'updatedAt'> {
	// Local state for file management
	files: File[];
	isSubmitting: boolean;
}

export const useMilestoneProgress = () => {
	const { group } = useGroupDashboardStore();
	const [milestones, setMilestones] = useState<Milestone[]>([]);
	const [loading, setLoading] = useState(false);
	const [submissions, setSubmissions] = useState<
		Record<string, MilestoneSubmission>
	>({});

	// Fetch milestones for current semester
	const fetchMilestones = useCallback(async () => {
		console.log(
			'🚀 fetchMilestones called with group.semester.id:',
			group?.semester?.id,
		);

		if (!group?.semester?.id) {
			console.log('❌ No group semester ID, skipping fetch');
			return;
		}

		setLoading(true);
		console.log('⏳ Setting loading to true');

		try {
			console.log('📡 Calling milestoneService.findBySemester...');
			const response = await milestoneService.findBySemester(group.semester.id);
			console.log('📡 Milestone API response:', response);

			if (response.success && response.data) {
				console.log('✅ Setting milestones:', response.data);
				setMilestones(response.data);
			} else {
				console.log('❌ API response unsuccessful or no data');
			}
		} catch (error) {
			const apiError = handleApiError(error, 'Failed to fetch milestones');
			showNotification.error('Error', apiError.message);
			console.error('❌ Error fetching milestones:', error);
		} finally {
			console.log('✅ Setting loading to false');
			setLoading(false);
		}
	}, [group?.semester?.id]);

	// Fetch submissions for current group
	const fetchSubmissions = useCallback(async () => {
		if (!group?.id) return;

		try {
			const response = await groupService.getSubmissions(group.id);
			if (response.success && response.data) {
				// Update local submissions state with API data
				const updatedSubmissions: Record<string, MilestoneSubmission> = {};
				response.data.forEach((apiSub) => {
					updatedSubmissions[apiSub.milestoneId] = {
						id: apiSub.id,
						groupId: apiSub.groupId,
						milestoneId: apiSub.milestoneId,
						documents: apiSub.documents,
						status: apiSub.status,
						files: [], // Files will be managed locally for new uploads
						isSubmitting: false,
					};
				});

				setSubmissions((prev) => ({
					...prev,
					...updatedSubmissions,
				}));
			}
		} catch (error) {
			const apiError = handleApiError(error, 'Failed to fetch submissions');
			showNotification.error('Error', apiError.message);
		}
	}, [group?.id]);

	// Initialize milestones and submissions on component mount
	useEffect(() => {
		console.log(
			'🔄 useEffect triggered, calling fetchMilestones and fetchSubmissions',
		);
		fetchMilestones();
		fetchSubmissions();
	}, [fetchMilestones, fetchSubmissions]);

	// Update files for a specific milestone
	const updateMilestoneFiles = (milestoneId: string, files: File[]) => {
		setSubmissions((prev) => ({
			...prev,
			[milestoneId]: {
				...prev[milestoneId],
				milestoneId,
				files,
				isSubmitting: false,
			},
		}));
	};

	// Submit milestone documents
	const submitMilestone = async (milestoneId: string) => {
		const submission = submissions[milestoneId];
		if (!submission?.files?.length || !group?.id) {
			showNotification.warning(
				'Warning',
				'Please select files before submitting',
			);
			return;
		}

		// Update submitting state
		setSubmissions((prev) => ({
			...prev,
			[milestoneId]: {
				...prev[milestoneId],
				isSubmitting: true,
			},
		}));

		try {
			// Upload files to Supabase
			const uploadPromises = submission.files.map((file) =>
				StorageService.uploadFile(file, 'milestone-submissions'),
			);

			const documentUrls = await Promise.all(uploadPromises);

			// Submit to API
			await groupService.submitMilestone(group.id, milestoneId, documentUrls);

			showNotification.success('Success', 'Milestone submitted successfully');

			// Refresh submissions to get updated data
			await fetchSubmissions();

			// Clear the local submission files
			setSubmissions((prev) => ({
				...prev,
				[milestoneId]: {
					...prev[milestoneId],
					files: [],
				},
			}));
		} catch (error) {
			const apiError = handleApiError(error, 'Failed to submit milestone');
			showNotification.error('Submission Failed', apiError.message);
			console.error('Error submitting milestone:', error);
		} finally {
			// Update submitting state
			setSubmissions((prev) => ({
				...prev,
				[milestoneId]: {
					...prev[milestoneId],
					isSubmitting: false,
				},
			}));
		}
	};

	// Update milestone submission
	const updateMilestoneSubmission = async (milestoneId: string) => {
		const submission = submissions[milestoneId];
		if (!submission?.files?.length || !group?.id) {
			showNotification.warning(
				'Warning',
				'Please select files before updating',
			);
			return;
		}

		// Update submitting state
		setSubmissions((prev) => ({
			...prev,
			[milestoneId]: {
				...prev[milestoneId],
				isSubmitting: true,
			},
		}));

		try {
			// Delete old files from Supabase if they exist
			if (submission.documents?.length) {
				const deletePromises = submission.documents.map((url: string) =>
					StorageService.deleteFile(url),
				);
				await Promise.all(deletePromises);
			}

			// Upload new files to Supabase
			const uploadPromises = submission.files.map((file) =>
				StorageService.uploadFile(file, 'milestone-submissions'),
			);

			const documentUrls = await Promise.all(uploadPromises);

			// Update submission via API
			await groupService.updateMilestoneSubmission(
				group.id,
				milestoneId,
				documentUrls,
			);

			showNotification.success(
				'Success',
				'Milestone submission updated successfully',
			);

			// Refresh submissions to get updated data
			await fetchSubmissions();

			// Clear the local submission files
			setSubmissions((prev) => ({
				...prev,
				[milestoneId]: {
					...prev[milestoneId],
					files: [],
				},
			}));
		} catch (error) {
			const apiError = handleApiError(
				error,
				'Failed to update milestone submission',
			);
			showNotification.error('Update Failed', apiError.message);
			console.error('Error updating milestone submission:', error);
		} finally {
			// Update submitting state
			setSubmissions((prev) => ({
				...prev,
				[milestoneId]: {
					...prev[milestoneId],
					isSubmitting: false,
				},
			}));
		}
	};

	return {
		milestones,
		loading,
		submissions,
		updateMilestoneFiles,
		submitMilestone,
		updateMilestoneSubmission,
		refetchMilestones: fetchMilestones,
		refetchSubmissions: fetchSubmissions,
	};
};
