'use client';

import {
	PlusOutlined,
	ReloadOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Space } from 'antd';
import { useEffect, useState } from 'react';

import { useMilestoneStore } from '@/store';

interface Props {
	readonly onSearchChange: (val: string) => void;
	readonly onMilestoneChange?: (milestoneId: string | null) => void;
	readonly onCreate?: () => void;
	readonly onRefresh?: () => void;
	readonly buttonLabel?: string;
	readonly hideButton?: boolean;
	readonly loading?: boolean;
}

export default function ChecklistToolbar({
	onSearchChange,
	onMilestoneChange,
	onCreate,
	onRefresh,
	buttonLabel = 'Create New Checklist',
	hideButton = false,
	loading = false,
}: Props) {
	const [searchValue, setSearchValue] = useState('');
	const [selectedMilestone, setSelectedMilestone] = useState<string | null>(
		null,
	);

	const {
		milestones,
		loading: milestonesLoading,
		fetchMilestones,
	} = useMilestoneStore();

	useEffect(() => {
		fetchMilestones();
	}, [fetchMilestones]);

	const handleSearchChange = (value: string) => {
		setSearchValue(value);
		onSearchChange(value);
	};

	const handleMilestoneChange = (value: string | null) => {
		setSelectedMilestone(value);
		onMilestoneChange?.(value);
	};

	return (
		<Row gutter={[12, 12]} wrap align="middle" style={{ marginBottom: 16 }}>
			{/* Search input - flex để lấp đầy */}
			<Col flex="1" style={{ minWidth: 200 }}>
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="Search by name, description..."
					value={searchValue}
					onChange={(e) => handleSearchChange(e.target.value)}
					size="middle"
				/>
			</Col>

			{/* Milestone filter - chiều rộng cố định */}
			<Col flex="none" style={{ width: 180 }}>
				<Select
					placeholder="Filter by milestone"
					value={selectedMilestone}
					onChange={handleMilestoneChange}
					allowClear
					style={{ width: '100%' }}
					loading={milestonesLoading}
					size="middle"
				>
					<Select.Option value={null}>All Milestones</Select.Option>
					{milestones.map((milestone) => (
						<Select.Option key={milestone.id} value={milestone.id}>
							{milestone.name}
						</Select.Option>
					))}
				</Select>
			</Col>

			{/* Actions - chiều rộng cố định */}
			<Col flex="none">
				<Space size="middle">
					{/* Refresh button */}
					<Button
						icon={<ReloadOutlined />}
						onClick={onRefresh}
						loading={loading}
						size="middle"
						title="Refresh data"
					>
						Refresh
					</Button>

					{/* Create button */}
					{!hideButton && (
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={onCreate}
							size="middle"
						>
							{buttonLabel}
						</Button>
					)}
				</Space>
			</Col>
		</Row>
	);
}
