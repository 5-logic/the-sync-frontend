'use client';

import { Layout } from 'antd';

import MilestoneManagement from '@/components/features/admin/MilestoneManagement';

const { Content } = Layout;

export default function MilestoneManagementClient() {
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
				<MilestoneManagement />
			</Content>
		</Layout>
	);
}
