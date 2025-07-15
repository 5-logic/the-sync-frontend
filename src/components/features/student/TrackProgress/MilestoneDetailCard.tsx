'use client';

import {
	CalendarOutlined,
	CheckCircleTwoTone,
	FileTextOutlined,
	UploadOutlined,
	UserOutlined,
} from '@ant-design/icons';
import {
	Avatar,
	Button,
	Card,
	Col,
	Collapse,
	Flex,
	Row,
	Space,
	Tag,
	Typography,
	Upload,
	message,
} from 'antd';
import { useState } from 'react';

import { mockMilestoneDetails } from '@/data/milestone';

const { Panel } = Collapse;

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
		<Card
			title="Project Milestones"
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				marginBottom: 16,
			}}
		>
			<Collapse
				accordion
				defaultActiveKey={[mockMilestoneDetails[0]?.id.toString()]}
			>
				{mockMilestoneDetails.map((milestone) => (
					<Panel
						key={milestone.id}
						header={
							<Flex justify="space-between" align="center">
								<Flex align="center" gap={8}>
									<Typography.Text style={{ minWidth: 120 }}>
										{milestone.title}
									</Typography.Text>
									{getStatusTag(milestone.status)}
								</Flex>
								<Space size={4}>
									<CalendarOutlined className="text-gray-200 text-sm" />
									<Typography.Text type="secondary" style={{ fontSize: 12 }}>
										{milestone.date}
									</Typography.Text>
								</Space>
							</Flex>
						}
					>
						{/* Đã nộp */}
						{milestone.submitted ? (
							<Space direction="vertical" size={12} style={{ width: '100%' }}>
								<Flex
									justify="space-between"
									align="center"
									style={{
										backgroundColor: '#f5f5f5',
										border: '1px solid #cec7c7ff',
										padding: 12,
										borderRadius: 8,
									}}
								>
									<Flex align="center" gap={8}>
										<FileTextOutlined />
										<Typography.Text>{milestone.fileName}</Typography.Text>
									</Flex>
									<CheckCircleTwoTone twoToneColor="#52c41a" />
								</Flex>

								{milestone.feedback && (
									<Flex
										align="flex-start"
										gap={12}
										style={{
											backgroundColor: '#fafafa',
											border: '1px solid #f0f0f0',
											padding: 12,
											marginTop: 12,
											borderRadius: 8,
										}}
									>
										<Avatar icon={<UserOutlined />} />
										<Space direction="vertical" size={4}>
											<Typography.Text strong>
												{milestone.supervisor}
											</Typography.Text>
											<Typography.Paragraph style={{ margin: 0 }}>
												{milestone.feedback}
											</Typography.Paragraph>
										</Space>
									</Flex>
								)}
							</Space>
						) : (
							<Space direction="vertical" size={8} style={{ width: '100%' }}>
								<Card
									size="small"
									style={{
										backgroundColor: '#fffbe6',
										border: '1px solid #ffe58f',
										padding: 12,
									}}
								>
									<Typography.Text type="warning">
										⚠️ Please make sure to submit your report before the
										deadline.
									</Typography.Text>
								</Card>

								{/* Card chứa 2 nút */}
								<Card
									size="small"
									style={{
										backgroundColor: '#fafafa',
										border: '1px solid #d9d9d9',
										marginTop: 12,
									}}
								>
									<Row align="middle">
										<Col flex="auto">
											<Upload
												beforeUpload={(file) =>
													handleUpload(file, milestone.id)
												}
												showUploadList={false}
											>
												<Button icon={<UploadOutlined />}>Choose File</Button>
											</Upload>
										</Col>
										<Col>
											<Button
												type="primary"
												onClick={() => handleSubmit(milestone.id)}
											>
												Submit
											</Button>
										</Col>
									</Row>
								</Card>

								{/* Hiển thị tên file đã chọn */}
								{fileList[milestone.id] && (
									<Flex align="center" gap={8}>
										<FileTextOutlined />
										<Typography.Text type="secondary" style={{ fontSize: 12 }}>
											{fileList[milestone.id]}
										</Typography.Text>
									</Flex>
								)}
							</Space>
						)}
					</Panel>
				))}
			</Collapse>
		</Card>
	);
}
