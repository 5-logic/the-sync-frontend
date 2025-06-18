'use client';

import { Layout } from 'antd';

import StudentManagement from '@/components/features/admin/StudentManagement';

const { Content } = Layout;

export default function StudentManagementClient() {
	return (
		<Layout style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
			<Content
				style={{
					maxWidth: '1152px',
					margin: '0 auto',
					padding: '24px 16px',
					width: '100%',
				}}
			>
				<StudentManagement />
			</Content>
		</Layout>
	);
}
