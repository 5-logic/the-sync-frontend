'use client';

import { Space } from 'antd';

import { Header } from '@/components/common/Header';
import StudentProfileLayout from '@/components/features/student/Profile/StudentProfileLayout';
import StudentProfileSections from '@/components/features/student/Profile/StudentProfileSections';

export default function StudentProfilePage() {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Student Profile"
				description="Easily view and update student information including contact details, enrollment history, and performance stats"
			/>
			<StudentProfileLayout />
			<StudentProfileSections />
		</Space>
	);
}
