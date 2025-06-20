'use client';

import { Layout } from 'antd';

import ViewThesisDetail from '@/components/features/lecturer/ViewThesisDetail';

const { Content } = Layout;

export default function LecturerViewTopicDetailPage() {
	return (
		<Layout style={{ minHeight: '100vh', background: 'transparent' }}>
			<Content style={{ padding: '24px' }}>
				<ViewThesisDetail />
			</Content>
		</Layout>
	);
}
