'use client';

import { useState } from 'react';

import { mockThesisData } from '@/data/thesis';
import { Thesis } from '@/schemas/thesis';

import ThesisFilterBar from './ThesisFilterBar';
import ThesisTable from './ThesisTable';

export default function ThesisManagement() {
	const [data] = useState<Thesis[]>(mockThesisData);

	const [searchText, setSearchText] = useState('');
	const [statusFilter, setStatusFilter] = useState<
		'all' | 'approved' | 'rejected' | 'pending'
	>('all');
	const [selectedSemester, setSelectedSemester] = useState<string>('all');

	const filteredData = data.filter((thesis) => {
		const matchesSearch =
			searchText === '' ||
			thesis.englishName.toLowerCase().includes(searchText.toLowerCase());

		const matchesStatus =
			statusFilter === 'all' || thesis.status.toLowerCase() === statusFilter;

		// Giả sử bạn có semesterId trong thesis hoặc dùng tên semester nếu cần
		const matchesSemester =
			selectedSemester === 'all' || thesis.semesterId === selectedSemester;

		return matchesSearch && matchesStatus && matchesSemester;
	});

	return (
		<div className="px-4 py-4 sm:px-6 lg:px-8">
			<h2 className="text-2xl font-semibold mb-6">Thesis Management</h2>

			<ThesisFilterBar
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				searchText={searchText}
				setSearchText={setSearchText}
				selectedSemester={selectedSemester}
				setSelectedSemester={setSelectedSemester}
				onCreateThesis={() => {
					console.log('Create new thesis');
				}}
			/>

			<ThesisTable data={filteredData} />
		</div>
	);
}
