import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Select, Space, Table, Typography } from 'antd';
import { useMemo, useState } from 'react';

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
				// Filter by semester
				if (
					selectedSemester !== 'All semester' &&
					group.semesterId !== selectedSemester
				) {
					return false;
				}

				// Filter by search term
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

			<div className="flex justify-between items-center mt-5 mb-4">
				<Input
					placeholder="Search thesis, group, supervisor"
					style={{ width: 300 }}
					prefix={<SearchOutlined />}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<div className="flex gap-2">
					<Select
						value={selectedSemester}
						onChange={setSelectedSemester}
						style={{ width: 130 }}
					>
						{availableSemesters.map((semester) => (
							<Select.Option key={semester} value={semester}>
								{semester}
							</Select.Option>
						))}
					</Select>
					<Button icon={<DownloadOutlined />}>Export Statistic</Button>
				</div>
			</div>
			<Table
				columns={columns}
				dataSource={filteredData}
				pagination={{ pageSize: 5 }}
				rowKey="groupName"
			/>
		</Card>
	);
}
