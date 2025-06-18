'use client';

import { Layout } from 'antd';

import CreateNewLecturer from '@/components/features/admin/CreateNewUser/CreateNewLecturer';

const { Content } = Layout;

export default function CreateNewLecturerPage() {
	return (
		<Layout style={{ minHeight: '100vh', background: 'transparent' }}>
			<Content style={{ padding: '24px' }}>
				<CreateNewLecturer />
			</Content>
		</Layout>
	);
}
