'use client';

import { Typography } from 'antd';

const { Title, Text } = Typography;

export default function WelcomeHeader() {
	return (
		<>
			<Title
				level={2}
				className="mb-2"
				style={{ textAlign: 'center', fontWeight: 700 }}
			>
				Welcome to TheSync{' '}
				<span
					aria-label="wave"
					style={{
						fontSize: 36,
						lineHeight: 1,
						display: 'inline-block',
						verticalAlign: 'middle',
						marginLeft: 4,
					}}
				>
					👋
				</span>
			</Title>
			<Text
				type="secondary"
				className="block text-center mb-8"
				style={{
					fontSize: 20,
				}}
			>
				Before registering for a thesis, please form or join a project group.
			</Text>
		</>
	);
}
