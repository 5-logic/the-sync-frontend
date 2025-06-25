'use client';

import { Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import LecturerFilterBar from '@/components/features/admin/LecturerManagement/LecturerFilterBar';
import LecturerTable from '@/components/features/admin/LecturerManagement/LecturerTable';
import { useLecturerStore } from '@/store/useLecturerStore';

export default function LecturerManagement() {
	const {
		filteredLecturers,
		loading,
		togglingStatus,
		fetchLecturers,
		toggleLecturerStatus,
	} = useLecturerStore();
	const router = useRouter();

	useEffect(() => {
		fetchLecturers();
	}, [fetchLecturers]);
	const handleTogglePermission = async (id: string) => {
		const lecturer = useLecturerStore.getState().getLecturerById(id);
		if (lecturer) {
			await toggleLecturerStatus(id, { isModerator: !lecturer.isModerator });
		}
	};

	const handleToggleStatus = async (id: string) => {
		const lecturer = useLecturerStore.getState().getLecturerById(id);
		if (lecturer) {
			await toggleLecturerStatus(id, { isActive: !lecturer.isActive });
		}
	};
	const handleCreateLecturer = () => {
		router.push('/admin/create-new-lecturer');
	};

	const handleRefresh = () => {
		fetchLecturers();
	};

	const { Title, Paragraph } = Typography;
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Lecturer Management
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					Create and manage lecturers, registration windows, and
					capstone-specific rules
				</Paragraph>
			</div>
			<LecturerFilterBar
				onCreateLecturer={handleCreateLecturer}
				onRefresh={handleRefresh}
				loading={loading}
			/>
			<LecturerTable
				data={filteredLecturers}
				onTogglePermission={handleTogglePermission}
				onToggleStatus={handleToggleStatus}
				loading={loading ?? togglingStatus}
			/>
		</Space>
	);
}
