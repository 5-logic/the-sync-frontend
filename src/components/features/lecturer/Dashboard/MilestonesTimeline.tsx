import { Card, Spin, Steps, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { useLecturerSemesterFilter } from '@/hooks/lecturer/useLecturerSemesterFilter';
import milestonesService from '@/lib/services/milestones.service';
import { formatDateRange, getMilestoneStatus } from '@/lib/utils/dateFormat';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { Milestone } from '@/schemas/milestone';

const { Text } = Typography;

const MilestonesTimeline: React.FC = () => {
	const [milestones, setMilestones] = useState<Milestone[]>([]);
	const [loading, setLoading] = useState(true);

	// Use custom hook for semester filter logic
	const { selectedSemester, semestersLoading } = useLecturerSemesterFilter();

	// Fetch milestones when semester changes
	useEffect(() => {
		const fetchMilestones = async () => {
			if (!selectedSemester || selectedSemester === 'all') {
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
		let stepStatus: 'wait' | 'process' | 'finish' | 'error' = 'wait';
		if (status === 'Ended') stepStatus = 'finish';
		else if (status === 'In Progress') stepStatus = 'process';
		else stepStatus = 'wait';

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
							color:
								status === 'Ended'
									? '#52c41a'
									: status === 'In Progress'
										? '#1890ff'
										: '#8c8c8c',
						}}
					>
						{status}
					</Text>
				</div>
			),
			status: stepStatus,
		};
	});

	const currentStep = getCurrentMilestoneIndex();

	const isDataReady = !loading && !semestersLoading;

	return (
		<Card title="Milestones Timeline">
			{!isDataReady ? (
				<div style={{ textAlign: 'center', padding: '40px 0' }}>
					<Spin size="large" />
				</div>
			) : milestones.length === 0 ? (
				<div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
					{selectedSemester === 'all'
						? 'Please select a semester to view milestones'
						: 'No milestones found for selected semester'}
				</div>
			) : (
				<Steps
					direction="horizontal"
					current={currentStep >= 0 ? currentStep : milestones.length}
					items={stepsData}
					style={{ marginTop: '16px' }}
				/>
			)}
		</Card>
	);
};

export default MilestonesTimeline;
