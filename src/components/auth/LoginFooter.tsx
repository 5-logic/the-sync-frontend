import { Flex, Typography } from 'antd';

const { Text } = Typography;

/**
 * 📄 Login Page Footer Component
 * Displays copyright information
 */
export default function LoginFooter() {
	return (
		<Flex justify="center" style={{ marginTop: '24px' }}>
			<Text style={{ fontSize: '12px', color: '#6b7280' }}>
				© {new Date().getFullYear()} TheSync - Five Logic. All rights reserved.
			</Text>
		</Flex>
	);
}
