"use client";

import { Select, Space } from "antd";
import { useEffect } from "react";

import { Semester } from "@/schemas/semester";
import { useSemesterStore } from "@/store/useSemesterStore";
import { SEMESTER_STATUS_TAGS } from "@/lib/constants/semester";

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

	// Show all semesters, but prioritize active ones for auto-selection
	const availableSemesters = semesters; // Show all semesters
	const activeSemesters = semesters.filter(
		(semester: Semester) =>
			semester.status !== "NotYet" && semester.status !== "End",
	);

	// Auto-select first active semester if none selected, fallback to any semester
	useEffect(() => {
		if (
			!selectedSemester &&
			availableSemesters.length > 0 &&
			!semestersLoading
		) {
			// Prefer active semesters, but allow any semester if no active ones exist
			const semesterToSelect =
				activeSemesters.length > 0 ? activeSemesters[0] : availableSemesters[0];
			onSemesterChange(semesterToSelect.id);
		}
	}, [
		selectedSemester,
		availableSemesters,
		activeSemesters,
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
					<Space>
						<span>{semester.name}</span>
						{
							SEMESTER_STATUS_TAGS[
								semester.status as keyof typeof SEMESTER_STATUS_TAGS
							]
						}
					</Space>
				</Option>
			))}
		</Select>
	);
}
