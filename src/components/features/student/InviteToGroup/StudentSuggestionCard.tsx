'use client';

import { UserOutlined } from '@ant-design/icons';
import { Button, Card, Space, Tag } from 'antd';
import React from 'react';

interface StudentSuggestionProps {
	name: string;
	major: string;
	roles: string[];
	skills: string[];
}

export const StudentSuggestionCard: React.FC<StudentSuggestionProps> = ({
	name,
	major,
	roles,
	skills,
}) => {
	return (
		<Card style={{ width: 300 }}>
			<Card.Meta
				avatar={<UserOutlined style={{ fontSize: 40 }} />}
				title={name}
				description={major}
			/>
			<div style={{ marginTop: 12 }}>
				<p style={{ marginBottom: 8 }}>Roles: {roles.join(', ')}</p>
				<Space wrap>
					{skills.map((skill) => (
						<Tag color="blue" key={skill}>
							{skill}
						</Tag>
					))}
				</Space>
			</div>
			<Button type="primary" block style={{ marginTop: 12 }}>
				Invite
			</Button>
		</Card>
	);
};
