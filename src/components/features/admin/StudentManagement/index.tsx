'use client';

import { Card, Typography } from 'antd';
import { useState } from 'react';

import StudentFilterBar from '@/components/features/admin/StudentManagement/StudentFilterBar';
import StudentTable from '@/components/features/admin/StudentManagement/StudentTable';
import { mockStudents } from '@/data/student';
import { Student } from '@/schemas/student';

export default function StudentManagement() {
	const [statusFilter, setStatusFilter] = useState('All');
	const [majorFilter, setMajorFilter] = useState('All');
	const [searchText, setSearchText] = useState('');
	const [data] = useState<Student[]>(mockStudents);

	const filteredData = data.filter((student) => {
		const matchesStatus =
			statusFilter === 'All' ||
			student.isActive === (statusFilter === 'Active');

		const matchesMajor =
			majorFilter === 'All' || student.majorId === majorFilter;

		const matchesSearch = [
			student.fullName,
			student.email,
			student.studentId,
		].some((field) =>
			(field ?? '').toLowerCase().includes(searchText.toLowerCase()),
		);

		return matchesStatus && matchesMajor && matchesSearch;
	});

	const { Title } = Typography;
	return (
		<Card bordered={false} style={{ padding: 0 }}>
			<Title level={2}>Student Management</Title>

			<StudentFilterBar
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				majorFilter={majorFilter}
				setMajorFilter={setMajorFilter}
				searchText={searchText}
				setSearchText={setSearchText}
				onCreateStudent={function (): void {
					throw new Error('Function not implemented.');
				}}
			/>

			<StudentTable data={filteredData} />
		</Card>
	);
}
