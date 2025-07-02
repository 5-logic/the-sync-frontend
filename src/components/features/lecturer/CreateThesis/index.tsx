'use client';

import { Card, Col, Row, Typography } from 'antd';

import ThesisForm from '@//components/features/lecturer/CreateThesis/ThesisForm';
import { useThesisForm } from '@/hooks/thesis';

const { Title } = Typography;

export default function CreateThesis() {
	const { loading, handleSubmit } = useThesisForm({ mode: 'create' });

	return (
		<div>
			<Title level={3}>Create New Thesis</Title>

			<Card>
				<Row gutter={[24, 24]}>
					<Col span={24}>
						<ThesisForm
							mode="create"
							onSubmit={handleSubmit}
							loading={loading}
						/>
					</Col>
				</Row>
			</Card>
		</div>
	);
}
