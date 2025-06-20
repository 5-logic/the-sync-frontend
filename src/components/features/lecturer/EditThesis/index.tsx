'use client';

import { Space, Typography } from 'antd';

import ThesisForm from '@/components/features/lecturer/CreateThesis/ThesisForm';
import editThesisMock from '@/data/EditThesis';

const { Title, Paragraph } = Typography;

export default function EditThesis() {
	const handleUpdate = (values: unknown) => {
		console.log('Updated thesis:', values);
	};

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<div>
				<Title level={2}>Edit Thesis</Title>
				<Paragraph type="secondary">
					Modify and resubmit your thesis proposal for review.
				</Paragraph>
			</div>

			<ThesisForm
				mode="edit"
				initialValues={editThesisMock}
				onSubmit={handleUpdate}
			/>
		</Space>
	);
}
