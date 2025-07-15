import { EyeOutlined } from '@ant-design/icons';
import { Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import {
	renderSupervisors,
	statusColorMap,
} from '@/components/features/lecturer/AssignSupervisor/SupervisorColumns';
import type { ExtendedGroup } from '@/data/group';

interface Props {
	data: ReadonlyArray<ExtendedGroup>;
	onView?: (group: ExtendedGroup) => void;
}

export default function GroupAssignTable({ data, onView }: Readonly<Props>) {
	const columns: ColumnsType<ExtendedGroup> = [
		{
			title: 'Group Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Thesis Title',
			dataIndex: 'thesisTitle',
			key: 'thesisTitle',
		},
		{
			title: 'Members',
			dataIndex: 'members',
			key: 'members',
			render: (members: number) => members || 0,
		},
		{
			title: 'Supervisor',
			dataIndex: 'supervisors',
			key: 'supervisors',
			render: renderSupervisors,
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: ExtendedGroup['status']) => (
				<Tag color={statusColorMap[status] ?? 'default'}>{status}</Tag>
			),
		},
		{
			title: 'Actions',
			render: (_: unknown, record: ExtendedGroup) => (
				<Button
					type="link"
					icon={<EyeOutlined />}
					onClick={() => {
						onView?.(record);
					}}
				/>
			),
		},
	];

	return (
		<Table
			rowKey="id"
			columns={columns}
			dataSource={[...data]}
			pagination={TablePagination}
			scroll={{ x: 'max-content' }}
		/>
	);
}
