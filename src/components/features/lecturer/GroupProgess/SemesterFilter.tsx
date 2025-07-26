'use client';

import { Select } from 'antd';
import { useEffect } from 'react';

import { Semester } from '@/schemas/semester';
import { useSemesterStore } from '@/store/useSemesterStore';

const { Option } = Select;

interface Props {
	selectedSemester: string | null;
	onSemesterChange: (semesterId: string | null) => void;
	loading?: boolean;
}

export default function SemesterFilter({
	selectedSemester,
	onSemesterChange,
	loading = false,
}: Readonly<Props>) {
	const {
		semesters,
		loading: semestersLoading,
		fetchSemesters,
	} = useSemesterStore();

	// Fetch semesters on component mount
	useEffect(() => {
		fetchSemesters();
	}, [fetchSemesters]);

	// Filter semesters to exclude "NotYet" and "End" status
	const availableSemesters = semesters.filter(
		(semester: Semester) =>
			semester.status !== 'NotYet' && semester.status !== 'End',
	);

	return (
		<Select
			value={selectedSemester}
			onChange={onSemesterChange}
			placeholder="Select Semester"
			loading={semestersLoading || loading}
			allowClear={true}
		>
			{availableSemesters.map((semester) => (
				<Option key={semester.id} value={semester.id}>
					{semester.name}
				</Option>
			))}
		</Select>
	);
}
