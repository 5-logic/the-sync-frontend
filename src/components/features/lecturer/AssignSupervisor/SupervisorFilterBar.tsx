'use client';

import { Col, Row, Select } from 'antd';

import GroupSearchBar from '@/components/features/lecturer/AssignSupervisor/GroupSearchBar';

const { Option } = Select;

type StatusType = 'All' | 'Finalized' | 'Incomplete' | 'Unassigned';

interface Props {
	search: string;
	onSearchChange: (val: string) => void;
	status: StatusType;
	onStatusChange: (val: StatusType) => void;
}

export default function SupervisorFilterBar({
	search,
	onSearchChange,
	status,
	onStatusChange,
}: Readonly<Props>) {
	return (
		<Row
			gutter={[12, 12]}
			wrap
			align="middle"
			justify="start"
			style={{ marginBottom: 10 }}
		>
			<Col flex="auto">
				<div style={{ height: 35 }}>
					<GroupSearchBar value={search} onChange={onSearchChange} />
				</div>
			</Col>
			<Col style={{ width: 160 }}>
				<Select
					value={status}
					onChange={onStatusChange}
					style={{ width: '100%', height: 35 }}
				>
					<Option value="All">All Status</Option>
					<Option value="Finalized">Finalized</Option>
					<Option value="Incomplete">Incomplete</Option>
					<Option value="Unassigned">Unassigned</Option>
				</Select>
			</Col>
		</Row>
	);
}
