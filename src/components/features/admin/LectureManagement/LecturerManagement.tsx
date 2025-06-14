'use client';

import { useState } from 'react';

import LecturerFilterBar from './LecturerFilterBar';
import LecturerTable from './LecturerTable';

export interface Lecturer {
	key: string;
	name: string;
	email: string;
	phoneNumber: string;
	instructionGroups: string;
	status: 'Active' | 'Inactive';
	specialPermission: boolean;
}

const initialData: Lecturer[] = [
	{
		key: '1',
		name: 'John Brown',
		email: 'john.brown@university.edu',
		phoneNumber: '0333333333',
		instructionGroups: '03',
		status: 'Active',
		specialPermission: true,
	},
	{
		key: '2',
		name: 'Sarah Wilson',
		email: 'sarah.wilson@university.edu',
		phoneNumber: '0444444444',
		instructionGroups: '03',
		status: 'Active',
		specialPermission: false,
	},
	{
		key: '3',
		name: 'Michael Chen',
		email: 'michael.chen@university.edu',
		phoneNumber: '0555555555',
		instructionGroups: '03',
		status: 'Active',
		specialPermission: false,
	},
	{
		key: '4',
		name: 'Emily Davis',
		email: 'emily.davis@university.edu',
		phoneNumber: '0666666666',
		instructionGroups: '03',
		status: 'Inactive',
		specialPermission: false,
	},
	{
		key: '5',
		name: 'David Lee',
		email: 'david.lee@university.edu',
		phoneNumber: '0888888888',
		instructionGroups: '03',
		status: 'Active',
		specialPermission: false,
	},
];

export default function LecturerManagement() {
	const [statusFilter, setStatusFilter] = useState<string>('All');
	const [searchText, setSearchText] = useState<string>('');
	const [data, setData] = useState<Lecturer[]>(initialData);

	const filteredData = data.filter((lecturer) => {
		const matchesStatus =
			statusFilter === 'All' || lecturer.status === statusFilter;
		const matchesSearch =
			lecturer.name.toLowerCase().includes(searchText.toLowerCase()) ||
			lecturer.email.toLowerCase().includes(searchText.toLowerCase());
		return matchesStatus && matchesSearch;
	});

	const handleTogglePermission = (key: string) => {
		setData((prev) =>
			prev.map((item) =>
				item.key === key
					? { ...item, specialPermission: !item.specialPermission }
					: item,
			),
		);
	};

	const handleCreateLecturer = () => {
		// Future logic: navigate to create form or open modal
		console.log('Create new lecturer clicked');
	};

	return (
		<div className="p-6">
			<h2 className="text-2xl font-semibold mb-6">Lecturer Management</h2>

			<LecturerFilterBar
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				searchText={searchText}
				setSearchText={setSearchText}
				onCreateLecturer={handleCreateLecturer}
			/>

			<LecturerTable
				data={filteredData}
				onTogglePermission={handleTogglePermission}
			/>
		</div>
	);
}
