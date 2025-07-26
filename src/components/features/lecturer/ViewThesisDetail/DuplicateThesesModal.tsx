'use client';

import { Col, Modal, Row, Spin, Typography } from 'antd';

import DuplicateThesisCard from '@/components/features/lecturer/ViewThesisDetail/DuplicateThesisCard';
import { DuplicateThesis } from '@/lib/services/ai-duplicate.service';

interface Props {
	readonly isVisible: boolean;
	readonly onClose: () => void;
	readonly duplicateTheses: DuplicateThesis[];
	readonly loading: boolean;
}

export default function DuplicateThesesModal({
	isVisible,
	onClose,
	duplicateTheses,
	loading,
}: Props) {
	// Determine what content to display
	const renderContent = () => {
		if (loading) {
			return (
				<div style={{ textAlign: 'center', padding: '40px 0' }}>
					<Spin size="large" />
					<div style={{ marginTop: 16 }}>
						<Typography.Text>Loading similar theses...</Typography.Text>
					</div>
				</div>
			);
		}

		if (duplicateTheses.length === 0) {
			return (
				<div style={{ textAlign: 'center', padding: '40px 0' }}>
					<Typography.Text type="secondary">
						No similar theses found.
					</Typography.Text>
				</div>
			);
		}

		return (
			<Row gutter={[16, 16]}>
				{duplicateTheses.map((duplicateThesis) => (
					<Col xs={24} sm={12} lg={8} key={duplicateThesis.id}>
						<DuplicateThesisCard duplicateThesis={duplicateThesis} />
					</Col>
				))}
			</Row>
		);
	};

	return (
		<Modal
			title="Similar Theses Detected"
			open={isVisible}
			onCancel={onClose}
			footer={null}
			width={1400}
			centered
			bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
		>
			<div style={{ marginBottom: 16 }}>
				<Typography.Text type="secondary">
					The following theses have been identified as potentially similar to
					the current thesis. Review the similarity percentages and thesis
					details below.
				</Typography.Text>
			</div>

			{renderContent()}
		</Modal>
	);
}
