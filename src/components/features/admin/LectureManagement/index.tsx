'use client';

import { useState } from 'react';

import { mockLecturers } from '@/data/lecturers';
import { ExtendedLecturer } from '@/types/lecturer';

import LecturerFilterBar from './LecturerFilterBar';
import LecturerTable from './LecturerTable';

export default function LecturerManagement() {
	const [statusFilter, setStatusFilter] = useState<string>('All');
	const [searchText, setSearchText] = useState<string>('');
	const [data, setData] = useState<ExtendedLecturer[]>(mockLecturers);

	const filteredData = data.filter((lecturer) => {
		const matchesStatus =
			statusFilter === 'All' || lecturer.status === statusFilter;
		const matchesSearch = [lecturer.name, lecturer.email].some((field) =>
			(field ?? '').toLowerCase().includes(searchText.toLowerCase()),
		);

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
		console.log('Create new lecturer clicked');
	};

	return (
		<div className="px-4 py-4 sm:px-6 lg:px-8">
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
