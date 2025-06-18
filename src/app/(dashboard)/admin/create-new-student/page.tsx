'use client';

import { Layout } from 'antd';

import CreateNewStudent from '@/components/features/admin/CreateNewUser/CreateNewStudent';

const { Content } = Layout;

export default function AdminCreateNewStudentPage() {
	return (
		<Layout style={{ minHeight: '100vh', background: 'transparent' }}>
			<Content style={{ padding: '24px' }}>
				<CreateNewStudent />
			</Content>
		</Layout>
	);
}
