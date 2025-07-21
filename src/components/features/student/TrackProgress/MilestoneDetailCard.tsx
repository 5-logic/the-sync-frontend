'use client';

import { DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import {
	MilestoneHeader,
	MilestoneSubmissionForm,
	SubmittedFilesView,
} from '@/components/features/student/TrackProgress/MilestoneDetail';
import { useMilestoneProgress } from '@/hooks/student';
import { useStudentGroupStatus } from '@/hooks/student/useStudentGroupStatus';
import { StorageService } from '@/lib/services/storage.service';
import { showNotification } from '@/lib/utils/notification';
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
	const [updateMode, setUpdateMode] = useState<Record<string, boolean>>({});
	const {
		milestones,
		loading,
		submissions,
		updateMilestoneFiles,
		submitMilestone,
		updateMilestoneSubmission,
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

	const removeFile = (
		milestoneId: string,
		fileName: string,
		fileSize: number,
	) => {
		const submission = submissions[milestoneId];
		if (!submission?.files) return;

		const newFiles = submission.files.filter(
			(file) => !(file.name === fileName && file.size === fileSize),
		);
		updateMilestoneFiles(milestoneId, newFiles);
	};

	const handleSubmit = async (
		milestoneId: string,
		isUpdate: boolean = false,
	) => {
		const submission = submissions[milestoneId];
		if (!submission?.files?.length) {
			message.warning('Please upload files before submitting');
			return;
		}

		// Find the milestone to check if submission is still allowed
		const milestone = milestones.find((m) => m.id.toString() === milestoneId);
		if (milestone && !canSubmit(milestone)) {
			message.error(getSubmissionMessage(milestone));
			return;
		}

		ConfirmationModal.show({
			title: isUpdate ? 'Confirm Update' : 'Confirm Submission',
			message: isUpdate
				? 'Are you sure you want to update this submission?'
				: 'Are you sure you want to submit these files?',
			details: isUpdate
				? 'This will replace your previous submission files.'
				: 'Once submitted, you cannot make changes to this milestone submission.',
			noteType: 'warning',
			note: 'Please make sure all files are correct before proceeding.',
			okText: isUpdate ? 'Update' : 'Submit',
			cancelText: 'Cancel',
			okType: 'primary',
			onOk: async () => {
				try {
					if (isUpdate) {
						await updateMilestoneSubmission(milestoneId);
					} else {
						await submitMilestone(milestoneId);
					}
					// Reset update mode after successful submission
					setUpdateMode((prev) => ({
						...prev,
						[milestoneId]: false,
					}));
				} catch {
					// Errors are handled in the hook
				}
			},
		});
	};

	const canSubmit = (milestone: Milestone): boolean => {
		// Can only submit before milestone start date (as per API rules)
		const now = dayjs();
		const startDate = dayjs(milestone.startDate);

		// Only group leaders can submit and must be before start date
		return isLeader && now.isBefore(startDate);
	};

	const getSubmissionMessage = (milestone: Milestone): string => {
		const now = dayjs();
		const startDate = dayjs(milestone.startDate);
		const endDate = dayjs(milestone.endDate);

		if (!isLeader) {
			return 'Only group leaders can submit files';
		}

		if (now.isAfter(endDate)) {
			return 'This milestone has ended';
		}

		if (now.isAfter(startDate)) {
			return 'Submissions are no longer allowed after the milestone start date';
		}

		return 'Please make sure to submit your report before the deadline.';
	};

	const handleDownloadSingleFile = async (documentUrl: string) => {
		try {
			const fileName = StorageService.getFileNameFromUrl(documentUrl);

			// Create a temporary anchor element to trigger download
			const link = document.createElement('a');
			link.href = documentUrl;
			link.download = fileName;
			link.target = '_blank';
			link.style.display = 'none';

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			showNotification.success(
				'Download Started',
				`Template "${fileName}" download started successfully`,
			);
		} catch (error) {
			console.error('Failed to download document:', documentUrl, error);
			showNotification.error(
				'Download Failed',
				'Failed to download template document',
			);
		}
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
							header={<MilestoneHeader milestone={milestone} />}
						>
							{/* Download Templates Section */}
							{milestone.documents && milestone.documents.length > 0 && (
								<div style={{ marginBottom: 16 }}>
									<div
										style={{
											fontSize: 14,
											fontWeight: 500,
											color: '#333',
											marginBottom: 8,
										}}
									>
										📎 Submission Templates ({milestone.documents.length} file
										{milestone.documents.length > 1 ? 's' : ''}):
									</div>

									{/* Individual file download buttons */}
									<div
										style={{
											display: 'flex',
											flexDirection: 'column',
											gap: 4,
											backgroundColor: '#f9f9f9',
											padding: '8px 12px',
											borderRadius: 6,
											border: '1px solid #e8e8e8',
										}}
									>
										{milestone.documents.map((documentUrl, index) => {
											const fileName =
												StorageService.getFileNameFromUrl(documentUrl);
											return (
												<Button
													key={`${milestone.id}-doc-${index}`}
													type="text"
													size="small"
													icon={<DownloadOutlined />}
													onClick={() => handleDownloadSingleFile(documentUrl)}
													style={{
														justifyContent: 'flex-start',
														color: '#1890ff',
														textAlign: 'left',
														height: 'auto',
														padding: '6px 8px',
														fontWeight: 500,
													}}
												>
													{fileName}
												</Button>
											);
										})}
									</div>
								</div>
							)}

							{/* Check if milestone has been submitted and not in update mode */}
							{(submission?.documents?.length ?? 0) > 0 &&
							!updateMode[milestone.id] ? (
								<SubmittedFilesView
									documents={submission.documents || []}
									canSubmit={submissionCanSubmit}
									onUpdateMode={() => {
										// Enable update mode to show upload interface
										setUpdateMode((prev) => ({
											...prev,
											[milestone.id]: true,
										}));
										// Clear current files to allow new upload
										updateMilestoneFiles(milestone.id, []);
									}}
								/>
							) : (
								<MilestoneSubmissionForm
									files={submission?.files || []}
									canSubmit={submissionCanSubmit}
									isSubmitting={isSubmitting}
									isUpdateMode={updateMode[milestone.id] || false}
									hasSubmittedDocuments={
										(submission?.documents?.length ?? 0) > 0
									}
									submissionMessage={getSubmissionMessage(milestone)}
									onFileChange={(info) => handleFileChange(info, milestone.id)}
									onRemoveFile={(fileName, fileSize) =>
										removeFile(milestone.id, fileName, fileSize)
									}
									onCancelUpdate={() => {
										// Exit update mode and restore original files
										setUpdateMode((prev) => ({
											...prev,
											[milestone.id]: false,
										}));
										// Clear the temporary files to go back to view mode
										updateMilestoneFiles(milestone.id, []);
									}}
									onSubmit={() => {
										// Use updateMilestoneSubmission if already submitted, otherwise submitMilestone
										const isAlreadySubmitted =
											(submission?.documents?.length ?? 0) > 0;
										if (isAlreadySubmitted) {
											// Call update API (will show confirmation modal in handleSubmit)
											handleSubmit(milestone.id, true);
										} else {
											// Call submit API
											handleSubmit(milestone.id, false);
										}
									}}
								/>
							)}
						</Panel>
					);
				})}
			</Collapse>
		</Card>
	);
}
