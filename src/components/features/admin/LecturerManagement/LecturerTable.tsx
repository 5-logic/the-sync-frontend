import { Switch, Table, Tag } from 'antd';

import { Lecturer } from '@/schemas/lecturer';

type Props = Readonly<{
	data: (Lecturer & { instructionGroups: string })[];
	onTogglePermission: (id: string) => void;
}>;

export default function LecturerTable({ data, onTogglePermission }: Props) {
	const columns = [
		{ title: 'Name', dataIndex: 'fullName', key: 'fullName' },
		{ title: 'Email', dataIndex: 'email', key: 'email' },
		{ title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber' },
		{
			title: 'Instruction Groups',
			dataIndex: 'instructionGroups',
			key: 'instructionGroups',
		},
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
			render: (
				_: boolean,
				record: Lecturer & { instructionGroups: string },
			) => (
				<Switch
					checked={record.isModerator}
					onChange={() => onTogglePermission(record.id)}
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
			pagination={{
				showTotal: (total, range) =>
					`${range[0]}-${range[1]} of ${total} items`,
				showSizeChanger: true,
				pageSizeOptions: ['5', '10', '20', '50'],
			}}
		/>
	);
}
