'use client';

import { Empty, Space } from 'antd';

import { Header } from '@/components/common/Header';
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
