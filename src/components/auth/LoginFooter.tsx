import { Typography } from 'antd';

const { Text } = Typography;

/**
 * 📄 Login Page Footer Component
 * Displays copyright information
 */
export default function LoginFooter() {
	return (
		<div style={{ textAlign: 'center', marginTop: '24px' }}>
			<Text style={{ fontSize: '12px', color: '#6b7280' }}>
				© 2025 TheSync - Five Logic. All rights reserved.
			</Text>
		</div>
	);
}
