'use client';

import { Select, Space, Typography } from 'antd';
import React, { useEffect } from 'react';

import { useDashboardStore, useSemesterStore } from '@/store';

const { Text } = Typography;

interface SemesterFilterProps {
	style?: React.CSSProperties;
}

const SemesterFilter: React.FC<SemesterFilterProps> = ({ style }) => {
	const {
		semesters,
		loading: semestersLoading,
		fetchSemesters,
	} = useSemesterStore();

	const {
		selectedSemesterId,
		setSelectedSemesterId,
		loading: dashboardLoading,
	} = useDashboardStore();

	// Fetch semesters on component mount
	useEffect(() => {
		fetchSemesters();
	}, [fetchSemesters]);

	// Auto-select the active semester when semesters are loaded
	useEffect(() => {
		if (semesters.length > 0 && !selectedSemesterId) {
			// Find active semester (Preparing, Picking, or Ongoing)
			const activeSemester = semesters.find(
				(semester) =>
					semester.status === 'Preparing' ||
					semester.status === 'Picking' ||
					semester.status === 'Ongoing',
			);

			// If no active semester, select the most recent one
			const defaultSemester = activeSemester || semesters[0];
			if (defaultSemester) {
				setSelectedSemesterId(defaultSemester.id);
			}
		}
	}, [semesters, selectedSemesterId, setSelectedSemesterId]);

	const handleSemesterChange = (value: string) => {
		setSelectedSemesterId(value);
	};

	return (
		<Space direction="vertical" size="small" style={style}>
			<Text strong style={{ fontSize: '14px' }}>
				Semester
			</Text>
			<Select
				style={{ width: 200 }}
				placeholder="Select semester"
				loading={semestersLoading || dashboardLoading}
				value={selectedSemesterId}
				onChange={handleSemesterChange}
				showSearch
				filterOption={(input, option) =>
					(option?.label as string)?.toLowerCase().includes(input.toLowerCase())
				}
				options={semesters.map((semester) => ({
					key: semester.id,
					value: semester.id,
					label: semester.name,
				}))}
			/>
		</Space>
	);
};

export default SemesterFilter;
