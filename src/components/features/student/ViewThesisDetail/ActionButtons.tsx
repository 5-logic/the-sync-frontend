'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Row, Space } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import { useSemesterStatus } from '@/hooks/student/useSemesterStatus';
import { useStudentGroupStatus } from '@/hooks/student/useStudentGroupStatus';
import { useThesisRegistration } from '@/hooks/thesis';
import thesisApplicationService, {
	ThesisApplication,
} from '@/lib/services/thesis-application.service';
import { handleApiError } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { ThesisWithRelations } from '@/schemas/thesis';
import { cacheUtils } from '@/store/helpers/cacheHelpers';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

interface Props {
	readonly thesis: ThesisWithRelations;
	readonly disabled?: boolean;
	readonly applications?: ThesisApplication[];
	readonly applicationsLoading?: boolean;
	readonly onThesisUpdate?: () => void | Promise<void>;
	readonly onApplicationsRefresh?: () => void | Promise<void>;
}

export default function ActionButtons({
	thesis,
	disabled = false,
	applications = [],
	applicationsLoading = false,
	onThesisUpdate,
	onApplicationsRefresh,
}: Props) {
	const router = useRouter();
	const { hasGroup, isLeader, group, resetInitialization } =
		useStudentGroupStatus();
	const { canRegisterThesis, loading: semesterLoading } = useSemesterStatus();
	const { registerThesis, unregisterThesis, isRegistering } =
		useThesisRegistration();
	const { fetchStudentGroup } = useGroupDashboardStore();

	// Check if current group has application for this thesis
	const hasApplicationForThesis = useMemo(() => {
		return applications.some(
			(app: ThesisApplication) =>
				app.thesisId === thesis.id && app.status === 'Pending',
		);
	}, [applications, thesis.id]);

	const handleBackToList = useCallback(() => {
		router.push('/student/list-thesis');
	}, [router]);

	const handleRegisterThesis = useCallback(async () => {
		await registerThesis(thesis.id, thesis.englishName, async () => {
			// Immediately trigger thesis refresh for instant UI update
			onThesisUpdate?.();

			// Clear relevant caches and refresh group data in background
			cacheUtils.clear('semesterStatus');
			fetchStudentGroup(true); // Remove await to not block UI
			resetInitialization();
		});
	}, [
		registerThesis,
		thesis.id,
		thesis.englishName,
		fetchStudentGroup,
		resetInitialization,
		onThesisUpdate,
	]);

	const handleUnregisterThesis = useCallback(async () => {
		await unregisterThesis(thesis.englishName, async () => {
			// Immediately trigger thesis refresh for instant UI update
			onThesisUpdate?.();

			// Clear relevant caches and refresh group data in background
			cacheUtils.clear('semesterStatus');
			fetchStudentGroup(true); // Remove await to not block UI
			resetInitialization();
		});
	}, [
		unregisterThesis,
		thesis.englishName,
		fetchStudentGroup,
		resetInitialization,
		onThesisUpdate,
	]);

	// Handle cancel application (for pending applications)
	const handleCancelApplication = useCallback(async () => {
		if (!group?.id) return;

		ConfirmationModal.show({
			title: 'Cancel Application',
			message:
				'Are you sure you want to cancel your application for this thesis?',
			details: thesis.englishName,
			note: 'This action cannot be undone.',
			noteType: 'warning',
			okText: 'Yes, Cancel',
			cancelText: 'No',
			okType: 'danger',
			onOk: async () => {
				try {
					await thesisApplicationService.cancelThesisApplication(
						group.id,
						thesis.id,
					);

					showNotification.success(
						'Application Canceled',
						'Your thesis application has been canceled successfully!',
					);

					// Refresh applications first to update button state immediately
					onApplicationsRefresh?.();

					// Then refresh thesis data
					onThesisUpdate?.();

					// Clear caches
					cacheUtils.clear('semesterStatus');
					fetchStudentGroup(true);
					resetInitialization();
				} catch (error) {
					console.error('Error canceling application:', error);

					const apiError = handleApiError(
						error,
						'Failed to cancel application. Please try again.',
					);

					showNotification.error('Cancel Failed', apiError.message);
				}
			},
		});
	}, [
		group?.id,
		thesis.id,
		thesis.englishName,
		onApplicationsRefresh,
		onThesisUpdate,
		fetchStudentGroup,
		resetInitialization,
	]);

	// Check if current group has this thesis assigned (check if thesis.groupId matches current group)
	const isThesisAssignedToGroup = group?.id === thesis.groupId;

	// Check if all data is loaded
	const isAllDataLoaded = !applicationsLoading && !semesterLoading;

	// Show register button only if user has group, is leader, and thesis is not assigned to any group, and no pending application
	const showRegisterButton =
		isAllDataLoaded &&
		hasGroup &&
		isLeader &&
		thesis.groupId == null &&
		!hasApplicationForThesis; // Use == null to catch both null and undefined

	// Show unregister button only if user has group, is leader, and this thesis is assigned to their group
	const showUnregisterButton =
		isAllDataLoaded && hasGroup && isLeader && isThesisAssignedToGroup;

	// Show cancel application button if user has group, is leader, and has pending application for this thesis (not yet assigned)
	const showCancelApplicationButton =
		isAllDataLoaded &&
		hasGroup &&
		isLeader &&
		hasApplicationForThesis &&
		!isThesisAssignedToGroup;

	// Show loading button when data is still being loaded
	const showLoadingButton =
		!isAllDataLoaded && hasGroup && isLeader && !isThesisAssignedToGroup;

	// Disable register button if semester is not in picking phase
	const isRegisterDisabled = disabled || !canRegisterThesis || isRegistering;

	return (
		<Row justify="end">
			<Space>
				<Button icon={<ArrowLeftOutlined />} onClick={handleBackToList}>
					Back to List
				</Button>
				{showRegisterButton && (
					<Button
						type="primary"
						onClick={handleRegisterThesis}
						loading={isRegistering || semesterLoading}
						disabled={isRegisterDisabled}
						title={
							!canRegisterThesis
								? 'Application is only available during the "Picking" phase or "Ongoing - Scope Adjustable" phase'
								: undefined
						}
					>
						{isRegistering ? 'Applying...' : 'Apply Thesis'}
					</Button>
				)}
				{showUnregisterButton && (
					<Button
						type="primary"
						danger
						onClick={handleUnregisterThesis}
						loading={isRegistering}
						disabled={disabled}
					>
						{isRegistering ? 'Unpicking...' : 'Unpick Thesis'}
					</Button>
				)}
				{showCancelApplicationButton && (
					<Button
						type="primary"
						danger
						onClick={handleCancelApplication}
						loading={isRegistering}
						disabled={disabled}
					>
						Cancel Request
					</Button>
				)}
				{showLoadingButton && (
					<Button type="primary" loading={true} disabled={true}>
						Checking...
					</Button>
				)}
			</Space>
		</Row>
	);
}
