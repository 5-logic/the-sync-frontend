'use client';

import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { ExtendedGroup } from '@/data/group';

type Props = Readonly<{
	reviewTitle: string;
	data: ExtendedGroup[];
}>;

const columns: ColumnsType<ExtendedGroup> = [
	{
		title: 'Group Name',
		dataIndex: 'name',
	},
	{
		title: 'Group Code',
		dataIndex: 'code',
	},
	{
		title: 'Thesis Title',
		dataIndex: 'thesisTitle',
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
];

export default function ReviewGroupTable({ reviewTitle, data }: Props) {
	return (
		<Card title={`Groups Assigned - ${reviewTitle}`} style={{ marginTop: 24 }}>
			<Table
				dataSource={data}
				columns={columns}
				rowKey="code"
				pagination={TablePagination}
			/>
		</Card>
	);
}
