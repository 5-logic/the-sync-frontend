import { Card, List, Typography } from 'antd';

import studentProfile from '@/data/studentProfile';

const { Title, Text } = Typography;

export default function StudentProfileSections() {
	const data = studentProfile;

	return (
		<div className="space-y-4 mt-6">
			{/* Academic Interests */}
			<Card title="Academic Interests">
				<List
					dataSource={data.academicInterests}
					renderItem={(item) => <List.Item>{item}</List.Item>}
				/>
			</Card>

			{/* Group Info */}
			<Card title="Group Membership">
				<Title level={5}>{data.group.name}</Title>
				<Text type="secondary">Role: {data.group.role}</Text>
				<div>
					<a href="#" style={{ color: '#1890ff' }}>
						View Group Details
					</a>
				</div>
			</Card>
		</div>
	);
}
