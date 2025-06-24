'use client';

import {
	PlusOutlined,
	ReloadOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';
import { useEffect } from 'react';

import { useMajorStore, useSemesterStore } from '@/store';

const { Option } = Select;

type Props = Readonly<{
	semesterFilter: string;
	setSemesterFilter: (value: string) => void;
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

	return (
		<Row
			gutter={[8, 16]}
			align="middle"
			justify="space-between"
			style={{ marginBottom: 16 }}
		>
			<Col xs={24} md={20}>
				<Row gutter={[8, 8]} wrap>
					<Col>
						<Select
							value={semesterFilter}
							onChange={setSemesterFilter}
							style={{ width: 150 }}
							size="middle"
							loading={semestersLoading} // Use loading from semester store
							placeholder="Select semester"
						>
							<Option value="All">All Semesters</Option>
							{semesters.map((semester) => (
								<Option key={semester.id} value={semester.id}>
									{semester.name}
								</Option>
							))}
						</Select>
					</Col>

					<Col>
						<Select
							value={statusFilter}
							onChange={setStatusFilter}
							style={{ width: 120 }}
							size="middle"
						>
							<Option value="All">All Status</Option>
							<Option value="Active">Active</Option>
							<Option value="Inactive">Inactive</Option>
						</Select>
					</Col>

					<Col>
						<Select
							value={majorFilter}
							onChange={setMajorFilter}
							style={{ width: 200 }}
							size="middle"
							loading={majorsLoading} // Use loading from major store
							placeholder="Select major"
						>
							<Option value="All">All Majors</Option>
							{majors.map((major) => (
								<Option key={major.id} value={major.id}>
									{major.name}
								</Option>
							))}
						</Select>
					</Col>

					<Col flex="auto">
						<Input
							placeholder="Search by Name, Email, Student ID"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							prefix={<SearchOutlined />}
							size="middle"
						/>
					</Col>

					<Col>
						<Button
							icon={<ReloadOutlined />}
							onClick={onRefresh}
							loading={loading}
							size="middle"
							title="Refresh data"
						>
							Refresh
						</Button>
					</Col>
				</Row>
			</Col>

			<Col xs={24} md={4} style={{ textAlign: 'right' }}>
				<Button
					icon={<PlusOutlined />}
					type="primary"
					size="middle"
					onClick={onCreateStudent}
				>
					Create New Student
				</Button>
			</Col>
		</Row>
	);
}
