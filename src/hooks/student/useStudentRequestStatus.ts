'use client';

import { useCallback, useEffect, useState } from 'react';

import requestService from '@/lib/services/requests.service';
import { showNotification } from '@/lib/utils/notification';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

interface UseStudentRequestStatusReturn {
	// State
	hasInvite: boolean;
	hasJoinRequest: boolean;
	requestId: string | null;
	loading: boolean;

	// Actions
	sendInvite: () => Promise<void>;
	cancelInvite: () => Promise<void>;
	approveJoinRequest: () => Promise<void>;
	rejectJoinRequest: () => Promise<void>;
	refreshStatus: () => Promise<void>;
}

/**
 * Hook to manage request status between current user's group and a specific student
 */
export function useStudentRequestStatus(
	studentId: string,
): UseStudentRequestStatusReturn {
	const [hasInvite, setHasInvite] = useState(false);
	const [hasJoinRequest, setHasJoinRequest] = useState(false);
	const [requestId, setRequestId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Get current user's group from store
	const { group: currentGroup } = useGroupDashboardStore();

	// Check request status
	const checkRequestStatus = useCallback(async () => {
		if (!currentGroup?.id || !studentId) {
			setHasInvite(false);
			setHasJoinRequest(false);
			setRequestId(null);
			return;
		}

		try {
			const response = await requestService.getGroupRequests(currentGroup.id);
			if (response.success) {
				const pendingRequests = response.data.filter(
					(req) => req.status === 'Pending',
				);

				// Check for invite sent to this student
				const inviteRequest = pendingRequests.find(
					(req) => req.type === 'Invite' && req.studentId === studentId,
				);

				// Check for join request from this student
				const joinRequest = pendingRequests.find(
					(req) => req.type === 'Join' && req.studentId === studentId,
				);

				setHasInvite(!!inviteRequest);
				setHasJoinRequest(!!joinRequest);
				setRequestId(inviteRequest?.id || joinRequest?.id || null);
			}
		} catch (error) {
			console.error('Failed to check request status:', error);
		}
	}, [currentGroup?.id, studentId]);

	// Send invite to student
	const sendInvite = useCallback(async () => {
		if (!currentGroup?.id || !studentId) return;

		setLoading(true);
		try {
			const response = await requestService.inviteMultipleStudents(
				currentGroup.id,
				[studentId],
			);

			if (response.success) {
				showNotification.success('Invitation sent successfully!');
				await checkRequestStatus();
			} else {
				showNotification.error('Failed to send invitation. Please try again.');
			}
		} catch (error) {
			console.error('Error sending invitation:', error);
			showNotification.error('Failed to send invitation. Please try again.');
		} finally {
			setLoading(false);
		}
	}, [currentGroup?.id, studentId, checkRequestStatus]);

	// Helper function to update request status
	const updateRequestStatusHelper = useCallback(
		async (
			status: 'Approved' | 'Rejected' | 'Cancelled',
			successMessage: string,
			errorMessage: string,
		) => {
			if (!requestId) return;

			setLoading(true);
			try {
				const response = await requestService.updateRequestStatus(requestId, {
					status,
				});

				if (response.success) {
					showNotification.success(successMessage);
					await checkRequestStatus();
				} else {
					showNotification.error(errorMessage);
				}
			} catch (error) {
				console.error(`Error updating request status to ${status}:`, error);
				showNotification.error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[requestId, checkRequestStatus],
	);

	// Cancel invite
	const cancelInvite = useCallback(async () => {
		await updateRequestStatusHelper(
			'Cancelled',
			'Invitation cancelled successfully!',
			'Failed to cancel invitation. Please try again.',
		);
	}, [updateRequestStatusHelper]);

	// Approve join request
	const approveJoinRequest = useCallback(async () => {
		await updateRequestStatusHelper(
			'Approved',
			'Join request approved successfully!',
			'Failed to approve request. Please try again.',
		);
	}, [updateRequestStatusHelper]);

	// Reject join request
	const rejectJoinRequest = useCallback(async () => {
		await updateRequestStatusHelper(
			'Rejected',
			'Join request rejected successfully!',
			'Failed to reject request. Please try again.',
		);
	}, [updateRequestStatusHelper]);

	// Refresh status
	const refreshStatus = useCallback(async () => {
		await checkRequestStatus();
	}, [checkRequestStatus]);

	// Check status on mount and when dependencies change
	useEffect(() => {
		checkRequestStatus();
	}, [checkRequestStatus]);

	return {
		hasInvite,
		hasJoinRequest,
		requestId,
		loading,
		sendInvite,
		cancelInvite,
		approveJoinRequest,
		rejectJoinRequest,
		refreshStatus,
	};
}
