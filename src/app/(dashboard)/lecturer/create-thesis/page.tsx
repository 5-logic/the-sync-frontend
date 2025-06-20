'use client';

import { Layout } from 'antd';

import CreateThesis from '@/components/features/lecturer/CreateThesis';

const { Content } = Layout;

export default function LecturerThesisCreatePage() {
	return (
		<Layout style={{ minHeight: '100vh', background: 'transparent' }}>
			<Content style={{ padding: '24px' }}>
				<CreateThesis />
			</Content>
		</Layout>
	);
}
