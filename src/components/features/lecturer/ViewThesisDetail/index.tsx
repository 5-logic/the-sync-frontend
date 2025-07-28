'use client';

import { Modal, Space, Spin, Typography } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { ThesisConfirmationModals } from '@/components/common/ConfirmModal';
import { Header } from '@/components/common/Header';
import ContentLoader from '@/components/common/loading/ContentLoader';
import ActionButtons from '@/components/features/lecturer/ViewThesisDetail/ActionButtons';
import DuplicateThesesModal from '@/components/features/lecturer/ViewThesisDetail/DuplicateThesesModal';
import ThesisInfoCard from '@/components/features/lecturer/ViewThesisDetail/ThesisInfoCard';
import { useSessionData } from '@/hooks/auth/useAuth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import {
	useAiDuplicateCheck,
	useThesisActions,
	useThesisDetail,
} from '@/hooks/thesis';
import { showNotification } from '@/lib/utils/notification';
import { usePublishThesesStore } from '@/store/usePublishThesesStore';

interface ViewThesisDetailProps {
	readonly mode?: 'thesis-management' | 'publish-list';
}

export default function ViewThesisDetail({
	mode = 'thesis-management',
}: Readonly<ViewThesisDetailProps>) {
	const { id: thesisId } = useParams() as { id: string };
	const router = useRouter();
	const { session } = useSessionData();
	const permissions = usePermissions();

	// Use custom hooks for data and actions
	const { thesis, loading, error, loadingMessage } = useThesisDetail(thesisId);
	const {
		loading: duplicateLoading,
		duplicateTheses,
		isModalVisible: isDuplicateModalVisible,
		checkDuplicate,
		closeModal: closeDuplicateModal,
	} = useAiDuplicateCheck();

	// Handle AI duplicate check callback
	const handleDuplicateCheckFromAction = async () => {
		if (!thesis) return;
		await checkDuplicate(thesis.id);
	};

	const { loadingStates, modalStates, actions } = useThesisActions(
		thesisId,
		handleDuplicateCheckFromAction,
	);

	// Publish thesis functionality
	const { updatePublishStatus } = usePublishThesesStore();
	const [publishLoading, setPublishLoading] = useState(false);

	// Memoize permission checks
	const permissionChecks = useMemo(() => {
		if (!thesis || !session?.user) {
			return { canSubmit: false, canModerate: false };
		}

		const isThesisOwner = thesis.lecturerId === session.user.id;
		const canModerate =
			permissions?.canAccessModeratorFeatures && !isThesisOwner;

		return {
			canSubmit: isThesisOwner,
			canModerate,
		};
	}, [thesis, session?.user, permissions]);

	// Handle publish thesis action
	const handlePublishThesis = async () => {
		if (!thesis) return;

		const isCurrentlyPublished = thesis.isPublish;

		// Business rule: Cannot unpublish if thesis has group assigned
		if (isCurrentlyPublished && thesis.groupId) {
			showNotification.warning(
				'Cannot unpublish thesis that has been assigned to a group.',
			);
			return;
		}

		ThesisConfirmationModals.publish(
			thesis.englishName,
			isCurrentlyPublished,
			async () => {
				setPublishLoading(true);
				try {
					const success = await updatePublishStatus(
						[thesis.id],
						!isCurrentlyPublished,
					);
					if (success) {
						const actionText = isCurrentlyPublished
							? 'unpublished'
							: 'published';
						showNotification.success(`Thesis ${actionText} successfully!`);
						router.back();
					} else {
						const actionText = isCurrentlyPublished ? 'unpublish' : 'publish';
						showNotification.error(
							`Failed to ${actionText} thesis. Please try again.`,
						);
					}
				} catch (error) {
					console.error('Error updating thesis publish status:', error);
					showNotification.error(
						'An unexpected error occurred while updating the thesis.',
					);
				} finally {
					setPublishLoading(false);
				}
			},
			publishLoading,
		);
	};

	// Handle AI duplicate check
	const handleDuplicateCheck = async () => {
		if (!thesis) return;
		await checkDuplicate(thesis.id);
	};

	// Handle exit action based on mode
	const handleExit = async () => {
		if (mode === 'publish-list') {
			// If in publish mode, go back to publish list
			router.push('/lecturer/assign-list-publish-thesis');
		} else {
			// Otherwise use the default thesis actions handler
			actions.handleExit();
		}
	};

	if (loading) {
		return (
			<ContentLoader>
				<div
					style={{
						textAlign: 'center',
						padding: '20px',
						minHeight: 'calc(100vh - 280px)',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Spin size="large" />
					<Typography.Text
						type="secondary"
						style={{ display: 'block', marginTop: 16 }}
					>
						{loadingMessage}
					</Typography.Text>
				</div>
			</ContentLoader>
		);
	}

	if (error || !thesis) {
		return (
			<ContentLoader>
				<div
					style={{
						textAlign: 'center',
						padding: '20px',
						minHeight: 'calc(100vh - 280px)',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Typography.Title level={4} type="danger">
						Error Loading Thesis
					</Typography.Title>
					<Typography.Text type="secondary">
						{error ?? 'The requested thesis could not be found.'}
					</Typography.Text>
				</div>
			</ContentLoader>
		);
	}

	return (
		<Space direction="vertical" style={{ width: '100%' }}>
			<Header
				title="Thesis Detail"
				description="View comprehensive thesis information, supervisor details, and manage
				approval status."
			/>
			<div style={{ display: 'grid', gap: '24px' }}>
				<ThesisInfoCard thesis={thesis} />

				<ActionButtons
					status={thesis.status}
					canModerate={permissionChecks.canModerate}
					isThesisOwner={permissionChecks.canSubmit}
					exitLoading={loadingStates.exitLoading}
					submitLoading={loadingStates.submitLoading}
					deleteLoading={loadingStates.deleteLoading}
					approveLoading={loadingStates.approveLoading}
					rejectLoading={loadingStates.rejectLoading}
					publishLoading={publishLoading}
					duplicateLoading={duplicateLoading}
					mode={mode}
					isPublished={thesis.isPublish}
					canUnpublish={!thesis.groupId}
					onToggleDuplicate={handleDuplicateCheck}
					onExit={handleExit}
					onEdit={actions.handleEdit}
					onApprove={() => modalStates.setShowApproveConfirm(true)}
					onReject={() => modalStates.setShowRejectConfirm(true)}
					onRegisterSubmit={actions.handleSubmit}
					onPublishThesis={handlePublishThesis}
					onDelete={actions.handleDelete}
				/>
			</div>

			{/* Approve Confirmation Modal */}
			<Modal
				title="Approve Thesis"
				open={modalStates.showApproveConfirm}
				onOk={actions.handleApprove}
				onCancel={() => modalStates.setShowApproveConfirm(false)}
				okText="Yes, Approve"
				cancelText="Cancel"
				centered
				okButtonProps={{
					loading: loadingStates.approveLoading,
				}}
			>
				<Typography.Text>
					Are you sure you want to approve this thesis?
				</Typography.Text>
				<br />
				<Typography.Text type="secondary">
					Once approved, the thesis status will be changed to
					&quot;Approved&quot; and will be available for student registration.
				</Typography.Text>
			</Modal>

			{/* Reject Confirmation Modal */}
			<Modal
				title="Reject Thesis"
				open={modalStates.showRejectConfirm}
				onOk={actions.handleReject}
				onCancel={() => modalStates.setShowRejectConfirm(false)}
				okText="Yes, Reject"
				okType="danger"
				cancelText="Cancel"
				centered
				okButtonProps={{
					loading: loadingStates.rejectLoading,
				}}
			>
				<Typography.Text>
					Are you sure you want to reject this thesis?
				</Typography.Text>
				<br />
				<Typography.Text type="warning" strong>
					Warning: Once rejected, the thesis status will be changed to
					&quot;Rejected&quot; and the author will need to revise it.
				</Typography.Text>
			</Modal>

			{/* Duplicate Theses Modal */}
			<DuplicateThesesModal
				isVisible={isDuplicateModalVisible}
				onClose={closeDuplicateModal}
				duplicateTheses={duplicateTheses}
				loading={duplicateLoading}
			/>
		</Space>
	);
}
