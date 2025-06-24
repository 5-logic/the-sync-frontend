import { Switch, Table, Tag } from 'antd';

import { TablePagination } from '@/components/common/TablePagination';
import { Lecturer } from '@/schemas/lecturer';

type Props = Readonly<{
	data: Lecturer[];
	onTogglePermission: (id: string) => void;
	loading?: boolean;
}>;

export default function LecturerTable({
	data,
	onTogglePermission,
	loading = false,
}: Props) {
	const columns = [
		{ title: 'Name', dataIndex: 'fullName', key: 'fullName' },
		{ title: 'Email', dataIndex: 'email', key: 'email' },
		{ title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber' },
		{
			title: 'Status',
			dataIndex: 'isActive',
			key: 'isActive',
			render: (isActive: boolean) => (
				<Tag color={isActive ? 'green' : 'default'}>
					{isActive ? 'Active' : 'Inactive'}
				</Tag>
			),
		},
		{
			title: 'Moderator',
			dataIndex: 'isModerator',
			key: 'isModerator',
			render: (_: boolean, record: Lecturer) => (
				<Switch
					checked={record.isModerator}
					onChange={() => onTogglePermission(record.id)}
					loading={loading}
				/>
			),
		},
	];
	return (
		<Table
			columns={columns}
			dataSource={data}
			rowKey="id"
			scroll={{ x: 'max-content' }}
			pagination={TablePagination}
			loading={loading}
		/>
	);
}
