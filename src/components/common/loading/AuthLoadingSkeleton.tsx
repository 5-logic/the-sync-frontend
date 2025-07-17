'use client';

import { Card, Skeleton, Space } from 'antd';

/**
 * Auth Loading Skeleton
 * Minimal skeleton for authentication loading states
 */
export default function AuthLoadingSkeleton() {
	return (
		<div className="flex justify-center items-center min-h-[200px]">
			<Card
				variant="borderless"
				style={{
					textAlign: 'center',
					maxWidth: '400px',
					width: '100%',
				}}
			>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Skeleton.Avatar active size="large" />
					<Skeleton active paragraph={{ rows: 2 }} title={false} />
					<Skeleton.Button active size="default" style={{ width: '120px' }} />
				</Space>
			</Card>
		</div>
	);
}
