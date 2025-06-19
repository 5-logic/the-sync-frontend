'use client';

import { Card } from 'antd';
import { useState } from 'react';

import mockTheses from '@/data/thesis';
import { Group } from '@/schemas/group';

import ThesisFilterBar from './ThesisFilterBar';
import ThesisTable from './ThesisTable';

function getSemesterLabel(id: string) {
	const year = id.slice(0, 4);
	const term = id.slice(4);
	const termName =
		{ '1': 'Spring', '2': 'Summer', '3': 'Fall' }[term] || 'Unknown';
	return `${termName} ${year}`;
}

export default function ThesisManagement() {
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<
		'all' | 'approved' | 'pending' | 'rejected'
	>('all');
	const [semester, setSemester] = useState<string | undefined>();

	const mockGroups: Group[] = [
		{
			id: 'g1',
			code: 'G1',
			name: 'Group 1',
			semesterId: '20251',
			thesisId: 't1',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: 'g2',
			code: 'G2',
			name: 'Group 2',
			semesterId: '20242',
			thesisId: 't2',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: 'g3',
			code: 'G3',
			name: 'Group 3',
			semesterId: '20252',
			thesisId: 't3',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	const data = mockTheses
		.map((t) => {
			const group = mockGroups.find((g) => g.thesisId === t.id);
			return {
				...t,
				semesterId: group?.semesterId,
				semesterLabel: group?.semesterId
					? getSemesterLabel(group.semesterId)
					: 'N/A',
			};
		})
		.filter(
			(t) =>
				(status === 'all' || t.status.toLowerCase() === status) &&
				(!semester || t.semesterId === semester) &&
				t.englishName.toLowerCase().includes(search.toLowerCase()),
		);

	const semesterOptions = mockGroups
		.map((g) => g.semesterId)
		.filter((v, i, a) => a.indexOf(v) === i);

	return (
		<Card>
			<ThesisFilterBar
				search={search}
				onSearchChange={setSearch}
				status={status}
				onStatusChange={setStatus}
				semester={semester}
				onSemesterChange={setSemester}
				semesterOptions={semesterOptions}
			/>
			<ThesisTable data={data} />
		</Card>
	);
}
