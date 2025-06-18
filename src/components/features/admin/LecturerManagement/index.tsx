'use client';

import { Space, Typography } from 'antd';
import { useState } from 'react';

import LecturerFilterBar from '@/components/features/admin/LecturerManagement/LecturerFilterBar';
import LecturerTable from '@/components/features/admin/LecturerManagement/LecturerTable';
import { mockLecturers } from '@/data/lecturers';
import { Lecturer } from '@/schemas/lecturer';

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

	const { Title, Paragraph } = Typography;
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Lecturer Management
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					Create and manage lecturers, registration windows, and
					capstone-specific rules
				</Paragraph>
			</div>

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
		</Space>
	);
}
