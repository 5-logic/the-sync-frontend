'use client';

import { Col, Divider, Row, Space, Typography } from 'antd';

import { StudentSearchBar } from '@/components/features/student/InviteToGroup/StudentSearch';
import { StudentSuggestionCard } from '@/components/features/student/InviteToGroup/StudentSuggestionCard';
import { StudentTable } from '@/components/features/student/InviteToGroup/StudentTable';

const { Title } = Typography;

export default function FormJoinGroupPage() {
	return (
		<Space
			direction="vertical"
			size="large"
			style={{ padding: 24, width: '100%' }}
		>
			<Title level={3}>Invite Students to Group</Title>

			<StudentSearchBar />

			<Divider orientation="left">Suggested by AI</Divider>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8}>
					<StudentSuggestionCard
						name="Emma Thompson"
						major="Software Engineering"
						roles={['Researcher', 'Developer']}
						skills={['React', 'Node.js', 'Python']}
					/>
				</Col>
				<Col xs={24} sm={12} md={8}>
					<StudentSuggestionCard
						name="Michael Chen"
						major="Artificial Intelligence"
						roles={['Researcher', 'Developer']}
						skills={['Machine Learning', 'Python', 'TensorFlow']}
					/>
				</Col>
				<Col xs={24} sm={12} md={8}>
					<StudentSuggestionCard
						name="Sarah Johnson"
						major="Data Science"
						roles={['Researcher', 'Developer']}
						skills={['Data Analysis', 'R', 'SQL']}
					/>
				</Col>
			</Row>

			<Divider orientation="left">All Students</Divider>
			<StudentTable />
		</Space>
	);
}
