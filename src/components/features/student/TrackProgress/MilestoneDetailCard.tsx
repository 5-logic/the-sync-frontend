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

import { mockMilestoneDetails } from '@/data/milestone';

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
				{mockMilestoneDetails.map((milestone) => (
					<Panel
						key={milestone.id}
						header={
							<div className="flex justify-between items-center">
								<div className="flex items-center">
									<div className="min-w-[120px]">{milestone.title}</div>

									<div className="ml">{getStatusTag(milestone.status)}</div>
								</div>
								<span className="text-gray-500 text-xs">
									Due date: {milestone.date}
								</span>
							</div>
						}
					>
						{/* Đã nộp */}
						{milestone.submitted ? (
							<>
								<div
									style={{
										backgroundColor: '#f5f5f5',
										border: '1px solid #cec7c7ff',
										padding: '12px',
										borderRadius: 8,
										marginTop: 12,
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
