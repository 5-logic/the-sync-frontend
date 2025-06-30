'use client';

import { Alert, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import StudentFilterBar from '@/components/features/admin/StudentManagement/StudentFilterBar';
import StudentTable from '@/components/features/admin/StudentManagement/StudentTable';
import { useStudentStore } from '@/store';

export default function StudentManagement() {
	const router = useRouter();

	// Get state and actions from store
	const {
		filteredStudents,
		loading,
		selectedSemesterId,
		selectedMajorId,
		selectedStatus,
		searchText,
		fetchStudentsBySemester,
		setSelectedSemesterId,
		setSelectedMajorId,
		setSelectedStatus,
		setSearchText,
	} = useStudentStore();

	useEffect(() => {
		// Only fetch students if a semester is selected
		if (selectedSemesterId) {
			fetchStudentsBySemester(selectedSemesterId);
		}
	}, [selectedSemesterId, fetchStudentsBySemester]);

	const handleCreateStudent = () => {
		router.push('/admin/create-new-student');
	};

	const handleRefresh = () => {
		if (selectedSemesterId) {
			fetchStudentsBySemester(selectedSemesterId);
		}
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
				semesterFilter={selectedSemesterId}
				setSemesterFilter={setSelectedSemesterId}
				statusFilter={selectedStatus}
				setStatusFilter={setSelectedStatus}
				majorFilter={selectedMajorId ?? 'All'}
				setMajorFilter={setSelectedMajorId}
				searchText={searchText}
				setSearchText={setSearchText}
				onCreateStudent={handleCreateStudent}
				onRefresh={handleRefresh}
				loading={loading}
			/>
			{selectedSemesterId ? (
				<StudentTable data={filteredStudents} loading={loading} />
			) : (
				<Alert
					message="Please select a semester"
					description="Select a semester from the filter above to view students."
					type="info"
					showIcon
				/>
			)}
		</Space>
	);
}
