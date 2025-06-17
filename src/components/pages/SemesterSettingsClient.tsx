'use client';

import { Layout } from 'antd';

import SemesterSettings from '@/components/features/admin/SemesterSetting/SemesterSettings';

const { Content } = Layout;

export default function SemesterSettingsClient() {
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
				<SemesterSettings />
			</Content>
		</Layout>
	);
}
