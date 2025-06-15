'use client';

import { useState } from 'react';

import { mockStudents } from '@/data/student';
import { Student } from '@/types/student';

import StudentFilterBar from './StudentFilterBar';
import StudentTable from './StudentTable';

export default function StudentManagement() {
	const [statusFilter, setStatusFilter] = useState('All');
	const [majorFilter, setMajorFilter] = useState('All');
	const [searchText, setSearchText] = useState('');
	const [data] = useState<Student[]>(mockStudents);

	const filteredData = data.filter((student) => {
		const matchesStatus =
			statusFilter === 'All' || student.status === statusFilter;

		const matchesMajor = majorFilter === 'All' || student.major === majorFilter;

		const matchesSearch = [student.name, student.email, student.studentID].some(
			(field) => (field ?? '').toLowerCase().includes(searchText.toLowerCase()),
		);

		return matchesStatus && matchesMajor && matchesSearch;
	});

	return (
		<div className="px-4 py-4 sm:px-6 lg:px-8">
			<h2 className="text-2xl font-semibold mb-6">Student Management</h2>
			<StudentFilterBar
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				majorFilter={majorFilter}
				setMajorFilter={setMajorFilter}
				searchText={searchText}
				setSearchText={setSearchText}
			/>
			<StudentTable data={filteredData} />
		</div>
	);
}
