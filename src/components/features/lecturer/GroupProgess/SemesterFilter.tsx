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

	// Auto-select first available semester if none selected and semesters are loaded
	useEffect(() => {
		if (
			!selectedSemester &&
			availableSemesters.length > 0 &&
			!semestersLoading
		) {
			onSemesterChange(availableSemesters[0].id);
		}
	}, [
		selectedSemester,
		availableSemesters,
		semestersLoading,
		onSemesterChange,
	]);

	return (
		<Select
			value={selectedSemester}
			onChange={onSemesterChange}
			placeholder="Select Semester"
			loading={semestersLoading || loading}
			allowClear={false}
		>
			{availableSemesters.map((semester) => (
				<Option key={semester.id} value={semester.id}>
					{semester.name}
				</Option>
			))}
		</Select>
	);
}
