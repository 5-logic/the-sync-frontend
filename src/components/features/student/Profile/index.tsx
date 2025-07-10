'use client';

import { Button, Row, Space, Typography } from 'antd';

import StudentProfileLayout from '@/components/features/student/Profile/StudentProfileLayout';
import StudentProfileSections from '@/components/features/student/Profile/StudentProfileSections';

export default function StudentProfilePage() {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Typography.Title level={2}>Student Profile</Typography.Title>

			<StudentProfileLayout />
			<StudentProfileSections />

			{/* Action Buttons */}
			<Row justify="end" style={{ marginTop: 10 }}>
				<Space>
					<Button>Back</Button>
					<Button type="primary">Edit</Button>
				</Space>
			</Row>
		</Space>
	);
}
