import { Card, Select, Spin, Steps, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { useMilestonesSemesterFilter } from '@/hooks/lecturer/useMilestonesSemesterFilter';
import milestonesService from '@/lib/services/milestones.service';
import { formatDateRange, getMilestoneStatus } from '@/lib/utils/dateFormat';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { Milestone } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';

const { Text } = Typography;
const { Option } = Select;

const MilestonesTimeline: React.FC = () => {
	const [milestones, setMilestones] = useState<Milestone[]>([]);
	const [loading, setLoading] = useState(true);

	// Use custom hook for semester filter logic
	const { semesters, selectedSemester, setSelectedSemester, semestersLoading } =
		useMilestonesSemesterFilter();

	// Fetch milestones when semester changes
	useEffect(() => {
		const fetchMilestones = async () => {
			if (!selectedSemester) {
				setMilestones([]);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const response =
					await milestonesService.findBySemester(selectedSemester);
				const result = handleApiResponse(response);
				if (result.success) {
					// Sort milestones by start date
					const sortedMilestones = (result.data || []).sort(
						(a: Milestone, b: Milestone) =>
							dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf(),
					);
					setMilestones(sortedMilestones);
				}
			} catch (error) {
				console.error('Error fetching milestones:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchMilestones();
	}, [selectedSemester]);

	// Get current milestone index (the one that is currently in progress)
	const getCurrentMilestoneIndex = (): number => {
		return milestones.findIndex((milestone) => {
			const status = getMilestoneStatus(milestone.startDate, milestone.endDate);
			return status === 'In Progress';
		});
	};

	// Convert milestones to Steps format
	const stepsData = milestones.map((milestone) => {
		const status = getMilestoneStatus(milestone.startDate, milestone.endDate);
		const dateRange = formatDateRange(milestone.startDate, milestone.endDate);

		// Determine step status for Steps component
		const getStepStatus = (): 'wait' | 'process' | 'finish' | 'error' => {
			if (status === 'Ended') return 'finish';
			if (status === 'In Progress') return 'process';
			return 'wait';
		};

		// Get color based on status
		const getStatusColor = (): string => {
			if (status === 'Ended') return '#52c41a';
			if (status === 'In Progress') return '#1890ff';
			return '#8c8c8c';
		};

		return {
			title: milestone.name,
			description: (
				<div>
					<Text type="secondary" style={{ fontSize: '12px' }}>
						{dateRange}
					</Text>
					<br />
					<Text
						style={{
							fontSize: '11px',
							color: getStatusColor(),
						}}
					>
						{status}
					</Text>
				</div>
			),
			status: getStepStatus(),
		};
	});

	const currentStep = getCurrentMilestoneIndex();

	const isDataReady = !loading && !semestersLoading;

	// Render main content based on state
	const renderMainContent = () => {
		if (!isDataReady) {
			return (
				<div style={{ textAlign: 'center', padding: '40px 0' }}>
					<Spin size="large" />
				</div>
			);
		}

		if (milestones.length === 0) {
			const emptyMessage = selectedSemester
				? 'No milestones found for selected semester'
				: 'Please select a semester to view milestones';

			return (
				<div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
					{emptyMessage}
				</div>
			);
		}

		return (
			<Steps
				direction="horizontal"
				current={currentStep >= 0 ? currentStep : milestones.length}
				items={stepsData}
				style={{ marginTop: '16px' }}
			/>
		);
	};

	// Render semester filter
	const renderSemesterFilter = () => (
		<Select
			value={selectedSemester}
			onChange={setSelectedSemester}
			style={{ width: 200 }}
			placeholder="Select semester"
			loading={semestersLoading}
		>
			{semesters.map((semester: Semester) => (
				<Option key={semester.id} value={semester.id}>
					{semester.name}
				</Option>
			))}
		</Select>
	);

	return (
		<Card
			title="Milestones Timeline"
			extra={
				// Desktop filter - hide on small screens
				<div className="hidden md:block">{renderSemesterFilter()}</div>
			}
		>
			{/* Mobile filter - show only on small screens, inside card below title */}
			<div className="block md:hidden mb-4">
				<div className="text-base font-medium mb-2">Select semester:</div>
				<Select
					value={selectedSemester}
					onChange={setSelectedSemester}
					style={{ width: '100%' }}
					placeholder="Select semester"
					loading={semestersLoading}
				>
					{semesters.map((semester: Semester) => (
						<Option key={semester.id} value={semester.id}>
							{semester.name}
						</Option>
					))}
				</Select>
			</div>

			{renderMainContent()}
		</Card>
	);
};

export default MilestonesTimeline;
