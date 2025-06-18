'use client';

import { Card, Skeleton, Space } from 'antd';

/**
 * Table Loading Skeleton
 */
export default function TableLoadingSkeleton() {
	return (
		<Card variant="borderless">
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Skeleton.Input active size="large" style={{ width: '300px' }} />
				<Skeleton active paragraph={{ rows: 8 }} />
			</Space>
		</Card>
	);
}
