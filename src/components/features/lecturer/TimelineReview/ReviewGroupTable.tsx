'use client';

import { Card, Table } from 'antd';

import { ExtendedGroup } from '@/data/group';

interface Props {
	reviewTitle: string;
	data: ExtendedGroup[];
}

const columns = [
	{ title: 'Group Name', dataIndex: 'name' },
	{ title: 'Group Code', dataIndex: 'code' },
	{ title: 'Thesis Title', dataIndex: 'thesisTitle' },
	{
		title: 'Supervisor',
		dataIndex: 'supervisors',
		render: (supervisors: string[]) =>
			supervisors.length > 0
				? supervisors.map((sup, idx) => <div key={idx}>{sup}</div>)
				: '-',
	},
];

export default function ReviewGroupTable({ reviewTitle, data }: Props) {
	return (
		<Card title={`Groups Assigned - ${reviewTitle}`} style={{ marginTop: 24 }}>
			<Table
				dataSource={data}
				columns={columns}
				rowKey="code"
				pagination={{
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} of ${total} items`,
					showSizeChanger: true,
					pageSizeOptions: ['10', '20', '50', '100'],
					defaultPageSize: 10,
				}}
			/>
		</Card>
	);
}
