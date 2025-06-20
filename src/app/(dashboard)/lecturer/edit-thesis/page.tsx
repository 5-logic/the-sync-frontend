'use client';

import { Layout } from 'antd';

import EditThesis from '@/components/features/lecturer/EditThesis';

const { Content } = Layout;

export default function LecturerThesisEditPage() {
	return (
		<Layout style={{ minHeight: '100vh', background: 'transparent' }}>
			<Content style={{ padding: '24px' }}>
				<EditThesis />
			</Content>
		</Layout>
	);
}
