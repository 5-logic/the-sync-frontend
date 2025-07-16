import { Card, Select, Timeline } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';

import { mockMilestoneDetails } from '@/data/milestone';

const { Option } = Select;

const MilestonesTimeline: React.FC = () => {
	const [semester, setSemester] = useState('All');

	// Filter milestones based on semester (for demo purposes, we'll use year from date)
	const filteredMilestones = mockMilestoneDetails.filter((milestone) => {
		if (semester === 'All') return true;
		const year = dayjs(milestone.date).year().toString();
		return year === semester;
	});
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
				<Select value={semester} onChange={setSemester} style={{ width: 150 }}>
					<Option value="All">All Semester</Option>
					<Option value="2024">2024</Option>
					<Option value="2025">2025</Option>
				</Select>
			}
		>
			<Timeline>
				{filteredMilestones.map((item) => (
					<Timeline.Item color={getColor(item.status)} key={item.id}>
						<div>
							<strong>{item.title}</strong> — {item.date}
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
				))}
			</Timeline>
		</Card>
	);
};

export default MilestonesTimeline;
