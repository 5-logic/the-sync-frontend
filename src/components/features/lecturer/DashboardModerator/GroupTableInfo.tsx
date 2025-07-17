import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Select, Table } from 'antd';

import { groupTableData } from '@/data/moderatorStats';

const columns = [
	{ title: 'Group Name', dataIndex: 'groupName' },
	{ title: 'Topic Title', dataIndex: 'topicTitle' },
	{ title: 'Supervisor', dataIndex: 'supervisor' },
	{ title: 'Semester', dataIndex: 'semester' },
];

export function GroupInfo() {
	return (
		<div className="bg-white p-4 rounded shadow">
			<div className="flex justify-between items-center mb-4">
				<Input
					placeholder="Search thesis, group, supervisor"
					style={{ width: 300 }}
					prefix={<SearchOutlined />}
				/>
				<div className="flex gap-2">
					<Select defaultValue="All Status" style={{ width: 120 }}>
						<Select.Option value="All Status">All Status</Select.Option>
						<Select.Option value="Approved">Approved</Select.Option>
						<Select.Option value="Rejected">Rejected</Select.Option>
					</Select>
					<Select defaultValue="Summer 2025" style={{ width: 130 }}>
						<Select.Option value="Summer 2025">Summer 2025</Select.Option>
					</Select>
					<Button icon={<DownloadOutlined />}>Export Statistic</Button>
				</div>
			</div>
			<Table
				columns={columns}
				dataSource={groupTableData}
				pagination={{ pageSize: 5 }}
				rowKey="groupName"
			/>
		</div>
	);
}
