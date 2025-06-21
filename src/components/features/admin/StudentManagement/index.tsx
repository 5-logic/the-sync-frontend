'use client';

import { Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import StudentFilterBar from '@/components/features/admin/StudentManagement/StudentFilterBar';
import StudentTable from '@/components/features/admin/StudentManagement/StudentTable';
import studentService from '@/lib/services/students.service';
import { showNotification } from '@/lib/utils/notification';
import { Student } from '@/schemas/student';

export default function StudentManagement() {
	const [semesterFilter, setSemesterFilter] = useState('All');
	const [statusFilter, setStatusFilter] = useState('All');
	const [majorFilter, setMajorFilter] = useState('All');
	const [searchText, setSearchText] = useState('');
	const [data, setData] = useState<Student[]>([]);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const fetchStudents = async () => {
		try {
			setLoading(true);
			const response = await studentService.findAll();

			if (response.success) {
				setData(response.data);
			} else {
				showNotification.error(response.error || 'Failed to fetch students');
			}
		} catch (error) {
			console.error('Error fetching students:', error);
			showNotification.error('Failed to fetch students');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStudents();
	}, []);

	const filteredData = data.filter((student) => {
		// Đợi api enrollment để handle semester filter
		const matchesSemester = semesterFilter === 'All' || '' === semesterFilter;

		const matchesStatus =
			statusFilter === 'All' ||
			student.isActive === (statusFilter === 'Active');

		const matchesMajor =
			majorFilter === 'All' || student.majorId === majorFilter;

		const matchesSearch = [
			student.fullName,
			student.email,
			student.studentId,
		].some((field) =>
			(field ?? '').toLowerCase().includes(searchText.toLowerCase()),
		);

		return matchesSemester && matchesStatus && matchesMajor && matchesSearch;
	});

	const handleCreateStudent = () => {
		router.push('/admin/create-new-student');
	};

	const handleRefresh = () => {
		fetchStudents();
	};

	const { Title, Paragraph } = Typography;

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Student Management
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					Create and manage students, registration windows
				</Paragraph>
			</div>

			<StudentFilterBar
				semesterFilter={semesterFilter}
				setSemesterFilter={setSemesterFilter}
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				majorFilter={majorFilter}
				setMajorFilter={setMajorFilter}
				searchText={searchText}
				setSearchText={setSearchText}
				onCreateStudent={handleCreateStudent}
				onRefresh={handleRefresh}
				loading={loading}
			/>

			<StudentTable data={filteredData} loading={loading} />
		</Space>
	);
}
