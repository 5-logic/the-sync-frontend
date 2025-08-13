"use client";

import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, Input, Row, Select } from "antd";
import { useEffect } from "react";

import { useCurrentSemester } from "@/hooks/semester";
import { useSemesterStore } from "@/store";

interface Props {
	search: string;
	onSearchChange: (val: string) => void;
	status?: "approved" | "pending" | "rejected" | "new";
	onStatusChange: (val?: "approved" | "pending" | "rejected" | "new") => void;
	semester?: string;
	onSemesterChange: (val?: string) => void;
	onRefresh: () => void;
}

const statusOptions = [
	{ value: "new", label: "New" },
	{ value: "approved", label: "Approved" },
	{ value: "pending", label: "Pending" },
	{ value: "rejected", label: "Rejected" },
];

export default function ThesesRegistrationFilterBar({
	search,
	onSearchChange,
	status,
	onStatusChange,
	semester,
	onSemesterChange,
	onRefresh,
}: Readonly<Props>) {
	const {
		semesters,
		fetchSemesters,
		loading: semesterLoading,
	} = useSemesterStore();
	const { currentSemester } = useCurrentSemester();

	// Fetch semesters for dropdown options
	useEffect(() => {
		fetchSemesters();
	}, [fetchSemesters]);

	// Set default semester to current semester when component mounts
	useEffect(() => {
		if (currentSemester && !semester) {
			onSemesterChange(currentSemester.id);
		}
	}, [currentSemester, semester, onSemesterChange]);

	return (
		<Row
			gutter={[12, 12]}
			wrap
			align="middle"
			justify="start"
			style={{ marginBottom: 10 }}
		>
			<Col flex="auto" style={{ minWidth: 200 }}>
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="Search topics"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</Col>

			<Col style={{ width: 140 }}>
				<Select
					allowClear
					placeholder="All Semesters"
					value={semester}
					options={semesters.map((s) => ({
						value: s.id,
						label: s.name,
					}))}
					onChange={onSemesterChange}
					loading={semesterLoading}
					style={{ width: "100%" }}
				/>
			</Col>

			<Col style={{ width: 140 }}>
				<Select
					allowClear
					placeholder="All Status"
					value={status}
					options={statusOptions}
					onChange={onStatusChange}
					style={{ width: "100%" }}
				/>
			</Col>

			<Col style={{ width: 120 }}>
				<Button
					icon={<ReloadOutlined />}
					onClick={onRefresh}
					style={{ width: "100%" }}
				>
					Refresh
				</Button>
			</Col>
		</Row>
	);
}
