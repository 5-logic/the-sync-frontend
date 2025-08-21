"use client";

import {
	PlusOutlined,
	ReloadOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, Select } from "antd";
import { useEffect } from "react";

import { SEMESTER_STATUS_TAGS } from "@/lib/constants/semester";
import { useMajorStore, useSemesterStore } from "@/store";

const { Option } = Select;

// Status tag styling to match SemesterTable

type Props = Readonly<{
	semesterFilter: string | null;
	setSemesterFilter: (value: string | null) => void;
	statusFilter: string;
	setStatusFilter: (value: string) => void;
	majorFilter: string;
	setMajorFilter: (value: string) => void;
	searchText: string;
	setSearchText: (value: string) => void;
	onCreateStudent: () => void;
	onRefresh: () => void;
	loading?: boolean;
}>;

export default function StudentFilterBar({
	semesterFilter,
	setSemesterFilter,
	statusFilter,
	setStatusFilter,
	majorFilter,
	setMajorFilter,
	searchText,
	setSearchText,
	onCreateStudent,
	onRefresh,
	loading = false,
}: Props) {
	// Use Semester Store - Replace local semester state
	const {
		semesters,
		loading: semestersLoading,
		fetchSemesters,
	} = useSemesterStore();

	// Use Major Store
	const { majors, loading: majorsLoading, fetchMajors } = useMajorStore();

	// Fetch data on component mount
	useEffect(() => {
		fetchSemesters();
		fetchMajors();
	}, [fetchSemesters, fetchMajors]);

	// Auto-select first appropriate semester if none selected and semesters are loaded
	useEffect(() => {
		if (!semesterFilter && semesters.length > 0 && !semestersLoading) {
			// Prefer semesters that are not in NotYet or End status
			const activeSemesters = semesters.filter(
				(semester) => semester.status !== "NotYet" && semester.status !== "End",
			);

			// Use active semester if available, otherwise use first semester
			const semesterToSelect =
				activeSemesters.length > 0 ? activeSemesters[0] : semesters[0];

			setSemesterFilter(semesterToSelect.id);
		}
	}, [semesterFilter, semesters, semestersLoading, setSemesterFilter]);

	return (
		<div className="flex items-center gap-2 w-full">
			<Select
				value={semesterFilter}
				onChange={setSemesterFilter}
				style={{ width: 200, flexShrink: 0 }}
				size="middle"
				loading={semestersLoading}
				placeholder="Select semester"
			>
				{semesters.map((semester) => (
					<Option key={semester.id} value={semester.id}>
						<span
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
						>
							<span>{semester.name}</span>
							{SEMESTER_STATUS_TAGS[semester.status]}
						</span>
					</Option>
				))}
			</Select>

			<Select
				value={statusFilter}
				onChange={setStatusFilter}
				style={{ width: 120, flexShrink: 0 }}
				size="middle"
			>
				<Option value="All">All Status</Option>
				<Option value="Active">Active</Option>
				<Option value="Inactive">Inactive</Option>
			</Select>

			<Select
				value={majorFilter}
				onChange={setMajorFilter}
				style={{ width: 200, flexShrink: 0 }}
				size="middle"
				loading={majorsLoading}
				placeholder="Select major"
			>
				<Option value="All">All Majors</Option>
				{majors.map((major) => (
					<Option key={major.id} value={major.id}>
						{major.name}
					</Option>
				))}
			</Select>

			{/* Search input - expands to fill available space */}
			<div style={{ flex: 1, minWidth: 200 }}>
				<Input
					placeholder="Search by Name, Email, Student Code"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					prefix={<SearchOutlined />}
					size="middle"
				/>
			</div>

			<Button
				icon={<ReloadOutlined />}
				onClick={onRefresh}
				loading={loading}
				size="middle"
				title="Refresh data"
				style={{ flexShrink: 0 }}
			>
				Refresh
			</Button>

			<Button
				icon={<PlusOutlined />}
				type="primary"
				size="middle"
				onClick={onCreateStudent}
				style={{ flexShrink: 0 }}
			>
				Create New Student
			</Button>
		</div>
	);
}
