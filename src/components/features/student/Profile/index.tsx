'use client';

import { Row, Typography } from 'antd';

import StudentProfileLayout from './StudentProfileLayout';
import StudentProfileSections from './StudentProfileSections';

export default function StudentProfilePage() {
	return (
		<Row justify="center">
			<Col xs={24} sm={22} md={20} lg={18} xl={16} style={{ padding: 24 }}>
				<Typography.Title level={2}>Student Profile</Typography.Title>
				<StudentProfileLayout />
				<StudentProfileSections />
			</Col>
		</Row>
	);
}
