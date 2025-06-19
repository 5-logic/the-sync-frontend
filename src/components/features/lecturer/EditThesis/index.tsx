'use client';

import { Space, Typography } from 'antd';

import ThesisForm from '@/components/features/lecturer/CreateThesis/ThesisForm';

const { Title, Paragraph } = Typography;

export default function EditThesis() {
	const initialThesis = {
		titleEn: 'AI-Powered Smart Learning Platform for University Students',
		titleVi: 'Nền tảng học tập thông minh hỗ trợ bởi AI cho sinh viên đại học',
		abbreviation: 'SmartLearn-AI',
		field: 'Computer Science & Artificial Intelligence',
		description:
			'Development of an intelligent learning platform that utilizes artificial intelligence to personalize educational content and learning paths for university students. The system will incorporate machine learning algorithms for content recommendation, learning pattern analysis, and adaptive assessment.',
		skills: ['Python', 'Machine Learning', 'Database'],
		supportingDocument: [
			{
				uid: '-1',
				name: 'thesis_proposal_v1.pdf',
				status: 'done',
				url: '/uploads/thesis_proposal_v1.pdf',
				size: 2500000,
				uploadDate: '2024-01-15',
			},
		],
	};

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
				initialValues={initialThesis}
				onSubmit={handleUpdate}
			/>
		</Space>
	);
}
