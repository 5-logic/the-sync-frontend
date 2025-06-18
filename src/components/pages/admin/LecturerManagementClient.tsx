'use client';

import { Layout } from 'antd';
import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

// Lazy load the component
const LecturerManagement = lazy(
	() => import('@/components/features/admin/LecturerManagement'),
);

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
				<Suspense fallback={<TableLoadingSkeleton />}>
					<LecturerManagement />
				</Suspense>
			</Content>
		</Layout>
	);
}
