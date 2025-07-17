'use client';

import { useCallback, useEffect, useState } from 'react';

import groupService from '@/lib/services/groups.service';
import milestoneService from '@/lib/services/milestones.service';
import { StorageService } from '@/lib/services/storage.service';
import { handleApiError } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { Milestone } from '@/schemas/milestone';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

export interface MilestoneSubmission {
	milestoneId: string;
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

	console.log('🔄 useMilestoneProgress - group:', group);
	console.log('🔄 useMilestoneProgress - loading:', loading);
	console.log('🔄 useMilestoneProgress - milestones count:', milestones.length);

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

	// Initialize milestones on component mount
	useEffect(() => {
		console.log('🔄 useEffect triggered, calling fetchMilestones');
		fetchMilestones();
	}, [fetchMilestones]);

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

			// Clear the submission
			setSubmissions((prev) => {
				const newSubmissions = { ...prev };
				delete newSubmissions[milestoneId];
				return newSubmissions;
			});
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
			// Upload files to Supabase
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

			// Clear the submission
			setSubmissions((prev) => {
				const newSubmissions = { ...prev };
				delete newSubmissions[milestoneId];
				return newSubmissions;
			});
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
	};
};
