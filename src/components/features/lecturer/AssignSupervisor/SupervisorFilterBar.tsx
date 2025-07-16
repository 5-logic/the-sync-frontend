'use client';

import { ReloadOutlined } from '@ant-design/icons';
import { Button, Col, Row, Select } from 'antd';
import { memo, useCallback } from 'react';

import GroupSearchBar from '@/components/features/lecturer/AssignSupervisor/GroupSearchBar';

const { Option } = Select;

type StatusType = 'All' | 'Finalized' | 'Incomplete' | 'Unassigned';

interface Props {
	search: string;
	onSearchChange: (val: string) => void;
	status: StatusType;
	onStatusChange: (val: StatusType) => void;
	onRefresh: () => void;
	refreshing: boolean;
	onAssignAllDrafts: () => void;
	draftCount: number;
	updating: boolean;
}

const STATUS_OPTIONS = [
	{ value: 'All' as const, label: 'All Status' },
	{ value: 'Finalized' as const, label: 'Finalized' },
	{ value: 'Incomplete' as const, label: 'Incomplete' },
	{ value: 'Unassigned' as const, label: 'Unassigned' },
];

/**
 * Optimized Filter bar component for supervisor assignment page
 * Uses React.memo and useCallback to prevent unnecessary re-renders
 */
const SupervisorFilterBar = memo<Props>(
	({
		search,
		onSearchChange,
		status,
		onStatusChange,
		onRefresh,
		refreshing,
		onAssignAllDrafts,
		draftCount,
		updating,
	}) => {
		const handleStatusChange = useCallback(
			(value: StatusType) => {
				onStatusChange(value);
			},
			[onStatusChange],
		);

		return (
			<Row
				gutter={[12, 12]}
				wrap
				align="middle"
				justify="start"
				style={{ marginBottom: 16 }}
			>
				<Col flex="auto">
					<GroupSearchBar
						value={search}
						onChange={onSearchChange}
						placeholder="Search by abbreviation, thesis title..."
					/>
				</Col>
				<Col style={{ width: 160 }}>
					<Select
						value={status}
						onChange={handleStatusChange}
						style={{ width: '100%' }}
						placeholder="Filter by status"
					>
						{STATUS_OPTIONS.map((option) => (
							<Option key={option.value} value={option.value}>
								{option.label}
							</Option>
						))}
					</Select>
				</Col>
				<Col>
					<Button
						icon={<ReloadOutlined />}
						loading={refreshing}
						onClick={onRefresh}
						title="Refresh data"
					>
						Refresh
					</Button>
				</Col>
				<Col>
					<Button
						type="primary"
						loading={updating}
						disabled={draftCount === 0}
						onClick={onAssignAllDrafts}
						style={{ color: 'white' }}
					>
						Assign All Drafts ({draftCount})
					</Button>
				</Col>
			</Row>
		);
	},
);

SupervisorFilterBar.displayName = 'SupervisorFilterBar';

export default SupervisorFilterBar;
