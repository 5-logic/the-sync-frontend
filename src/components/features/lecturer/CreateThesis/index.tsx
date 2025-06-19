'use client';

import { Space, Typography } from 'antd';

import ThesisForm from './ThesisForm';

const { Title, Paragraph } = Typography;

export default function CreateThesis() {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<div>
				<Title level={2}>Create New Thesis</Title>
				<Paragraph type="secondary">
					Register a new thesis proposal and validate for similarity
				</Paragraph>
			</div>
			<ThesisForm />
		</Space>
	);
}
