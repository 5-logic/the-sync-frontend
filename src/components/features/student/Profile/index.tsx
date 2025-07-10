'use client';

import { Typography } from 'antd';

import StudentProfileLayout from './StudentProfileLayout';
import StudentProfileSections from './StudentProfileSections';

export default function StudentProfilePage() {
	return (
		<div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
			<Typography.Title level={2}>Student Profile</Typography.Title>
			<StudentProfileLayout />
			<StudentProfileSections />
		</div>
	);
}
