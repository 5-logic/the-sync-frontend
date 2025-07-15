'use client';

import { Col, Row, Select } from 'antd';
import { memo, useCallback } from 'react';

import GroupSearchBar from '@/components/features/lecturer/AssignSupervisor/GroupSearchBar';

const { Option } = Select;

type StatusType = 'All' | 'Finalized' | 'Incomplete' | 'Unassigned';

interface Props {
	search: string;
	onSearchChange: (val: string) => void;
	status: StatusType;
	onStatusChange: (val: StatusType) => void;
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
	({ search, onSearchChange, status, onStatusChange }) => {
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
			</Row>
		);
	},
);

SupervisorFilterBar.displayName = 'SupervisorFilterBar';

export default SupervisorFilterBar;
