'use client';

import { DownloadOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Input,
	Pagination,
	Progress,
	Row,
	Space,
	Steps,
	Table,
	Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

const { Title, Text } = Typography;
const { Step } = Steps;

const groupData = [
	{
		key: '1',
		name: 'Group A',
		code: 'T-AI023',
		title: 'AI for Traffic Data Analysis and Prediction System',
		members: 4,
		supervisor: 'Dr. John Nguyen',
		coSupervisor: 'Ms. Le Ha',
		submissionFile: 'research_draft.pdf',
		submissionDate: 'Oct 24, 2023',
		uploadedBy: 'Minh Tran',
		progress: 40,
		milestones: [
			'Review 1 - Completed on Dec 15, 2023',
			'Review 2 - Completed on Feb 1, 2024',
			'Review 3 - In Progress - Mar 15, 2024',
			'Final Report - Upcoming - Nov 15, 2024',
		],
		milestoneAlert: 'Milestone 2 submission due in 5 days',
	},
	{
		key: '2',
		name: 'Group B',
		code: 'T-BI107',
		title: 'Blockchain Integration for Supply Chain Management',
		members: 3,
		supervisor: 'Dr. Alice Tran',
		coSupervisor: 'Mr. Henry Vu',
		submissionFile: 'blockchain_report.pdf',
		submissionDate: 'Nov 10, 2023',
		uploadedBy: 'Linh Nguyen',
		progress: 30,
		milestones: [
			'Review 1 - Completed on Dec 20, 2023',
			'Review 2 - In Progress - Feb 15, 2024',
			'Review 3 - Upcoming - Apr 10, 2024',
			'Final Report - Upcoming - Dec 1, 2024',
		],
		milestoneAlert: 'Milestone 2 submission due in 3 days',
	},
];

export default function GroupProgressPage() {
	const [searchText, setSearchText] = useState('');
	const [currentStep] = useState(2);
	const [selectedGroup, setSelectedGroup] = useState(groupData[0]);

	const columns: ColumnsType<(typeof groupData)[0]> = [
		{
			title: 'Group Name',
			dataIndex: 'name',
		},
		{
			title: 'Thesis Code',
			dataIndex: 'code',
		},
		{
			title: 'Thesis Title',
			dataIndex: 'title',
		},
		{
			title: 'Members',
			dataIndex: 'members',
		},
		{
			title: 'Actions',
			render: (_: unknown, record: (typeof groupData)[0]) => (
				<Button
					type="link"
					icon={<EyeOutlined />}
					onClick={() => setSelectedGroup(record)}
				/>
			),
		},
	];

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Title level={2}>Group Progress</Title>
			<Input.Search
				placeholder="Search groups or topics"
				allowClear
				value={searchText}
				onChange={(e) => setSearchText(e.target.value)}
				style={{ width: 300 }}
			/>

			<Table
				columns={columns}
				dataSource={groupData.filter(
					(g) =>
						g.name.toLowerCase().includes(searchText.toLowerCase()) ||
						g.title.toLowerCase().includes(searchText.toLowerCase()),
				)}
				pagination={false}
				rowKey="key"
				rowClassName={(record) =>
					record.key === selectedGroup.key ? 'ant-table-row-selected' : ''
				}
			/>
			<Pagination current={1} total={50} pageSize={10} />

			{selectedGroup && (
				<>
					<Card
						title={`Group Name: ${selectedGroup.name} | ${selectedGroup.title}`}
					>
						<Text type="secondary">
							Supervised by: {selectedGroup.supervisor} | Co-Supervisor:{' '}
							{selectedGroup.coSupervisor}
						</Text>

						<Steps current={currentStep} style={{ marginTop: 16 }}>
							<Step title="Submit Thesis" />
							<Step title="Review 1" />
							<Step title="Review 2" />
							<Step title="Review 3" />
							<Step title="Final Report" />
						</Steps>
					</Card>

					<Row gutter={16}>
						<Col xs={24} md={16}>
							<Card title={`Milestone 3 - Review 2`}>
								<p>
									Submission file: {selectedGroup.submissionFile}{' '}
									<Button icon={<DownloadOutlined />} type="link">
										Download
									</Button>
								</p>
								<p>Submission Date: {selectedGroup.submissionDate}</p>
								<p>Uploaded by: {selectedGroup.uploadedBy}</p>
								<Input.TextArea
									rows={4}
									placeholder="Enter feedback or notes"
								/>
								<Button
									icon={<SendOutlined />}
									type="primary"
									style={{ marginTop: 12 }}
								>
									Send Feedback
								</Button>
							</Card>
						</Col>

						<Col xs={24} md={8}>
							<Card title="Progress Overview">
								<p>
									<Text type="warning">{selectedGroup.milestoneAlert}</Text>
								</p>
								<Progress percent={selectedGroup.progress} />
								<ul>
									{selectedGroup.milestones.map((m, index) => (
										<li key={index}>{m}</li>
									))}
								</ul>
								<Button type="primary">View Thesis Details</Button>
							</Card>
						</Col>
					</Row>
				</>
			)}
		</Space>
	);
}
