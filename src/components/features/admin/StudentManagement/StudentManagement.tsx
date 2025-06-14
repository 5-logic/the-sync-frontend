'use client';

import { useState } from 'react';

import StudentFilterBar from './StudentFilterBar';
import StudentTable from './StudentTable';

export interface Student {
	key: string;
	name: string;
	email: string;
	studentID: string;
	major: string;
	gender: 'Male' | 'Female';
	status: 'Active' | 'Inactive';
}

const initialData: Student[] = [
	{
		key: '1',
		name: 'Alice Nguyen',
		email: 'alice.nguyen@student.edu',
		studentID: 'ST0001',
		major: 'SE',
		gender: 'Female',
		status: 'Active',
	},
	{
		key: '2',
		name: 'Bob Tran',
		email: 'bob.tran@student.edu',
		studentID: 'ST0002',
		major: 'AI',
		gender: 'Male',
		status: 'Inactive',
	},
];

export default function StudentManagement() {
	const [statusFilter, setStatusFilter] = useState('All');
	const [majorFilter, setMajorFilter] = useState('All');
	const [searchText, setSearchText] = useState('');
	const [data] = useState<Student[]>(initialData);

	const filteredData = data.filter((student) => {
		const matchesStatus =
			statusFilter === 'All' || student.status === statusFilter;

		const matchesMajor = majorFilter === 'All' || student.major === majorFilter;

		const matchesSearch =
			(student.name ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
			(student.email ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
			(student.studentID ?? '')
				.toLowerCase()
				.includes(searchText.toLowerCase());

		return matchesStatus && matchesMajor && matchesSearch;
	});

	return (
		<div className="px-4 py-4 sm:px-6 lg:px-8">
			<h2 className="text-2xl font-semibold mb-6">Student Management</h2>

			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 flex-wrap">
				<StudentFilterBar
					statusFilter={statusFilter}
					setStatusFilter={setStatusFilter}
					majorFilter={majorFilter}
					setMajorFilter={setMajorFilter}
					searchText={searchText}
					setSearchText={setSearchText}
				/>
			</div>

			<StudentTable data={filteredData} />
		</div>
	);
}
