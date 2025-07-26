import { ExportOutlined, SearchOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Input,
	Row,
	Select,
	Space,
	Table,
	Typography,
} from 'antd';
import { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { extendedGroups } from '@/data/group';

const columns = [
	{ title: 'Group Name', dataIndex: 'groupName' },
	{ title: 'Topic Title', dataIndex: 'topicTitle' },
	{ title: 'Supervisor', dataIndex: 'supervisor' },
	{ title: 'Semester', dataIndex: 'semester' },
];

const { Title, Text } = Typography;

export function GroupInfo() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedSemester, setSelectedSemester] =
		useState<string>('All semester');

	// Get unique semesters from the data
	const availableSemesters = useMemo(() => {
		const semesters = Array.from(
			new Set(extendedGroups.map((group) => group.semesterId)),
		);
		return ['All semester', ...semesters];
	}, []);

	// Filter and search data
	const filteredData = useMemo(() => {
		return extendedGroups
			.filter((group) => {
				if (
					selectedSemester !== 'All semester' &&
					group.semesterId !== selectedSemester
				) {
					return false;
				}

				if (searchTerm) {
					const searchLower = searchTerm.toLowerCase();
					return (
						group.name.toLowerCase().includes(searchLower) ||
						group.thesisTitle.toLowerCase().includes(searchLower) ||
						group.supervisors.some((supervisor) =>
							supervisor.toLowerCase().includes(searchLower),
						)
					);
				}

				return true;
			})
			.map((group) => ({
				groupName: group.name,
				topicTitle: group.thesisTitle,
				supervisor: group.supervisors.join(', ') || 'Not assigned',
				semester: group.semesterId,
			}));
	}, [searchTerm, selectedSemester]);

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

			<Row gutter={16} style={{ marginTop: 20, marginBottom: 16 }}>
				<Col flex="auto">
					<Input
						placeholder="Search thesis, group, supervisor"
						prefix={<SearchOutlined />}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</Col>
				<Col flex="200px">
					<Select
						value={selectedSemester}
						onChange={setSelectedSemester}
						style={{ width: '100%' }}
					>
						{availableSemesters.map((semester) => (
							<Select.Option key={semester} value={semester}>
								{semester}
							</Select.Option>
						))}
					</Select>
				</Col>
				<Col flex="200px">
					<Button icon={<ExportOutlined />} style={{ width: '100%' }}>
						Export Statistic
					</Button>
				</Col>
			</Row>
			<Table
				columns={columns}
				dataSource={filteredData}
				pagination={TablePagination}
				rowKey="groupName"
			/>
		</Card>
	);
}
