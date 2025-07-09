'use client';

import { Empty, Space } from 'antd';

import ThesisHeader from '@/components/features/lecturer/ViewThesisDetail/ThesisHeader';
import { mockTheses } from '@/data/thesis';

import ActionButtons from './ActionButtons';
import ThesisInfoCard from './ThesisInfoCard';

export default function StudentThesisDetailPage() {
	const thesis = mockTheses?.[0];

	if (!thesis) {
		return <Empty description="No thesis data available" />;
	}

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<ThesisHeader />
			<ThesisInfoCard thesis={thesis} />
			<ActionButtons />
		</Space>
	);
}
