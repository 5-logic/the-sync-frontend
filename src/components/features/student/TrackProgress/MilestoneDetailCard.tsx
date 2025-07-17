'use client';

import {
	CalendarOutlined,
	CheckCircleTwoTone,
	DeleteOutlined,
	ExclamationCircleOutlined,
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
	Spin,
	Tag,
	Typography,
	Upload,
	message,
} from 'antd';
import dayjs from 'dayjs';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import { FormLabel } from '@/components/common/FormLabel';
import { useMilestoneProgress } from '@/hooks/student';
import { useStudentGroupStatus } from '@/hooks/student/useStudentGroupStatus';
import { formatDateRange, getMilestoneStatus } from '@/lib/utils/dateFormat';
import { Milestone } from '@/schemas/milestone';

const { Panel } = Collapse;

interface UploadInfo {
	fileList: Array<{
		originFileObj?: File;
		name: string;
	}>;
}

export default function MilestoneDetailCard() {
	const { isLeader } = useStudentGroupStatus();
	const {
		milestones,
		loading,
		submissions,
		updateMilestoneFiles,
		submitMilestone,
	} = useMilestoneProgress();

	const handleFileChange = (info: UploadInfo, milestoneId: string) => {
		const { fileList } = info;
		// Convert to File objects from the upload event
		const newFiles = fileList
			.map((item) => item.originFileObj)
			.filter((file): file is File => Boolean(file));

		// Get existing files
		const existingFiles = submissions[milestoneId]?.files || [];

		// Only get the new files that were just selected (not all files from fileList)
		// We need to filter out files that are already in existing files
		const actuallyNewFiles = newFiles.filter(
			(newFile) =>
				!existingFiles.some(
					(existingFile) =>
						existingFile.name === newFile.name &&
						existingFile.size === newFile.size,
				),
		);

		// Combine existing files with only the actually new files
		const allFiles = [...existingFiles, ...actuallyNewFiles];

		updateMilestoneFiles(milestoneId, allFiles);
	};

	const removeFile = (milestoneId: string, fileIndex: number) => {
		const submission = submissions[milestoneId];
		if (!submission?.files) return;

		const newFiles = submission.files.filter((_, index) => index !== fileIndex);
		updateMilestoneFiles(milestoneId, newFiles);
	};

	const handleSubmit = async (milestoneId: string) => {
		const submission = submissions[milestoneId];
		if (!submission?.files?.length) {
			message.warning('Please upload files before submitting');
			return;
		}

		ConfirmationModal.show({
			title: 'Confirm Submission',
			message: 'Are you sure you want to submit these files?',
			details:
				'Once submitted, you cannot make changes to this milestone submission.',
			noteType: 'warning',
			note: 'Please make sure all files are correct before submitting.',
			okText: 'Submit',
			cancelText: 'Cancel',
			okType: 'primary',
			onOk: async () => {
				await submitMilestone(milestoneId);
			},
		});
	};

	const getStatusTag = (milestone: Milestone) => {
		const status = getMilestoneStatus(milestone.startDate, milestone.endDate);
		switch (status) {
			case 'Ended':
				return <Tag color="green">Ended</Tag>;
			case 'In Progress':
				return <Tag color="blue">In Progress</Tag>;
			case 'Upcoming':
				return <Tag>Upcoming</Tag>;
		}
	};

	const canSubmit = (milestone: Milestone): boolean => {
		// Can only submit before milestone start date (as per API rules)
		const now = dayjs();
		const startDate = dayjs(milestone.startDate);

		// Only group leaders can submit and must be before start date
		return isLeader && now.isBefore(startDate);
	};

	if (loading) {
		return (
			<Card
				title="Project Milestones"
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					marginBottom: 16,
				}}
			>
				<div style={{ textAlign: 'center' }}>
					<Spin size="small" />
				</div>
			</Card>
		);
	}

	if (!milestones.length) {
		return (
			<Card
				title="Project Milestones"
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					marginBottom: 16,
				}}
			>
				<div style={{ textAlign: 'center', color: '#999' }}>
					No milestones found for current semester
				</div>
			</Card>
		);
	}

	// Sort milestones by start date
	const sortedMilestones = [...milestones].sort((a, b) =>
		dayjs(a.startDate).isBefore(dayjs(b.startDate)) ? -1 : 1,
	);

	return (
		<Card
			title="Project Milestones"
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				marginBottom: 16,
			}}
		>
			<Collapse
				accordion
				defaultActiveKey={[sortedMilestones[0]?.id.toString()]}
			>
				{sortedMilestones.map((milestone) => {
					const submission = submissions[milestone.id];
					const isSubmitting = submission?.isSubmitting || false;
					const submissionCanSubmit = canSubmit(milestone);

					return (
						<Panel
							key={milestone.id}
							header={
								<Flex justify="space-between" align="center">
									<Flex align="center" gap={8}>
										<Typography.Text style={{ minWidth: 120 }}>
											{milestone.name}
										</Typography.Text>
										{getStatusTag(milestone)}
									</Flex>
									<Space size={4}>
										<CalendarOutlined className="text-gray-200 text-sm" />
										<Typography.Text type="secondary" style={{ fontSize: 12 }}>
											{formatDateRange(milestone.startDate, milestone.endDate)}
										</Typography.Text>
									</Space>
								</Flex>
							}
						>
							{/* TODO: Add logic to check if already submitted when API is ready */}
							{false ? (
								// This will be updated when we have submission data from API
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
											<Typography.Text>Submitted files</Typography.Text>
										</Flex>
										<CheckCircleTwoTone twoToneColor="#52c41a" />
									</Flex>

									{/* Feedback section - will be implemented when API is ready */}
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
											<Typography.Text strong>Supervisor</Typography.Text>
											<Typography.Paragraph style={{ margin: 0 }}>
												Feedback will be displayed here
											</Typography.Paragraph>
										</Space>
									</Flex>
								</Space>
							) : (
								<Space direction="vertical" size={8} style={{ width: '100%' }}>
									{!submissionCanSubmit && (
										<Card
											size="small"
											style={{
												backgroundColor: '#fff7e6',
												border: '1px solid #ffd591',
											}}
										>
											<Typography.Text type="warning">
												<ExclamationCircleOutlined style={{ marginRight: 6 }} />
												{getMilestoneStatus(
													milestone.startDate,
													milestone.endDate,
												) === 'Ended'
													? 'This milestone has ended'
													: getMilestoneStatus(
																milestone.startDate,
																milestone.endDate,
														  ) === 'In Progress'
														? 'Submissions are only allowed before the milestone start date'
														: 'Only group leaders can submit files'}
											</Typography.Text>
										</Card>
									)}

									{submissionCanSubmit && (
										<Card
											size="small"
											style={{
												backgroundColor: '#fffbe6',
												border: '1px solid #ffe58f',
											}}
										>
											<Typography.Text type="warning">
												<ExclamationCircleOutlined style={{ marginRight: 6 }} />
												Please make sure to submit your report before the
												deadline.
											</Typography.Text>
										</Card>
									)}

									{/* File upload section */}
									<Card
										size="small"
										style={{
											backgroundColor: '#fafafa',
											border: '1px solid #d9d9d9',
											marginTop: 12,
										}}
									>
										<Space
											direction="vertical"
											size={12}
											style={{ width: '100%' }}
										>
											<FormLabel text="Upload Files" isRequired isBold />

											{/* Files display area */}
											{submission?.files?.length > 0 ? (
												<div>
													{submission.files.map((file, index) => (
														<div
															key={index}
															style={{
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'space-between',
																padding: '12px 16px',
																border: '1px solid #d9d9d9',
																borderRadius: 8,
																backgroundColor: '#fff',
																marginBottom: 8,
															}}
														>
															<div
																style={{
																	display: 'flex',
																	alignItems: 'center',
																	gap: 8,
																}}
															>
																<FileTextOutlined
																	style={{ color: '#1890ff' }}
																/>
																<div>
																	<div style={{ fontWeight: 500 }}>
																		{file.name}
																	</div>
																	<div style={{ color: '#666', fontSize: 13 }}>
																		{(file.size / 1024 / 1024).toFixed(1)} MB
																	</div>
																</div>
															</div>
															<DeleteOutlined
																style={{
																	color: 'red',
																	cursor: 'pointer',
																	fontSize: 16,
																}}
																onClick={() => removeFile(milestone.id, index)}
															/>
														</div>
													))}

													<div style={{ marginTop: 16 }}>
														<Upload
															multiple
															onChange={(info) =>
																handleFileChange(info, milestone.id)
															}
															showUploadList={false}
															disabled={!submissionCanSubmit || isSubmitting}
														>
															<Button
																icon={<UploadOutlined />}
																disabled={!submissionCanSubmit || isSubmitting}
																loading={isSubmitting}
															>
																{isSubmitting
																	? 'Uploading...'
																	: 'Upload More Files'}
															</Button>
														</Upload>

														<div
															style={{
																fontSize: 12,
																color: '#999',
																marginTop: 4,
															}}
														>
															Support for all file types (Max: 10MB per file)
														</div>
													</div>
												</div>
											) : (
												<Upload.Dragger
													multiple
													onChange={(info) =>
														handleFileChange(info, milestone.id)
													}
													showUploadList={false}
													disabled={!submissionCanSubmit || isSubmitting}
													style={{
														border: '2px dashed #d9d9d9',
														borderRadius: 8,
														backgroundColor: '#fafafa',
													}}
												>
													<p className="ant-upload-drag-icon">
														<UploadOutlined
															style={{ fontSize: 48, color: '#d9d9d9' }}
														/>
													</p>
													<p
														className="ant-upload-text"
														style={{ fontSize: 16 }}
													>
														Click or drag files to this area to upload
													</p>
													<p
														className="ant-upload-hint"
														style={{ color: '#999' }}
													>
														Support for multiple files. Max 10MB per file.
													</p>
												</Upload.Dragger>
											)}
										</Space>
									</Card>

									{/* Submit button outside the upload area */}
									{submission?.files?.length > 0 && (
										<Row align="middle" justify="end" style={{ marginTop: 16 }}>
											<Col>
												<Button
													type="primary"
													size="large"
													onClick={() => handleSubmit(milestone.id)}
													disabled={
														!submissionCanSubmit ||
														!submission?.files?.length ||
														isSubmitting
													}
													loading={isSubmitting}
												>
													{isSubmitting ? 'Submitting...' : 'Submit Milestone'}
												</Button>
											</Col>
										</Row>
									)}
								</Space>
							)}
						</Panel>
					);
				})}
			</Collapse>
		</Card>
	);
}
