import { Space, Typography } from 'antd';
import Image from 'next/image';

const { Title, Text } = Typography;

/**
 * 🎨 Login Page Header Component
 * Displays logo, title and description
 */
export default function LoginHeader() {
	return (
		<Space
			direction="vertical"
			size="small"
			align="center"
			style={{ width: '100%' }}
		>
			<Image
				src="/images/thesync-logo.svg"
				alt="TheSync Logo"
				width={150}
				height={150}
			/>
			<Title
				level={1}
				style={{
					fontSize: '30px',
					fontWeight: 800,
					color: '#111827',
					marginTop: '16px',
					marginBottom: 0,
				}}
			>
				TheSync
			</Title>
			<Text
				style={{
					fontSize: '14px',
					color: '#4b5563',
					textAlign: 'center',
					marginTop: '8px',
				}}
			>
				Group Formation and Capstone Thesis Development
			</Text>
		</Space>
	);
}
