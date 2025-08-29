'use client';

import { Modal, Select, Space, Typography } from 'antd';
import { memo, useCallback, useEffect, useState } from 'react';

import SupervisorLoadChart from '@/components/common/Dashboard/SupervisorLoadChart';
import { useDashboardStore } from '@/store';
import { useSemesterStore } from '@/store/useSemesterStore';

const { Title } = Typography;

interface Props {
	open: boolean;
	onCancel: () => void;
}

/**
 * Dialog component for viewing lecturer's workload distribution
 * Shows semester filter and Supervisor Load Distribution chart
 */
const WorkloadDialog = memo<Props>(({ open, onCancel }) => {
	const [selectedSemester, setSelectedSemester] = useState<string>('');

	// Dashboard store for supervisor load data
	const { fetchDashboardStatistics } = useDashboardStore();

	// Semester store for semester options
	const { semesters, fetchSemesters } = useSemesterStore();

	// Fetch semesters when dialog opens
	useEffect(() => {
		if (open) {
			fetchSemesters();
		}
	}, [open, fetchSemesters]);

	// Set default semester to the first available semester
	useEffect(() => {
		if (open && semesters.length > 0 && !selectedSemester) {
			// Find the first semester
			const defaultSemester = semesters[0];
			setSelectedSemester(defaultSemester.id);
		}
	}, [open, semesters, selectedSemester]);

	// Fetch supervisor load data when semester changes
	useEffect(() => {
		if (open && selectedSemester) {
			fetchDashboardStatistics(selectedSemester);
		}
	}, [open, selectedSemester, fetchDashboardStatistics]);

	const handleSemesterChange = useCallback((value: string) => {
		setSelectedSemester(value);
	}, []);

	const handleCancel = useCallback(() => {
		onCancel();
	}, [onCancel]);

	// Create semester options
	const semesterOptions = semesters.map((semester) => ({
		value: semester.id,
		label: semester.name,
	}));

	return (
		<Modal
			title="Lecturer's Workload Distribution"
			open={open}
			onCancel={handleCancel}
			footer={null}
			width={1000}
			destroyOnClose
			centered
		>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Title level={5} style={{ margin: 0 }}>
						Filter by Semester
					</Title>
					<Select
						value={selectedSemester}
						onChange={handleSemesterChange}
						style={{ width: 300 }}
						placeholder="Select semester"
						options={semesterOptions}
					/>
				</Space>

				{selectedSemester && (
					<div style={{ minHeight: 400 }}>
						<SupervisorLoadChart />
					</div>
				)}
			</Space>
		</Modal>
	);
});

WorkloadDialog.displayName = 'WorkloadDialog';

export default WorkloadDialog;
