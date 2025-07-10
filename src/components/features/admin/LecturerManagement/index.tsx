'use client';

import { Space } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Header } from '@/components/common/Header';
import LecturerFilterBar from '@/components/features/admin/LecturerManagement/LecturerFilterBar';
import LecturerTable from '@/components/features/admin/LecturerManagement/LecturerTable';
import { useLecturerStore } from '@/store/useLecturerStore';

export default function LecturerManagement() {
	const {
		filteredLecturers,
		loading,
		togglingStatus,
		togglingModerator,
		fetchLecturers,
		toggleLecturerStatus,
		toggleLecturerModerator,
	} = useLecturerStore();
	const router = useRouter();

	useEffect(() => {
		fetchLecturers();
	}, [fetchLecturers]);
	const handleTogglePermission = async (id: string) => {
		const lecturer = useLecturerStore.getState().getLecturerById(id);
		if (lecturer) {
			await toggleLecturerModerator(id, { isModerator: !lecturer.isModerator });
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

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Lecturer Management"
				description="Create and manage lecturers, registration windows, and
					capstone-specific rules."
			/>
			<LecturerFilterBar
				onCreateLecturer={handleCreateLecturer}
				onRefresh={handleRefresh}
				loading={loading}
			/>
			<LecturerTable
				data={filteredLecturers}
				onTogglePermission={handleTogglePermission}
				onToggleStatus={handleToggleStatus}
				// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
				loading={Boolean(loading || togglingStatus || togglingModerator)}
			/>
		</Space>
	);
}
