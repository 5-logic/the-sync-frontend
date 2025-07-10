'use client';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Space, Tag, Typography } from 'antd';
import React from 'react';

import { Student } from '@/schemas/student';

const { Paragraph } = Typography;

export const StudentSuggestionCard: React.FC<{ student: Student }> = ({
	student,
}) => {
	// Ép kiểu tạm thời để truy cập studentSkills và studentExpectedResponsibilities
	const s = student as Student & {
		studentSkills: { skillId: string; name: string; level: string }[];
		studentExpectedResponsibilities: {
			responsibilityId: string;
			name: string;
		}[];
	};

	return (
		<Card
			style={{ width: 300, textAlign: 'center' }}
			bodyStyle={{ paddingTop: 16, paddingBottom: 16 }}
		>
			<Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 12 }} />

			<Typography.Title level={5} style={{ marginBottom: 4 }}>
				{s.fullName}
			</Typography.Title>

			<Paragraph type="secondary" style={{ marginBottom: 8 }}>
				{s.majorId === 'SE'
					? 'Software Engineering'
					: s.majorId === 'AI'
						? 'Artificial Intelligence'
						: s.majorId}
			</Paragraph>

			<Paragraph style={{ marginBottom: 8 }}>
				Roles: {s.studentExpectedResponsibilities.map((r) => r.name).join(', ')}
			</Paragraph>

			<Space wrap style={{ marginBottom: 12 }}>
				{s.studentSkills.map((skill) => (
					<Tag color="blue" key={skill.skillId}>
						{skill.name}
					</Tag>
				))}
			</Space>

			<Button type="primary" block>
				Invite
			</Button>
		</Card>
	);
};
