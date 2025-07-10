'use client';

import { Divider, Row, Space, Typography } from 'antd';

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
			<Title level={3}>Invite Students to Group</Title>

			<StudentSearch />

			<Divider orientation="left">Suggested by AI</Divider>
			<Row gutter={[16, 16]}>
				<StudentSuggestionCard student={mockStudents[0]} />
				<StudentSuggestionCard student={mockStudents[1]} />
				<StudentSuggestionCard student={mockStudents[2]} />
			</Row>

			<Divider orientation="left">All Students</Divider>
			<StudentTable />
		</Space>
	);
}
