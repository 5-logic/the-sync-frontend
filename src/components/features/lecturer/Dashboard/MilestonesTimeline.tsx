import { Card, Select, Timeline } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';

import { mockMilestoneDetails } from '@/data/milestone';

const { Option } = Select;

const MilestonesTimeline: React.FC = () => {
	const [semester, setSemester] = useState('All');

	// Get unique semesters from milestone data
	const uniqueSemesters = Array.from(
		new Set(mockMilestoneDetails.map((milestone) => milestone.semesterId)),
	).sort((a, b) => a.localeCompare(b));

	// Filter milestones based on semester and sort by date
	const filteredMilestones = mockMilestoneDetails
		.filter((milestone) => {
			if (semester === 'All') return true;
			return milestone.semesterId === semester;
		})
		.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
	const getColor = (status: string) => {
		switch (status) {
			case 'Ended':
				return 'green';
			case 'In Progress':
				return 'blue';
			case 'Upcoming':
			default:
				return 'gray';
		}
	};

	const getDueText = (date: string, status: string) => {
		if (status === 'Ended') {
			return null;
		}

		const now = dayjs();
		const dueDate = dayjs(date);
		const diff = dueDate.diff(now, 'day');

		if (diff < 0) {
			return `Overdue by ${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''}`;
		} else if (diff === 0) {
			return 'Due today';
		} else {
			return `Due in ${diff} day${diff > 1 ? 's' : ''}`;
		}
	};

	const getDueColor = (date: string, status: string) => {
		if (status === 'Ended') {
			return '#666';
		}

		const now = dayjs();
		const dueDate = dayjs(date);
		const diff = dueDate.diff(now, 'day');

		// Chỉ hiển thị màu đỏ cho những milestone có due in < 7 ngày hoặc quá hạn
		if (diff < 7) {
			return '#ff4d4f';
		} else {
			return '#333';
		}
	};

	return (
		<Card
			title="Milestones Timeline"
			extra={
				<Select value={semester} onChange={setSemester} style={{ width: 180 }}>
					<Option value="All">All Semesters</Option>
					{uniqueSemesters.map((sem) => (
						<Option key={sem} value={sem}>
							{sem}
						</Option>
					))}
				</Select>
			}
		>
			<Timeline>
				{filteredMilestones.length > 0 ? (
					filteredMilestones.map((item) => (
						<Timeline.Item color={getColor(item.status)} key={item.id}>
							<div>
								<strong>{item.title}</strong> —{' '}
								{dayjs(item.date).format('MMM DD, YYYY')}
							</div>
							<div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
								Status: {item.status}{' '}
							</div>
							{getDueText(item.date, item.status) && (
								<div
									style={{
										marginTop: 4,
										fontSize: '12px',
										color: getDueColor(item.date, item.status),
										fontWeight: 500,
									}}
								>
									{getDueText(item.date, item.status)}
								</div>
							)}
						</Timeline.Item>
					))
				) : (
					<div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
						No milestones found for{' '}
						{semester === 'All' ? 'any semester' : semester}
					</div>
				)}
			</Timeline>
		</Card>
	);
};

export default MilestonesTimeline;
