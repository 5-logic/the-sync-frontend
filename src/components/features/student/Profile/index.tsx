'use client';

import { Button, Col, Row, Space, Typography } from 'antd';

import StudentProfileLayout from '@/components/features/student/Profile/StudentProfileLayout';
import StudentProfileSections from '@/components/features/student/Profile/StudentProfileSections';

export default function StudentProfilePage() {
	return (
		<Row justify="center">
			<Col style={{ padding: 24 }}>
				<Typography.Title level={2}>Student Profile</Typography.Title>

				<StudentProfileLayout />
				<StudentProfileSections />

				{/* Action Buttons */}
				<Row justify="end" style={{ marginTop: 32 }}>
					<Space>
						<Button>Back</Button>
						<Button type="primary">Edit</Button>
					</Space>
				</Row>
			</Col>
		</Row>
	);
}
