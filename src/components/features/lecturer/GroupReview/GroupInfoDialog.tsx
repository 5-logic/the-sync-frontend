'use client';

import { Modal, Spin, Typography } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

import GroupInfoCard from '@/components/features/student/GroupDashboard/GroupInfoCard';
import groupService from '@/lib/services/groups.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { GroupDashboard } from '@/schemas/group';

const { Text } = Typography;

interface GroupInfoDialogProps {
	readonly open: boolean;
	readonly groupId: string;
	readonly onClose: () => void;
}

export default function GroupInfoDialog({
	open,
	groupId,
	onClose,
}: GroupInfoDialogProps) {
	const [loading, setLoading] = useState(false);
	const [groupData, setGroupData] = useState<GroupDashboard | null>(null);
	const [error, setError] = useState<string | null>(null);

	const fetchGroupDetails = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await groupService.getPublicGroupDetail(groupId);
			const result = handleApiResponse(response);

			if (result.success && result.data) {
				setGroupData(result.data as GroupDashboard);
			} else {
				const errorMessage =
					result.error?.message || 'Failed to load group details';
				setError(errorMessage);
				showNotification.error('Error', errorMessage);
			}
		} catch (err) {
			setError('An unexpected error occurred while loading group data');
			console.error('Error fetching group details:', err);
		} finally {
			setLoading(false);
		}
	}, [groupId]);

	useEffect(() => {
		if (open && groupId) {
			fetchGroupDetails();
		}
	}, [open, groupId, fetchGroupDetails]);

	// Render content based on loading and data states
	const renderContent = () => {
		if (loading) {
			return (
				<div style={{ textAlign: 'center', padding: '20px' }}>
					<Spin size="large" />
					<Text style={{ display: 'block', marginTop: '10px' }}>
						Loading group details...
					</Text>
				</div>
			);
		}

		if (groupData) {
			return <GroupInfoCard group={groupData} viewOnly={true} />;
		}

		return (
			<div style={{ textAlign: 'center', padding: '20px' }}>
				<Text type="danger">{error || 'Failed to load group details'}</Text>
			</div>
		);
	};

	return (
		<Modal
			title="Group Details"
			open={open}
			onCancel={onClose}
			width={800}
			footer={null}
			destroyOnClose
		>
			{renderContent()}
		</Modal>
	);
}
