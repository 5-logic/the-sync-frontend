'use client';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tag, Tooltip } from 'antd';

type SemesterStatus = 'Not yet' | 'On-going' | 'End';

interface SemesterData {
	key: string;
	name: string;
	code: string;
	maxGroup: number;
	status: SemesterStatus;
}

const SemesterTable = ({
	statusFilter,
	searchText,
}: {
	statusFilter: SemesterStatus | 'All';
	searchText: string;
}) => {
	const data: SemesterData[] = [
		{
			key: '1',
			name: 'Fall 2025',
			code: 'FA25',
			maxGroup: 15,
			status: 'Not yet',
		},
		{
			key: '2',
			name: 'Summer 2025',
			code: 'SU25',
			maxGroup: 15,
			status: 'On-going',
		},
		{
			key: '3',
			name: 'Spring 2025',
			code: 'SP25',
			maxGroup: 15,
			status: 'End',
		},
	];

	const statusTag: Record<SemesterStatus, JSX.Element> = {
		'Not yet': <Tag color="blue">Not yet</Tag>,
		'On-going': <Tag color="green">On-going</Tag>,
		End: <Tag color="gray">End</Tag>,
	};

	const filteredData = data.filter((item) => {
		const matchStatus = statusFilter === 'All' || item.status === statusFilter;
		const matchSearch = item.name
			.toLowerCase()
			.includes(searchText.toLowerCase());
		return matchStatus && matchSearch;
	});

	const columns = [
		{ title: 'Semester Name', dataIndex: 'name', key: 'name' },
		{ title: 'Semester Code', dataIndex: 'code', key: 'code' },
		{ title: 'Max group', dataIndex: 'maxGroup', key: 'maxGroup' },
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: SemesterStatus) => statusTag[status] ?? status,
		},
		{
			title: 'Actions',
			key: 'actions',
			render: () => (
				<Space size="middle">
					<Tooltip title="Edit">
						<Button icon={<EditOutlined />} size="small" type="text" />
					</Tooltip>
					<Tooltip title="Delete">
						<Button icon={<DeleteOutlined />} size="small" danger type="text" />
					</Tooltip>
				</Space>
			),
		},
	];

	return (
		<Table
			columns={columns}
			dataSource={filteredData}
			pagination={{
				pageSize: 10,
				showTotal: (total) => `Total ${total} items`,
			}}
		/>
	);
};

export default SemesterTable;
