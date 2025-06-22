'use client';

import { Layout } from 'antd';
import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const ThesisManagement = lazy(
	() => import('@/components/features/lecturer/ThesisManagement'),
);

const { Content } = Layout;

export default function ThesisManagementClient() {
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
					<ThesisManagement />
				</Suspense>
			</Content>
		</Layout>
	);
}
