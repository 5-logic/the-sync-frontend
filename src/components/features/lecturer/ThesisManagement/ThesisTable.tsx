import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Table, Tag } from 'antd';

import { Thesis } from '@/schemas/thesis';

type Props = {
	data: Thesis[];
};

export default function ThesisTable({ data }: Props) {
	return (
		<Table
			dataSource={data}
			rowKey="id"
			columns={[
				{ title: 'Title', dataIndex: 'title', key: 'title' },
				{ title: 'Semester', dataIndex: 'semester', key: 'semester' },
				{
					title: 'Status',
					dataIndex: 'status',
					key: 'status',
					render: (status: string) => {
						const colorMap: Record<string, string> = {
							approved: 'green',
							rejected: 'red',
							pending: 'gold',
						};
						return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
					},
				},
				{
					title: 'Summit Date',
					dataIndex: 'submitDate',
					key: 'submitDate',
				},
				{
					title: 'Actions',
					key: 'actions',
					render: () => (
						<>
							<EditOutlined className="mr-2 cursor-pointer" />
							<EyeOutlined className="cursor-pointer" />
						</>
					),
				},
			]}
			pagination={{ pageSize: 5 }}
		/>
	);
}
