'use client';

import { Card, Spin } from 'antd';

import { useNavigationContext } from '@/components/common/NavigationLoader';

interface ContentLoaderProps {
	readonly children: React.ReactNode;
}

/**
 * Content Loader Component
 * Shows loading overlay for content area during navigation
 */
export default function ContentLoader({ children }: ContentLoaderProps) {
	const context = useNavigationContext();
	const isNavigating = context?.isNavigating ?? false;

	return (
		<Spin
			spinning={isNavigating}
			tip="Loading page..."
			size="large"
			style={{
				maxHeight: 'none',
			}}
		>
			<Card
				variant="borderless"
				style={{
					minHeight: isNavigating ? '200px' : 'auto',
					transition: 'min-height 0.2s ease, opacity 0.2s ease',
					opacity: isNavigating ? 0.6 : 1,
				}}
			>
				{children}
			</Card>
		</Spin>
	);
}
