'use client';

import { Card, Flex, Skeleton, SkeletonProps, Spin, SpinProps } from 'antd';

interface PageLoadingProps {
	type?: 'skeleton' | 'spinner';
	size?: 'small' | 'default' | 'large';
	rows?: number;
	tip?: string;
}

/**
 * Universal Loading Component
 * Provides consistent loading states across the application
 */
export default function PageLoading({
	type = 'skeleton',
	size = 'default',
	rows = 6,
	tip = 'Loading...',
}: PageLoadingProps) {
	const skeletonProps: SkeletonProps = {
		active: true,
		paragraph: { rows },
		avatar: false,
		title: true,
	};

	const spinProps: SpinProps = {
		size,
		tip,
		style: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			minHeight: '200px',
			width: '100%',
		},
	};

	if (type === 'spinner') {
		return (
			<Flex justify="center" align="center" style={{ padding: '24px' }}>
				<Spin {...spinProps} />
			</Flex>
		);
	}

	return (
		<Card variant="borderless" style={{ padding: '24px' }}>
			<Skeleton {...skeletonProps} />
		</Card>
	);
}
