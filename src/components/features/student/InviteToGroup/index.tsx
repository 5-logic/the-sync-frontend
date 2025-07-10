'use client';

import { Card, Col, Divider, Row, Space, Typography } from 'antd';

import { StudentSearch } from '@/components/features/student/InviteToGroup/StudentSearch';
import { StudentSuggestionCard } from '@/components/features/student/InviteToGroup/StudentSuggestionCard';
import { StudentTable } from '@/components/features/student/InviteToGroup/StudentTable';
import { mockStudents } from '@/data/student';

const { Title } = Typography;

export default function FormJoinGroupPage() {
	return (
		<Space
			direction="vertical"
			size="large"
			style={{ padding: 24, width: '100%' }}
		>
			{/* thay bằng title common */}
			<Title level={3}>Invite Students to Group</Title>

			<StudentSearch />

			<Card
				style={{
					borderRadius: 8,
					boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
					border: '1px solid #f0f0f0',
				}}
				bodyStyle={{ padding: 24 }}
			>
				<Title level={5} style={{ margin: 0 }}>
					Suggested by AI
				</Title>

				<Divider
					style={{
						marginTop: 12,
						marginBottom: 24,
						borderColor: 'rgba(0,0,0,0.06)',
					}}
				/>

				<Row gutter={[24, 24]} justify="start">
					{mockStudents.slice(0, 3).map((student) => (
						<Col key={student.id} xs={24} sm={12} md={8}>
							<StudentSuggestionCard student={student} />
						</Col>
					))}
				</Row>
			</Card>

			<Card
				style={{
					borderRadius: 8,
					boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
					border: '1px solid #f0f0f0',
				}}
				bodyStyle={{ padding: 24 }}
			>
				<Typography.Title level={5} style={{ margin: 0 }}>
					All Students
				</Typography.Title>

				<Divider
					style={{
						marginTop: 12,
						marginBottom: 24,
						borderColor: 'rgba(0,0,0,0.06)',
					}}
				/>

				<StudentTable />
			</Card>
		</Space>
	);
}
