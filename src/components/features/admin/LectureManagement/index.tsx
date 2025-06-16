'use client';

import { Typography } from 'antd';
import { useState } from 'react';

import { mockLecturers } from '@/data/lecturers';
import { Lecturer } from '@/schemas/lecturer';

import LecturerFilterBar from './LecturerFilterBar';
import LecturerTable from './LecturerTable';

export default function LecturerManagement() {
	const [statusFilter, setStatusFilter] = useState<
		'all' | 'active' | 'inactive'
	>('all');
	const [searchText, setSearchText] = useState<string>('');
	const [data, setData] =
		useState<(Lecturer & { instructionGroups: string })[]>(mockLecturers);
	const filteredData = data.filter((lecturer) => {
		const matchesStatus =
			statusFilter === 'all' ||
			(statusFilter === 'active' && lecturer.isActive) ||
			(statusFilter === 'inactive' && !lecturer.isActive);

		const matchesSearch = [lecturer.fullName, lecturer.email].some((field) =>
			(field ?? '').toLowerCase().includes(searchText.toLowerCase()),
		);

		return matchesStatus && matchesSearch;
	});

	const handleTogglePermission = (id: string) => {
		setData((prev) =>
			prev.map((item) =>
				item.id === id ? { ...item, isModerator: !item.isModerator } : item,
			),
		);
	};

	const handleCreateLecturer = () => {
		console.log('Create new lecturer clicked');
	};

	const { Title } = Typography;
	return (
		<div className="px-4 py-4 sm:px-6 lg:px-8">
			<Title level={2}>Lecturer Management</Title>

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
