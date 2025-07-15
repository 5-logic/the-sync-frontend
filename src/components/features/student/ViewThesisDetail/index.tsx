'use client';

import { Empty, Space } from 'antd';

import { Header } from '@/components/common/Header';
import ActionButtons from '@/components/features/student/ViewThesisDetail/ActionButtons';
import ThesisInfoCard from '@/components/features/student/ViewThesisDetail/ThesisInfoCard';
import { mockTheses } from '@/data/thesis';

export default function StudentThesisDetailPage() {
	const thesis = mockTheses?.[0];

	if (!thesis) {
		return <Empty description="No thesis data available" />;
	}

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Thesis Detail"
				description="View comprehensive thesis information, supervisor details, and manage
							approval status."
			/>
			<ThesisInfoCard thesis={thesis} />
			<ActionButtons />
		</Space>
	);
}
