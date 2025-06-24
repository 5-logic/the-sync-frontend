'use client';

import { Space, Typography } from 'antd';
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
		fetchStudents,
		setSelectedSemesterId,
		setSelectedMajorId,
		setSelectedStatus,
		setSearchText,
	} = useStudentStore();

	useEffect(() => {
		fetchStudents();
	}, [fetchStudents]);

	const handleCreateStudent = () => {
		router.push('/admin/create-new-student');
	};

	const handleRefresh = () => {
		fetchStudents();
	};

	const { Title, Paragraph } = Typography;

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			{' '}
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Student Management
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					Create and manage students, registration windows
				</Paragraph>
			</div>
			<StudentFilterBar
				semesterFilter={selectedSemesterId || 'All'}
				setSemesterFilter={setSelectedSemesterId}
				statusFilter={selectedStatus}
				setStatusFilter={setSelectedStatus}
				majorFilter={selectedMajorId || 'All'}
				setMajorFilter={setSelectedMajorId}
				searchText={searchText}
				setSearchText={setSearchText}
				onCreateStudent={handleCreateStudent}
				onRefresh={handleRefresh}
				loading={loading}
			/>
			<StudentTable
				data={filteredStudents}
				loading={loading}
				onReload={fetchStudents}
			/>
		</Space>
	);
}
