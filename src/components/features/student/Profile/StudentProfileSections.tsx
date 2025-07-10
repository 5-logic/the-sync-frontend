import { Button, Card, List, Space, Tag, Typography } from 'antd';

import studentProfile from '@/data/studentProfile';

const { Title, Text, Link } = Typography;

export default function StudentProfileSections() {
	const data = studentProfile;
	const hasGroup = !!data.group;

	return (
		<Space
			direction="vertical"
			size={24}
			style={{ width: '100%', marginTop: 4 }}
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

			{/* Group Membership Card (only if group exists) */}
			{hasGroup && (
				<Card title="Group Membership">
					<Space direction="vertical">
						<Title level={5} style={{ margin: 0 }}>
							{data.group.name}
						</Title>
						<Text type="secondary">Role: {data.group.role}</Text>
						<Link href="#">View Group Details</Link>
					</Space>
				</Card>
			)}

			{/* Invite To Group button outside Group Membership card, only if no group */}
			{!hasGroup && (
				<div style={{ textAlign: 'right' }}>
					<Button
						type="primary"
						onClick={() => {
							// Xử lý invite nhóm ở đây
							console.log('Invite to Group clicked');
						}}
					>
						Invite to Group
					</Button>
				</div>
			)}
		</Space>
	);
}
