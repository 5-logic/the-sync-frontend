'use client';

import { Alert, Space } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Header } from '@/components/common/Header';
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

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Student Management"
				description="Create and manage students, registration windows"
			/>
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
