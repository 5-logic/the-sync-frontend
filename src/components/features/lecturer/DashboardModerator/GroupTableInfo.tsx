import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Select, Space, Table, Typography } from 'antd';

import { extendedGroups } from '@/data/group';

const columns = [
	{ title: 'Group Name', dataIndex: 'groupName' },
	{ title: 'Topic Title', dataIndex: 'topicTitle' },
	{ title: 'Supervisor', dataIndex: 'supervisor' },
	{ title: 'Semester', dataIndex: 'semester' },
];

// Transform the data from extendedGroups to match table structure
const groupTableData = extendedGroups.map((group) => ({
	groupName: group.name,
	topicTitle: group.thesisTitle,
	supervisor: group.supervisors.join(', ') || 'Not assigned',
	semester: group.semesterId,
}));

const { Title, Text } = Typography;
export function GroupInfo() {
	return (
		<Card>
			<Space direction="vertical" size="small" style={{ width: '100%' }}>
				<Title level={4} style={{ margin: 0 }}>
					Groups Table
				</Title>
				<Text type="secondary">
					List of student groups that have selected and been assigned thesis
					topics.
				</Text>
			</Space>

			<div className="flex justify-between items-center mb-4">
				<Input
					placeholder="Search thesis, group, supervisor"
					style={{ width: 300 }}
					prefix={<SearchOutlined />}
				/>
				<div className="flex gap-2">
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
		</Card>
	);
}
