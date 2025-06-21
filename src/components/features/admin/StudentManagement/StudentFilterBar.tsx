'use client';

import {
	PlusOutlined,
	ReloadOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';
import { useEffect, useState } from 'react';

import majorService from '@/lib/services/majors.service';
import semesterService from '@/lib/services/semesters.service';
import { Major } from '@/schemas/major';
import { Semester } from '@/schemas/semester';

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
	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [semestersLoading, setSemestersLoading] = useState(false);
	const [majors, setMajors] = useState<Major[]>([]);
	const [majorsLoading, setMajorsLoading] = useState(false);

	useEffect(() => {
		const fetchSemesters = async () => {
			try {
				setSemestersLoading(true);
				const response = await semesterService.findAll();

				if (response.success) {
					setSemesters(response.data);
				} else {
					console.error('Failed to fetch semesters:', response.error);
				}
			} catch (error) {
				console.error('Error fetching semesters:', error);
			} finally {
				setSemestersLoading(false);
			}
		};

		fetchSemesters();
	}, []);

	useEffect(() => {
		const fetchMajors = async () => {
			try {
				setMajorsLoading(true);
				const response = await majorService.findAll();

				if (response.success) {
					setMajors(response.data);
				} else {
					console.error('Failed to fetch majors:', response.error);
				}
			} catch (error) {
				console.error('Error fetching majors:', error);
			} finally {
				setMajorsLoading(false);
			}
		};

		fetchMajors();
	}, []);

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
							loading={semestersLoading}
							placeholder="Select semester"
						>
							<Option value="All">All Semesters</Option>
							{semesters.map((semester) => (
								<Option key={semester.id} value={semester.id}>
									{semester.code}
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
							style={{ width: 150 }}
							size="middle"
							loading={majorsLoading}
							placeholder="Select major"
						>
							<Option value="All">All Majors</Option>
							{majors.map((major) => (
								<Option key={major.id} value={major.id}>
									{major.code}
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
					block
					onClick={onCreateStudent}
				>
					Create New Student
				</Button>
			</Col>
		</Row>
	);
}
