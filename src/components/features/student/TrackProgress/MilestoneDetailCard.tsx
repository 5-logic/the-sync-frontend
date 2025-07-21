'use client';

import { DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import {
	MilestoneHeader,
	MilestoneSubmissionForm,
	SubmissionEditView,
	SubmittedFilesView,
} from '@/components/features/student/TrackProgress/MilestoneDetail';
import { MilestoneSubmission, useMilestoneProgress } from '@/hooks/student';
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
	const [updateExistingDocs, setUpdateExistingDocs] = useState<
		Record<string, string[]>
	>({});
	const [updateNewFiles, setUpdateNewFiles] = useState<Record<string, File[]>>(
		{},
	);
	const {
		milestones,
		loading,
		submissions,
		updateMilestoneFiles,
		submitMilestone,
		updateMilestoneSubmission,
		refetchSubmissions,
	} = useMilestoneProgress();
	const { group } = useStudentGroupStatus();

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

	const handleCustomUpdate = async (
		milestoneId: string,
		existingDocs: string[],
		newFiles: File[],
	) => {
		if (!group?.id) {
			message.error('Group information not available');
			return;
		}

		// Upload new files to Supabase
		const uploadPromises = newFiles.map((file) =>
			StorageService.uploadFile(file, 'milestone-submissions'),
		);

		const newDocumentUrls = await Promise.all(uploadPromises);

		// Combine existing docs and new uploaded docs
		const allDocumentUrls = [...existingDocs, ...newDocumentUrls];

		// Update submission via API (using the service directly)
		const groupService = (await import('@/lib/services/groups.service'))
			.default;
		await groupService.updateMilestoneSubmission(
			group.id,
			milestoneId,
			allDocumentUrls,
		);

		showNotification.success(
			'Success',
			'Milestone submission updated successfully',
		);

		// Refresh submissions to get updated data
		await refetchSubmissions();
	};

	const validateSubmission = (
		customExistingDocs?: string[],
		customNewFiles?: File[],
		milestoneId?: string,
	): string | null => {
		const filesToSubmit =
			customNewFiles || submissions[milestoneId || '']?.files || [];

		// For custom update mode, check if we have either existing docs or new files
		if (customExistingDocs !== undefined || customNewFiles !== undefined) {
			const hasExistingDocs = (customExistingDocs?.length ?? 0) > 0;
			const hasNewFiles = filesToSubmit.length > 0;

			if (!hasExistingDocs && !hasNewFiles) {
				return 'Please keep at least one existing file or add new files';
			}
		} else if (!filesToSubmit.length) {
			return 'Please upload files before submitting';
		}

		return null;
	};

	const buildConfirmationDetails = (
		isUpdate: boolean,
		customExistingDocs?: string[],
		customNewFiles?: File[],
	): string => {
		if (!isUpdate) {
			return 'Once submitted, you cannot make changes to this milestone submission.';
		}

		if (customExistingDocs === undefined && customNewFiles === undefined) {
			return 'This will replace your previous submission files.';
		}

		const hasExistingDocs = (customExistingDocs?.length ?? 0) > 0;
		const hasNewFiles = (customNewFiles?.length ?? 0) > 0;

		if (hasExistingDocs && hasNewFiles) {
			return 'This will update your submission with the selected existing files and new uploads.';
		}

		if (hasExistingDocs && !hasNewFiles) {
			return 'This will update your submission with only the selected existing files.';
		}

		return 'This will replace your previous submission with only the new files.';
	};

	const handleSubmit = async (
		milestoneId: string,
		isUpdate: boolean = false,
		customExistingDocs?: string[],
		customNewFiles?: File[],
	) => {
		// Validate submission
		const validationError = validateSubmission(
			customExistingDocs,
			customNewFiles,
			milestoneId,
		);
		if (validationError) {
			message.warning(validationError);
			return;
		}

		// Find the milestone to check if submission is still allowed
		const milestone = milestones.find((m) => m.id.toString() === milestoneId);
		if (milestone && !canSubmit(milestone)) {
			message.error(getSubmissionMessage(milestone));
			return;
		}

		const confirmTitle = isUpdate ? 'Confirm Update' : 'Confirm Submission';
		const confirmMessage = isUpdate
			? 'Are you sure you want to update this submission?'
			: 'Are you sure you want to submit these files?';

		const confirmDetails = buildConfirmationDetails(
			isUpdate,
			customExistingDocs,
			customNewFiles,
		);

		ConfirmationModal.show({
			title: confirmTitle,
			message: confirmMessage,
			details: confirmDetails,
			noteType: 'warning',
			note: 'Please make sure all files are correct before proceeding.',
			okText: isUpdate ? 'Update' : 'Submit',
			cancelText: 'Cancel',
			okType: 'primary',
			onOk: async () => {
				try {
					if (isUpdate) {
						// Handle custom update with existing docs and new files
						if (
							customExistingDocs !== undefined ||
							customNewFiles !== undefined
						) {
							await handleCustomUpdate(
								milestoneId,
								customExistingDocs || [],
								customNewFiles || [],
							);
						} else {
							await updateMilestoneSubmission(milestoneId);
						}
					} else {
						await submitMilestone(milestoneId);
					}
					// Reset update mode after successful submission
					setUpdateMode((prev) => ({
						...prev,
						[milestoneId]: false,
					}));
					// Clear update state if in update mode
					if (customExistingDocs || customNewFiles) {
						setUpdateExistingDocs((prev) => ({
							...prev,
							[milestoneId]: [],
						}));
						setUpdateNewFiles((prev) => ({
							...prev,
							[milestoneId]: [],
						}));
					}
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

	const renderMilestoneContent = (
		milestone: Milestone,
		submission: MilestoneSubmission | undefined,
		isSubmitting: boolean,
		submissionCanSubmit: boolean,
	) => {
		const hasSubmittedDocuments = (submission?.documents?.length ?? 0) > 0;
		const isInUpdateMode = updateMode[milestone.id];

		// Case 1: Has submitted documents but not in update mode
		if (hasSubmittedDocuments && !isInUpdateMode) {
			return (
				<SubmittedFilesView
					documents={submission?.documents || []}
					canSubmit={submissionCanSubmit}
					onUpdateMode={() => {
						// Enable update mode and initialize with existing documents
						setUpdateMode((prev) => ({
							...prev,
							[milestone.id]: true,
						}));
						// Initialize existing docs and clear new files
						setUpdateExistingDocs((prev) => ({
							...prev,
							[milestone.id]: submission?.documents || [],
						}));
						setUpdateNewFiles((prev) => ({
							...prev,
							[milestone.id]: [],
						}));
					}}
				/>
			);
		}

		// Case 2: In update mode and has submitted documents
		if (isInUpdateMode && hasSubmittedDocuments) {
			const existingDocuments =
				updateExistingDocs[milestone.id]?.length > 0
					? updateExistingDocs[milestone.id]
					: submission?.documents || [];

			return (
				<SubmissionEditView
					existingDocuments={existingDocuments}
					newFiles={updateNewFiles[milestone.id] || []}
					onExistingDocumentsChange={(documents) => {
						setUpdateExistingDocs((prev) => ({
							...prev,
							[milestone.id]: documents,
						}));
					}}
					onNewFilesChange={(files) => {
						setUpdateNewFiles((prev) => ({
							...prev,
							[milestone.id]: files,
						}));
					}}
					onSubmit={() => {
						// Handle update submission with existing + new files
						const existingDocs = updateExistingDocs[milestone.id] || [];
						const newFiles = updateNewFiles[milestone.id] || [];

						// Validate that there are files to submit
						if (existingDocs.length === 0 && newFiles.length === 0) {
							message.warning('Please keep at least one file or add new files');
							return;
						}

						handleSubmit(milestone.id.toString(), true, existingDocs, newFiles);
					}}
					onCancel={() => {
						// Exit update mode and clear temporary state
						setUpdateMode((prev) => ({
							...prev,
							[milestone.id]: false,
						}));
						setUpdateExistingDocs((prev) => ({
							...prev,
							[milestone.id]: [],
						}));
						setUpdateNewFiles((prev) => ({
							...prev,
							[milestone.id]: [],
						}));
					}}
					isSubmitting={isSubmitting}
					disabled={!submissionCanSubmit}
				/>
			);
		}

		// Case 3: Default - regular submission form
		return (
			<MilestoneSubmissionForm
				files={submission?.files || []}
				canSubmit={submissionCanSubmit}
				isSubmitting={isSubmitting}
				isUpdateMode={isInUpdateMode || false}
				hasSubmittedDocuments={hasSubmittedDocuments}
				submissionMessage={getSubmissionMessage(milestone)}
				onFileChange={(info) => handleFileChange(info, milestone.id)}
				onRemoveFile={(fileName, fileSize) =>
					removeFile(milestone.id, fileName, fileSize)
				}
				onCancelUpdate={() => {
					// Exit update mode and clear temporary state
					setUpdateMode((prev) => ({
						...prev,
						[milestone.id]: false,
					}));
					// Clear temporary update state
					setUpdateExistingDocs((prev) => ({
						...prev,
						[milestone.id]: [],
					}));
					setUpdateNewFiles((prev) => ({
						...prev,
						[milestone.id]: [],
					}));
				}}
				onSubmit={() => {
					const isInUpdateMode = updateMode[milestone.id];
					const isAlreadySubmitted = (submission?.documents?.length ?? 0) > 0;

					if (isInUpdateMode && isAlreadySubmitted) {
						// Handle update submission with existing + new files
						const existingDocs = updateExistingDocs[milestone.id] || [];
						const newFiles = updateNewFiles[milestone.id] || [];

						handleSubmit(milestone.id.toString(), true, existingDocs, newFiles);
					} else if (isAlreadySubmitted) {
						// Regular update
						handleSubmit(milestone.id.toString(), true);
					} else {
						// New submission
						handleSubmit(milestone.id.toString(), false);
					}
				}}
			/>
		);
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

							{/* Milestone content based on submission state */}
							{renderMilestoneContent(
								milestone,
								submission,
								isSubmitting,
								submissionCanSubmit,
							)}
						</Panel>
					);
				})}
			</Collapse>
		</Card>
	);
}
