'use client';

import { Layout } from 'antd';

import LecturerManagement from '@/components/features/admin/LectureManagement';

const { Content } = Layout;

export default function LecturerManagementClient() {
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
				<LecturerManagement />
			</Content>
		</Layout>
	);
}
