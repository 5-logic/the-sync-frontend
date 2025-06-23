import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { ExtendedGroup } from '@/data/group';

interface Props {
	readonly data: ExtendedGroup[];
	readonly extraColumns?: ColumnsType<ExtendedGroup>;
	readonly showPagination?: boolean;
	readonly rowKey?: string;
}

const statusColorMap: Record<string, string> = {
	Finalized: 'green',
	Incomplete: 'orange',
	Unassigned: 'red',
};

const baseColumns: ColumnsType<ExtendedGroup> = [
	{
		title: 'Group Name',
		dataIndex: 'name',
	},
	{
		title: 'Thesis Title',
		dataIndex: 'thesisTitle',
	},
	{
		title: 'Members',
		dataIndex: 'members',
	},
	{
		title: 'Supervisor',
		dataIndex: 'supervisors',
		render: (supervisors: string[]) =>
			supervisors.length > 0 ? (
				<div>
					{supervisors.map((sup) => (
						<div key={sup}>{sup}</div>
					))}
				</div>
			) : (
				'-'
			),
	},
	{
		title: 'Status',
		dataIndex: 'status',
		render: (status: string) => (
			<Tag color={statusColorMap[status]}>{status}</Tag>
		),
	},
];

export default function GroupOverviewTable({
	data,
	extraColumns = [],
	showPagination = true,
	rowKey = 'id',
}: Props) {
	const columns = [...baseColumns, ...extraColumns];

	return (
		<Table
			rowKey={rowKey}
			columns={columns}
			dataSource={data}
			pagination={
				showPagination
					? {
							showTotal: (total, range) =>
								`${range[0]}-${range[1]} of ${total} items`,
							showSizeChanger: true,
							pageSizeOptions: ['10', '20', '50', '100'],
							defaultPageSize: 10,
						}
					: false
			}
			scroll={{ x: 'max-content' }}
		/>
	);
}
