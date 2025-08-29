'use client';

import { Alert, Card, Col, Empty, Row, Spin, Typography } from 'antd';
import { useEffect } from 'react';

import { useAiDuplicateCheck } from '@/hooks/thesis/useAiDuplicateCheck';
import { THESIS_STATUS } from '@/lib/constants/thesis';

import DuplicateThesisCard from './DuplicateThesisCard';

interface Props {
	readonly thesisId: string;
	readonly thesisStatus: string;
	readonly canViewDuplicates?: boolean;
}

export default function DuplicateThesesSection({
	thesisId,
	thesisStatus,
	canViewDuplicates = false,
}: Props) {
	const { loading, duplicateTheses, checkDuplicateOnly } =
		useAiDuplicateCheck();

	// Automatically check for duplicates when thesis status is Pending
	useEffect(() => {
		if (
			canViewDuplicates &&
			thesisStatus === THESIS_STATUS.PENDING &&
			thesisId
		) {
			checkDuplicateOnly(thesisId);
		}
	}, [thesisId, thesisStatus, canViewDuplicates, checkDuplicateOnly]);

	// Don't show section if user doesn't have permission or thesis is not pending
	if (!canViewDuplicates || thesisStatus !== THESIS_STATUS.PENDING) {
		return null;
	}

	const renderContent = () => {
		if (loading) {
			return (
				<div style={{ textAlign: 'center', padding: '40px 0' }}>
					<Spin size="large" />
					<div style={{ marginTop: 16 }}>
						<Typography.Text type="secondary">
							Checking for similar theses...
						</Typography.Text>
					</div>
				</div>
			);
		}

		if (duplicateTheses.length === 0) {
			return (
				<Empty
					description="No similar theses found"
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				>
					<Typography.Text type="secondary">
						This thesis appears to be unique with no significant similarities to
						existing theses.
					</Typography.Text>
				</Empty>
			);
		}

		return (
			<div>
				<Alert
					message={`Found ${duplicateTheses.length} similar thesis${
						duplicateTheses.length > 1 ? 'es' : ''
					}`}
					description="Review the similarity percentages and thesis details below to ensure there's no duplication."
					type="warning"
					showIcon
					style={{ marginBottom: 16 }}
				/>
				<Row gutter={[16, 16]}>
					{duplicateTheses.map((duplicateThesis) => (
						<Col xs={24} sm={12} lg={8} key={duplicateThesis.id}>
							<DuplicateThesisCard duplicateThesis={duplicateThesis} />
						</Col>
					))}
				</Row>
			</div>
		);
	};

	return (
		<Card
			title={
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<Typography.Text strong>Similar Theses Detection</Typography.Text>
					{duplicateTheses.length > 0 && (
						<Typography.Text type="danger" style={{ fontSize: '12px' }}>
							({duplicateTheses.length} found)
						</Typography.Text>
					)}
				</div>
			}
			style={{ marginTop: 24 }}
		>
			{renderContent()}
		</Card>
	);
}
