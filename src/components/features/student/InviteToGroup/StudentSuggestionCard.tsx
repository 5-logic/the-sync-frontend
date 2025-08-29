'use client';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Typography } from 'antd';
import React from 'react';

import {
	ResponsibilityData,
	ResponsibilityRadarChart,
} from '@/components/common/radar-chart';
import { Student } from '@/schemas/student';

const { Paragraph } = Typography;

export const StudentSuggestionCard: React.FC<{ student: Student }> = ({
	student,
}) => {
	// Ép kiểu tạm thời để truy cập studentResponsibilities
	const s = student as Student & {
		studentResponsibilities: {
			responsibilityId: string;
			name: string;
		}[];
	};

	let majorName = s.majorId;
	if (s.majorId === 'SE') {
		majorName = 'Software Engineering';
	} else if (s.majorId === 'AI') {
		majorName = 'Artificial Intelligence';
	}

	// Convert studentResponsibilities to ResponsibilityData format
	const responsibilityData: ResponsibilityData[] =
		s.studentResponsibilities.map((resp) => ({
			responsibilityId: resp.responsibilityId,
			responsibilityName: resp.name,
			level: 0, // Default level since we don't have level data in this interface
		}));

	return (
		<Card
			hoverable
			style={{ width: '100%', textAlign: 'center' }}
			bodyStyle={{ paddingTop: 16, paddingBottom: 16 }}
		>
			<Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 12 }} />

			<Typography.Title level={5} style={{ marginBottom: 4 }}>
				{s.fullName}
			</Typography.Title>

			<Paragraph type="secondary" style={{ marginBottom: 8 }}>
				{majorName}
			</Paragraph>

			{/* Responsibilities Radar Chart */}
			{responsibilityData.length > 0 ? (
				<div style={{ marginBottom: 16 }}>
					<Paragraph
						style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}
					>
						Responsibilities:
					</Paragraph>
					<ResponsibilityRadarChart
						data={responsibilityData}
						height={200}
						loading={false}
					/>
				</div>
			) : (
				<Paragraph style={{ marginBottom: 8 }}>
					No responsibilities specified
				</Paragraph>
			)}

			<Button type="primary" block>
				Invite
			</Button>
		</Card>
	);
};
