'use client';

import { Card, Space, Typography } from 'antd';
import { useState } from 'react';

import ThesisDuplicateList from '@/components/features/lecturer/CreateThesis/ThesisDuplicateList';
import ThesisActionButtons from '@/components/features/lecturer/ViewThesisDetail/ActionButtons';
import ThesisHeader from '@/components/features/lecturer/ViewThesisDetail/ThesisHeader';
import ThesisInfoCard from '@/components/features/lecturer/ViewThesisDetail/ThesisInfoCard';
import { mockTheses } from '@/data/thesis';

const { Paragraph, Title } = Typography;

export default function ThesisDetailManagerPage() {
	const [showDuplicate, setShowDuplicate] = useState(false);
	const thesis = mockTheses.find((t) => t.id === 't2');

	if (!thesis) {
		return (
			<Card>
				<Title level={4}>Thesis not found</Title>
				<Paragraph>The requested thesis could not be found.</Paragraph>
			</Card>
		);
	}

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<ThesisHeader />
			<ThesisInfoCard thesis={thesis} />
			<ThesisActionButtons
				status={thesis.status}
				showDuplicate={showDuplicate}
				onToggleDuplicate={() => setShowDuplicate(!showDuplicate)}
				onExit={() => console.log('Exit')}
				onEdit={() => console.log('Edit Thesis')}
				onApprove={() => console.log('Approved')}
				onReject={(reason) => console.log('Rejected with reason:', reason)}
			/>

			{showDuplicate && <ThesisDuplicateList />}
		</Space>
	);
}
