'use client';

import { Form, Modal } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { DocumentEditSection } from '@/components/features/admin/MilestoneManagement/DocumentEditSection';
import MilestoneForm from '@/components/features/admin/MilestoneManagement/MilestoneForm';
import { StorageService } from '@/lib/services/storage.service';
import { showNotification } from '@/lib/utils/notification';
import { Milestone, MilestoneUpdate } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';
import { useMilestoneStore } from '@/store';

type Props = Readonly<{
	open: boolean;
	milestone: Milestone | null;
	semesters: Semester[];
	existingMilestones: Milestone[];
	onClose: () => void;
}>;

export default function EditMilestoneDialog({
	open,
	milestone,
	semesters,
	existingMilestones,
	onClose,
}: Props) {
	const [form] = Form.useForm();
	const { updating, updateMilestone } = useMilestoneStore();

	// State for managing documents
	const [existingDocuments, setExistingDocuments] = useState<string[]>([]);
	const [newFiles, setNewFiles] = useState<File[]>([]);

	// Reset form and documents when dialog closes
	useEffect(() => {
		if (!open) {
			form.resetFields();
			setExistingDocuments([]);
			setNewFiles([]);
		}
	}, [open, form]);

	// Initialize documents when milestone changes
	useEffect(() => {
		if (milestone?.documents) {
			setExistingDocuments(milestone.documents);
		} else {
			setExistingDocuments([]);
		}
		setNewFiles([]); // Reset new files when milestone changes
	}, [milestone]);
	const handleSubmit = async () => {
		if (!milestone) return;

		// Check if milestone has already started
		if (dayjs(milestone.startDate).isBefore(dayjs(), 'day')) {
			return;
		}

		// Check if semester status allows editing
		const semester = semesters.find((s) => s.id === milestone.semesterId);
		if (semester && semester.status !== 'Ongoing') {
			return;
		}

		try {
			const values = await form.validateFields();

			// Convert date range to individual dates
			const duration = values.duration ?? [];
			const [startDate, endDate] = duration;

			let finalDocuments: string[] = [];

			// Handle documents update
			if (existingDocuments.length > 0 || newFiles.length > 0) {
				// Delete documents that were removed from existingDocuments
				const documentsToDelete =
					milestone.documents?.filter(
						(url) => !existingDocuments.includes(url),
					) || [];

				console.log('🔍 Debug Documents Update:', {
					originalDocuments: milestone.documents,
					existingDocuments,
					newFiles: newFiles.map((f) => f.name),
					documentsToDelete,
				});

				// Delete removed documents from Supabase
				if (documentsToDelete.length > 0) {
					try {
						await Promise.all(
							documentsToDelete.map((url) => StorageService.deleteFile(url)),
						);
						showNotification.success(
							'Delete Success',
							`${documentsToDelete.length} document(s) deleted successfully`,
						);
					} catch (error) {
						console.error('Failed to delete some documents:', error);
						// Continue with update even if some deletes failed
					}
				}

				// Upload new files if any
				if (newFiles.length > 0) {
					try {
						const uploadPromises = newFiles.map((file) =>
							StorageService.uploadFile(file, 'milestone-templates'),
						);
						const newDocumentUrls = await Promise.all(uploadPromises);

						console.log('✅ New documents uploaded:', newDocumentUrls);

						showNotification.success(
							'Upload Success',
							`${newFiles.length} file(s) uploaded successfully`,
						);

						// Combine existing documents with new uploaded documents
						finalDocuments = [...existingDocuments, ...newDocumentUrls];
					} catch (error) {
						showNotification.error(
							'Upload Failed',
							'Failed to upload some files. Please try again.',
						);
						console.error('File upload failed:', error);
						return; // Don't proceed with milestone update if upload fails
					}
				} else {
					// Only existing documents, no new uploads
					finalDocuments = existingDocuments;
				}
			}

			console.log('📄 Final documents to send:', finalDocuments);

			const milestoneData: MilestoneUpdate = {
				name: values.milestoneName,
				startDate: startDate?.toDate(),
				endDate: endDate?.toDate(),
				documents: finalDocuments.length > 0 ? finalDocuments : undefined,
				// Don't update semesterId since it's not editable
			};

			console.log('🚀 Milestone update data:', milestoneData);

			const success = await updateMilestone(milestone.id, milestoneData);
			if (success) {
				onClose();
			}
		} catch (error) {
			console.error('Form validation failed:', error);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		onClose();
	};
	// Check if milestone has started or semester is not ongoing
	const milestoneHasStarted = milestone
		? dayjs(milestone.startDate).isBefore(dayjs(), 'day')
		: false;

	const semester = milestone
		? semesters.find((s) => s.id === milestone.semesterId)
		: null;
	const semesterNotOngoing = semester ? semester.status !== 'Ongoing' : false;

	const isEditDisabled = milestoneHasStarted ?? semesterNotOngoing;

	return (
		<Modal
			title="Edit Milestone"
			open={open}
			onOk={handleSubmit}
			onCancel={handleCancel}
			confirmLoading={updating}
			okText="Update"
			cancelText="Cancel"
			width={600}
			destroyOnHidden
			okButtonProps={{
				disabled: isEditDisabled,
			}}
			centered
		>
			{(milestoneHasStarted || semesterNotOngoing) && (
				<div
					style={{
						padding: '12px',
						marginBottom: '16px',
						backgroundColor: '#fff7e6',
						border: '1px solid #ffd591',
						borderRadius: '6px',
						color: '#d46b08',
					}}
				>
					⚠️
					{milestoneHasStarted
						? 'This milestone has already started and cannot be edited.'
						: 'This milestone cannot be edited because the semester is not in Ongoing status.'}
				</div>
			)}
			<MilestoneForm
				form={form}
				semesters={semesters}
				existingMilestones={existingMilestones}
				milestone={milestone}
				disabled={isEditDisabled}
				showSemesterField={false}
				// Note: Files are not passed to edit mode for now
			/>

			{/* Document management section */}
			<DocumentEditSection
				existingDocuments={existingDocuments}
				newFiles={newFiles}
				onExistingDocumentsChange={setExistingDocuments}
				onNewFilesChange={setNewFiles}
				disabled={isEditDisabled}
			/>
		</Modal>
	);
}
