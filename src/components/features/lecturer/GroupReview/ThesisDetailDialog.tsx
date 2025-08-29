'use client';

import { Modal, Spin, Typography } from 'antd';
import React, { useEffect } from 'react';

import ThesisInfoCard from '@/components/features/lecturer/ViewThesisDetail/ThesisInfoCard';
import { useThesisDetail } from '@/hooks/thesis';
import { showNotification } from '@/lib/utils/notification';

const { Text } = Typography;

interface ThesisDetailDialogProps {
	readonly open: boolean;
	readonly thesisId: string;
	readonly onClose: () => void;
}

export default function ThesisDetailDialog({
	open,
	thesisId,
	onClose,
}: ThesisDetailDialogProps) {
	const { thesis, loading, error } = useThesisDetail(thesisId);

	useEffect(() => {
		if (error) {
			showNotification.error(
				'Error',
				`Failed to load thesis details: ${error}`,
			);
		}
	}, [error]);

	// Render content based on loading and thesis data states
	const renderContent = () => {
		if (loading) {
			return (
				<div style={{ textAlign: 'center', padding: '20px' }}>
					<Spin size="large" />
					<Text style={{ display: 'block', marginTop: '10px' }}>
						Loading thesis details...
					</Text>
				</div>
			);
		}

		if (thesis) {
			return <ThesisInfoCard thesis={thesis} />;
		}

		return (
			<div style={{ textAlign: 'center', padding: '20px' }}>
				<Text type="danger">{error || 'Failed to load thesis details'}</Text>
			</div>
		);
	};

	return (
		<Modal
			title="Thesis Details"
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
