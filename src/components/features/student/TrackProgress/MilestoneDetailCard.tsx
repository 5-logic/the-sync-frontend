'use client';

import {
	CheckCircleTwoTone,
	FileTextOutlined,
	UploadOutlined,
	UserOutlined,
} from '@ant-design/icons';
import {
	Avatar,
	Button,
	Card,
	Collapse,
	Tag,
	Typography,
	Upload,
	message,
} from 'antd';
import { useState } from 'react';

const { Panel } = Collapse;
const { Text } = Typography;

interface Milestone {
	id: number;
	title: string;
	date: string;
	status: 'Ended' | 'In Progress' | 'Upcoming';
	submitted?: boolean;
	fileName?: string;
	feedback?: string;
	supervisor?: string;
}

const mockMilestones: Milestone[] = [
	{
		id: 1,
		title: 'Submit Thesis',
		date: '2023-10-15',
		status: 'Ended',
		submitted: true,
		fileName: 'proposal_final.pdf',
		feedback: 'Well done. Your structure is clear and logic flows nicely.',
		supervisor: 'Dr. Nguyen Van A',
	},
	{
		id: 2,
		title: 'Review 1',
		date: '2023-11-15',
		status: 'Ended',
		submitted: true,
		fileName: 'review1_report.pdf',
		feedback: 'Please revise the introduction section. Too generic.',
		supervisor: 'Prof. Le Thi B',
	},
	{
		id: 3,
		title: 'Review 2',
		date: '2023-12-15',
		status: 'In Progress',
	},
	{
		id: 4,
		title: 'Review 3',
		date: '2024-03-15',
		status: 'Upcoming',
	},
	{
		id: 5,
		title: 'Final Report',
		date: '2024-05-15',
		status: 'Upcoming',
	},
];

export default function MilestoneDetailCard() {
	const [fileList, setFileList] = useState<Record<number, string>>({});

	const handleUpload = (file: File, milestoneId: number) => {
		setFileList((prev) => ({ ...prev, [milestoneId]: file.name }));
		message.success(`File ${file.name} selected`);
		return false; // Prevent auto upload
	};

	const handleSubmit = (milestoneId: number) => {
		const file = fileList[milestoneId];
		if (file) {
			message.success(`Submitted "${file}" for milestone ${milestoneId}`);
		} else {
			message.warning('Please upload a file before submitting');
		}
	};

	const getStatusTag = (status: Milestone['status']) => {
		switch (status) {
			case 'Ended':
				return <Tag color="green">Ended</Tag>;
			case 'In Progress':
				return <Tag color="blue">In Progress</Tag>;
			case 'Upcoming':
				return <Tag>Upcoming</Tag>;
		}
	};

	return (
		<Card className="mb-4" title="Project Milestones">
			<Collapse accordion defaultActiveKey={['1']}>
				{mockMilestones.map((milestone) => (
					<Panel
						key={milestone.id}
						header={milestone.title}
						extra={getStatusTag(milestone.status)}
					>
						<p>
							<strong>Due date:</strong> {milestone.date}
						</p>

						{/* Đã nộp */}
						{milestone.submitted ? (
							<>
								<div
									style={{
										backgroundColor: '#f6ffed',
										border: '1px solid #b7eb8f',
										padding: '12px',
										borderRadius: 8,
										marginBottom: 12,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<div>
										<FileTextOutlined style={{ marginRight: 8 }} />
										{milestone.fileName}
									</div>
									<CheckCircleTwoTone twoToneColor="#52c41a" />
								</div>

								{milestone.feedback && (
									<div
										style={{
											backgroundColor: '#fafafa',
											border: '1px solid #f0f0f0',
											padding: '12px',
											borderRadius: 8,
											display: 'flex',
											alignItems: 'flex-start',
											gap: 12,
										}}
									>
										<Avatar icon={<UserOutlined />} />
										<div>
											<Text strong>{milestone.supervisor}</Text>
											<p style={{ marginTop: 4 }}>{milestone.feedback}</p>
										</div>
									</div>
								)}
							</>
						) : (
							// Chưa nộp
							<>
								<Upload
									beforeUpload={(file) => handleUpload(file, milestone.id)}
									showUploadList={false}
								>
									<Button icon={<UploadOutlined />}>Choose File</Button>
								</Upload>

								{fileList[milestone.id] && (
									<div className="mt-2 flex items-center gap-2">
										<FileTextOutlined /> {fileList[milestone.id]}
									</div>
								)}

								<Button
									type="primary"
									className="mt-2"
									onClick={() => handleSubmit(milestone.id)}
								>
									Submit
								</Button>
							</>
						)}
					</Panel>
				))}
			</Collapse>
		</Card>
	);
}
