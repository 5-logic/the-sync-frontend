'use client';

import { Layout } from 'antd';
import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const StudentAccountSettingContainer = lazy(
	() => import('@/components/features/student/AccountSetting'),
);

const { Content } = Layout;

export default function AccountSettingClient() {
	return (
		<Layout style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
			<Content>
				<Suspense fallback={<TableLoadingSkeleton />}>
					<StudentAccountSettingContainer />
				</Suspense>
			</Content>
		</Layout>
	);
}
