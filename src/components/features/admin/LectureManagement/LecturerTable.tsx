'use client';

import { Switch, Table, Tag } from 'antd';

import { Lecturer } from './LecturerManagement';

interface Props {
	data: Lecturer[];
	onTogglePermission: (key: string) => void;
}

export default function LecturerTable({ data, onTogglePermission }: Props) {
	const columns = [
		{ title: 'Name', dataIndex: 'name', key: 'name' },
		{ title: 'Email', dataIndex: 'email', key: 'email' },
		{ title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber' },
		{
			title: 'Instruction Groups',
			dataIndex: 'instructionGroups',
			key: 'instructionGroups',
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag>
			),
		},
		{
			title: 'Special Permission',
			dataIndex: 'specialPermission',
			key: 'specialPermission',
			render: (_: string, record: Lecturer) => (
				<Switch
					checked={record.specialPermission}
					onChange={() => onTogglePermission(record.key)}
				/>
			),
		},
	];

	return (
		<Table
			columns={columns}
			dataSource={data}
			pagination={{ pageSize: 10 }}
			rowKey="key"
		/>
	);
}
