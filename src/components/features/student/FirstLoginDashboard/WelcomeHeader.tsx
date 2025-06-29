'use client';

import { Typography } from 'antd';

const { Title, Text } = Typography;

export default function WelcomeHeader() {
	return (
		<>
			<Title level={2} style={{ marginBottom: 8 }}>
				Welcome to TheSync{' '}
				<span
					role="img"
					aria-label="wave"
					style={{
						fontSize: 24,
						verticalAlign: 'middle',
						display: 'inline-block',
					}}
				>
					👋
				</span>
			</Title>
			<Text type="secondary" style={{ fontSize: 16 }}>
				Before registering for a thesis, please form or join a project group.
			</Text>
		</>
	);
}
