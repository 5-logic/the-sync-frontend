'use client';

import { Card, Space, Tag, Typography } from 'antd';

const { Title } = Typography;

export default function ProjectMilestones() {
	return (
		<Card>
			<Title level={5}>Project Milestones</Title>
			<Space size="large">
				<Space>
					<Tag
						color="#52c41a"
						style={{ borderRadius: '50%', width: 12, height: 12, padding: 0 }}
					/>
					<span>Completed</span>
				</Space>
				<Space>
					<Tag
						color="#1890ff"
						style={{ borderRadius: '50%', width: 12, height: 12, padding: 0 }}
					/>
					<span>In Progress</span>
				</Space>
				<Space>
					<Tag
						color="#d9d9d9"
						style={{ borderRadius: '50%', width: 12, height: 12, padding: 0 }}
					/>
					<span>Upcoming</span>
				</Space>
			</Space>
		</Card>
	);
}
