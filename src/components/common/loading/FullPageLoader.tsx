'use client';

import { Card, Flex, Space, Spin, Typography } from 'antd';

const { Title, Text } = Typography;

interface FullPageLoaderProps {
	message?: string;
	description?: string;
	type?: 'default' | 'error' | 'warning';
	size?: 'small' | 'default' | 'large';
}

/**
 * Full Page Loader
 * For full screen loading states
 */
export default function FullPageLoader({
	message = 'Loading...',
	description,
	type = 'default',
	size = 'large',
}: FullPageLoaderProps) {
	const getTypeColor = (type: 'default' | 'error' | 'warning') => {
		switch (type) {
			case 'error':
				return 'danger';
			case 'warning':
				return 'warning';
			default:
				return undefined;
		}
	};

	return (
		<Flex
			justify="center"
			align="center"
			vertical
			style={{
				minHeight: '100vh',
				backgroundColor: '#f5f5f5',
				padding: '16px',
			}}
		>
			<Card
				variant="borderless"
				style={{
					textAlign: 'center',
					maxWidth: '400px',
					width: '100%',
				}}
			>
				<Space direction="vertical" size="large">
					<Spin size={size} />
					<Title level={4} type={getTypeColor(type)}>
						{message}
					</Title>
					{description && (
						<Text type="secondary" style={{ opacity: 0.75 }}>
							{description}
						</Text>
					)}
				</Space>
			</Card>
		</Flex>
	);
}
