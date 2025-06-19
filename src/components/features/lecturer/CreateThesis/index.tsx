'use client';

import { Space, Typography } from 'antd';

import ThesisForm from '@/components/features/lecturer/CreateThesis/ThesisForm';

const { Title, Paragraph } = Typography;

export default function CreateThesis() {
	const handleSubmit = (values: unknown) => {
		console.log('Create new thesis:', values);
	};

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<div>
				<Title level={2}>Create New Thesis</Title>
				<Paragraph type="secondary">
					Register a new thesis proposal and validate for similarity
				</Paragraph>
			</div>
			<ThesisForm mode="create" onSubmit={handleSubmit} />
		</Space>
	);
}
