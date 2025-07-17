'use client';

import { CalendarOutlined } from '@ant-design/icons';
import { Flex, Tag, Typography } from 'antd';

import { formatDateRange, getMilestoneStatus } from '@/lib/utils/dateFormat';
import { Milestone } from '@/schemas/milestone';

interface MilestoneHeaderProps {
	milestone: Milestone;
}

export function MilestoneHeader({ milestone }: MilestoneHeaderProps) {
	const getStatusTag = (milestone: Milestone) => {
		const status = getMilestoneStatus(milestone.startDate, milestone.endDate);
		switch (status) {
			case 'Ended':
				return <Tag color="green">Ended</Tag>;
			case 'In Progress':
				return <Tag color="blue">In Progress</Tag>;
			case 'Upcoming':
				return <Tag>Upcoming</Tag>;
		}
	};

	return (
		<>
			{/* Desktop layout - 1 line */}
			<div
				style={{
					display: 'block',
					width: '100%',
				}}
			>
				<Flex
					justify="space-between"
					align="center"
					gap={8}
					style={{ width: '100%' }}
					className="desktop-milestone-header"
				>
					<Flex align="center" gap={8} style={{ minWidth: 0, flex: 1 }}>
						<Typography.Text
							style={{
								fontWeight: 500,
								fontSize: 16,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								maxWidth: '100%',
							}}
							title={milestone.name}
						>
							{milestone.name}
						</Typography.Text>
						{getStatusTag(milestone)}
					</Flex>
					<Flex align="center" gap={4} style={{ flexShrink: 0 }}>
						<CalendarOutlined className="text-gray-200 text-sm" />
						<Typography.Text
							type="secondary"
							style={{
								fontSize: 12,
								whiteSpace: 'nowrap',
							}}
						>
							{formatDateRange(milestone.startDate, milestone.endDate)}
						</Typography.Text>
					</Flex>
				</Flex>

				{/* Mobile layout - 2 lines */}
				<Flex
					vertical
					gap={8}
					style={{ width: '100%' }}
					className="mobile-milestone-header"
				>
					<Flex align="center" gap={8} wrap="wrap">
						<Typography.Text
							style={{
								fontWeight: 500,
								fontSize: 16,
							}}
							title={milestone.name}
						>
							{milestone.name}
						</Typography.Text>
						{getStatusTag(milestone)}
					</Flex>
					<Flex align="center" gap={4}>
						<CalendarOutlined className="text-gray-200 text-sm" />
						<Typography.Text
							type="secondary"
							style={{
								fontSize: 12,
							}}
						>
							{formatDateRange(milestone.startDate, milestone.endDate)}
						</Typography.Text>
					</Flex>
				</Flex>
			</div>
		</>
	);
}
