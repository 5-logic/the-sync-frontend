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
		<div className="w-full">
			{/* Container với responsive behavior */}
			<div className="flex flex-col lg:flex-row gap-3 lg:items-center">
				{/* Top row: Filters */}
				<div className="flex flex-col sm:flex-row gap-3 lg:gap-2 flex-1">
					{/* Semester Select */}
					<div className="w-full sm:w-auto lg:w-48 lg:flex-shrink-0">
						<Select
							value={semesterFilter}
							onChange={setSemesterFilter}
							style={{ width: "100%" }}
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
					</div>

					{/* Status Select */}
					<div className="w-full sm:w-auto lg:w-32 lg:flex-shrink-0">
						<Select
							value={statusFilter}
							onChange={setStatusFilter}
							style={{ width: "100%" }}
							size="middle"
						>
							<Option value="All">All Status</Option>
							<Option value="Active">Active</Option>
							<Option value="Inactive">Inactive</Option>
						</Select>
					</div>

					{/* Major Select */}
					<div className="w-full sm:w-auto lg:w-48 lg:flex-shrink-0">
						<Select
							value={majorFilter}
							onChange={setMajorFilter}
							style={{ width: "100%" }}
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
					</div>

					{/* Search Input */}
					<div className="flex-1 min-w-0">
						<Input
							placeholder="Search by Name, Email, Student Code"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							prefix={<SearchOutlined />}
							size="middle"
							style={{ width: "100%" }}
						/>
					</div>
				</div>

				{/* Action buttons */}
				<div className="flex flex-col sm:flex-row gap-3 lg:gap-2 lg:flex-shrink-0">
					<Button
						icon={<ReloadOutlined />}
						onClick={onRefresh}
						loading={loading}
						size="middle"
						title="Refresh data"
						className="w-full sm:w-auto"
					>
						Refresh
					</Button>

					<Button
						icon={<PlusOutlined />}
						type="primary"
						size="middle"
						onClick={onCreateStudent}
						className="w-full sm:w-auto"
					>
						Create New Student
					</Button>
				</div>
			</div>
		</div>
	);
}
