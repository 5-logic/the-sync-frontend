import { Card, List, Space, Tag, Typography } from 'antd';

import studentProfile from '@/data/studentProfile';

const { Title, Text, Link } = Typography;

export default function StudentProfileSections() {
	const data = studentProfile;

	return (
		<Space
			direction="vertical"
			size={24}
			style={{ width: '100%', marginTop: 24 }}
		>
			{/* Skills */}
			<Card title="Skills">
				<Space wrap>
					{data.skills.map((skill) => (
						<Tag key={skill} color="blue">
							{skill}
						</Tag>
					))}
				</Space>
			</Card>

			{/* Academic Interests */}
			<Card title="Academic Interests">
				<List
					dataSource={data.academicInterests}
					renderItem={(item) => <List.Item>{item}</List.Item>}
					size="small"
				/>
			</Card>

			{/* Group Info */}
			<Card title="Group Membership">
				<Space direction="vertical">
					<Title level={5} style={{ margin: 0 }}>
						{data.group.name}
					</Title>
					<Text type="secondary">Role: {data.group.role}</Text>
					<Link href="#">View Group Details</Link>
				</Space>
			</Card>
		</Space>
	);
}
