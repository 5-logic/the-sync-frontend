'use client';

import { Space, Typography } from 'antd';
import { useState } from 'react';

import ThesisFilterBar from '@/components/features/lecturer/ThesisManagement/ThesisFilterBar';
import ThesisTable from '@/components/features/lecturer/ThesisManagement/ThesisTable';
import mockGroups from '@/data/group';
import mockTheses from '@/data/thesis';

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

	const { Title, Paragraph } = Typography;
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Thesis Management
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					Create and manage Thesis, registration windows, and capstone-specific
					rules
				</Paragraph>
			</div>

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
		</Space>
	);
}
