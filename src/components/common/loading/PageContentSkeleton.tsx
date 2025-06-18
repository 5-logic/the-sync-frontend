'use client';

import { Card, Skeleton, Space } from 'antd';

/**
 * Page Content Skeleton for forms and content pages
 */
export default function PageContentSkeleton() {
	return (
		<Card variant="borderless">
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Skeleton active paragraph={{ rows: 3 }} />
				<Skeleton active paragraph={{ rows: 5 }} />
				<Skeleton active paragraph={{ rows: 4 }} />
			</Space>
		</Card>
	);
}
