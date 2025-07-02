'use client';

import { Modal, Spin, Typography } from 'antd';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

import ContentLoader from '@/components/common/loading/ContentLoader';
import ActionButtons from '@/components/features/lecturer/ViewThesisDetail/ActionButtons';
import ThesisHeader from '@/components/features/lecturer/ViewThesisDetail/ThesisHeader';
import ThesisInfoCard from '@/components/features/lecturer/ViewThesisDetail/ThesisInfoCard';
import { useSessionData } from '@/hooks/auth/useAuth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useThesisActions, useThesisDetail } from '@/hooks/thesis';

export default function ViewThesisDetail() {
	const { id: thesisId } = useParams() as { id: string };
	const { session } = useSessionData();
	const permissions = usePermissions();

	// Use custom hooks for data and actions
	const { thesis, loading, error, loadingMessage } = useThesisDetail(thesisId);
	const { loadingStates, modalStates, actions } = useThesisActions(thesisId);

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
		<div>
			<ThesisHeader />

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
					onToggleDuplicate={() => {}}
					onExit={actions.handleExit}
					onEdit={actions.handleEdit}
					onApprove={() => modalStates.setShowApproveConfirm(true)}
					onReject={() => modalStates.setShowRejectConfirm(true)}
					onRegisterSubmit={actions.handleSubmit}
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
		</div>
	);
}
