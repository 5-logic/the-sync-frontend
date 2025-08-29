'use client';

import { Card, Progress, Skeleton, Space, Tooltip, Typography } from 'antd';

import { useDashboardStore } from '@/store';

const { Title, Text } = Typography;

export function ProgressOverview() {
	const { progressOverview, summaryCard, loading, error } = useDashboardStore();

	// Show loading state
	if (loading) {
		return (
			<Card>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Skeleton.Input active size="large" style={{ width: 200 }} />
					<Skeleton.Input active size="small" style={{ width: 400 }} />
					<div style={{ borderTop: '1px solid #e8e8e8', paddingTop: '16px' }}>
						{[
							'students-grouped',
							'groups-thesis',
							'thesis-approved',
							'supervisors-assigned',
						].map((progressType) => (
							<Space
								key={`progress-skeleton-${progressType}`}
								direction="vertical"
								size="small"
								style={{ width: '100%', marginBottom: 16 }}
							>
								<Skeleton.Input active size="small" style={{ width: 150 }} />
								<Skeleton.Button
									active
									size="small"
									style={{ width: '100%', height: 6 }}
								/>
							</Space>
						))}
					</div>
				</Space>
			</Card>
		);
	}

	// Calculate percentages from API data
	const getProgressData = () => {
		if (error || !progressOverview || !summaryCard) {
			return [
				{
					label: 'Students Grouped',
					percent: 0,
					color: '#1890ff',
					tooltip: '0 of 0 students grouped',
				},
				{
					label: 'Groups with Picked Thesis',
					percent: 0,
					color: '#52c41a',
					tooltip: '0 of 0 groups picked thesis',
				},
				{
					label: 'Thesis Published',
					percent: 0,
					color: '#faad14',
					tooltip: '0 of 0 theses published',
				},
				{
					label: 'Assigned Supervisors',
					percent: 0,
					color: '#722ed1',
					tooltip: '0 of 0 supervisors assigned',
				},
			];
		}

		// Calculate percentages based on API data with proper business logic
		const studentsGroupedPercent =
			summaryCard.totalStudents > 0
				? Math.round(
						(progressOverview.totalStudentGrouped / summaryCard.totalStudents) *
							100,
					)
				: 0;

		const groupsPickedThesisPercent =
			summaryCard.totalGroups > 0
				? Math.round(
						(progressOverview.totalGroupPickedThesis /
							summaryCard.totalGroups) *
							100,
					)
				: 0;

		const thesesApprovedPercent =
			summaryCard.totalTheses > 0
				? Math.round(
						(progressOverview.thesisPublished / summaryCard.totalTheses) * 100,
					)
				: 0;

		const assignedSupervisorsPercent =
			summaryCard.totalLecturers > 0
				? Math.round(
						(progressOverview.totalAssignedSupervisors /
							summaryCard.totalLecturers) *
							100,
					)
				: 0;

		return [
			{
				label: 'Students Grouped',
				percent: studentsGroupedPercent,
				color: '#1890ff',
				tooltip: `${progressOverview.totalStudentGrouped} of ${summaryCard.totalStudents} students grouped`,
			},
			{
				label: 'Groups with Picked Thesis',
				percent: groupsPickedThesisPercent,
				color: '#52c41a',
				tooltip: `${progressOverview.totalGroupPickedThesis} of ${summaryCard.totalGroups} groups picked thesis`,
			},
			{
				label: 'Thesis Published',
				percent: thesesApprovedPercent,
				color: '#faad14',
				tooltip: `${progressOverview.thesisPublished} of ${summaryCard.totalTheses} theses published`,
			},
			{
				label: 'Assigned Supervisors',
				percent: assignedSupervisorsPercent,
				color: '#722ed1',
				tooltip: `${progressOverview.totalAssignedSupervisors} of ${summaryCard.totalLecturers} supervisors assigned`,
			},
		];
	};

	const progressData = getProgressData();

	return (
		<Card>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Title level={4} style={{ margin: 0 }}>
						Semester Progress Overview
					</Title>
					<Text type="secondary">
						Track the overall progress of thesis management this semester.
					</Text>
				</Space>

				<Space
					direction="vertical"
					size="middle"
					style={{
						borderTop: '1px solid #e8e8e8',
						width: '100%',
						paddingTop: '16px',
					}}
				>
					{progressData.map((item) => (
						<Space
							key={item.label}
							direction="vertical"
							size="small"
							style={{ width: '100%' }}
						>
							<Space style={{ width: '100%', justifyContent: 'space-between' }}>
								<Text strong style={{ fontSize: '14px' }}>
									{item.label}
								</Text>
								<Text strong style={{ fontSize: '14px' }}>
									{item.percent}%
								</Text>
							</Space>
							<Tooltip title={item.tooltip} placement="top">
								<Progress
									percent={item.percent}
									strokeColor={item.color}
									showInfo={false}
								/>
							</Tooltip>
						</Space>
					))}
				</Space>
			</Space>
		</Card>
	);
}
