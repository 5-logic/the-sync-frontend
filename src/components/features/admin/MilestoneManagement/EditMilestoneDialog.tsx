'use client';

import { Form, Modal } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

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

	// State for tracking form changes
	const [hasChanges, setHasChanges] = useState(false);
	const [originalValues, setOriginalValues] = useState<Record<string, unknown>>(
		{},
	);

	// Reset form and documents when dialog closes
	useEffect(() => {
		if (!open) {
			form.resetFields();
			setExistingDocuments([]);
			setNewFiles([]);
			setHasChanges(false);
			setOriginalValues({});
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

		// Set original values for comparison
		if (milestone && open) {
			const originalData = {
				milestoneName: milestone.name,
				note: milestone.note || '',
				documents: milestone.documents || [],
			};
			setOriginalValues(originalData);
			setHasChanges(false);
		}
	}, [milestone, open]);

	// Function to check if form values have changed
	const checkForChanges = useCallback(() => {
		if (!milestone) return;

		const currentValues = form.getFieldsValue();
		const currentDocuments = [
			...existingDocuments,
			...newFiles.map(() => 'new-file'),
		];

		const hasFormChanges =
			currentValues.milestoneName !== originalValues.milestoneName ||
			(currentValues.note || '') !== originalValues.note;

		const originalDocuments = (originalValues.documents as string[]) || [];
		const sortedCurrentDocuments = [...currentDocuments].sort((a, b) =>
			a.localeCompare(b),
		);
		const sortedOriginalDocuments = [...originalDocuments].sort((a, b) =>
			a.localeCompare(b),
		);
		const hasDocumentChanges =
			JSON.stringify(sortedCurrentDocuments) !==
				JSON.stringify(sortedOriginalDocuments) || newFiles.length > 0;

		const hasAnyChanges = hasFormChanges || hasDocumentChanges;
		setHasChanges(hasAnyChanges);
	}, [milestone, form, existingDocuments, newFiles, originalValues]);

	// Check for changes when form values change
	useEffect(() => {
		if (milestone && open) {
			checkForChanges();
		}
	}, [milestone, open, existingDocuments, newFiles, checkForChanges]);

	// Helper function to validate milestone editing permissions
	const validateEditPermissions = (): boolean => {
		if (!milestone) return false;

		// Check if milestone has already started
		if (dayjs(milestone.startDate).isBefore(dayjs(), 'day')) {
			return false;
		}

		// Check if semester status allows editing
		const semester = semesters.find((s) => s.id === milestone.semesterId);
		return !semester || semester.status === 'Ongoing';
	};

	// Helper function to handle document deletions
	const handleDocumentDeletions = async (
		documentsToDelete: string[],
	): Promise<void> => {
		if (documentsToDelete.length === 0) return;

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
	};

	// Helper function to handle new file uploads
	const handleNewFileUploads = async (files: File[]): Promise<string[]> => {
		if (files.length === 0) return [];

		const uploadPromises = files.map((file) =>
			StorageService.uploadFile(file, 'milestone-templates'),
		);
		const newDocumentUrls = await Promise.all(uploadPromises);

		showNotification.success(
			'Upload Success',
			`${files.length} file(s) uploaded successfully`,
		);

		return newDocumentUrls;
	};

	// Helper function to process document updates
	const processDocumentUpdates = async (): Promise<string[]> => {
		if (existingDocuments.length === 0 && newFiles.length === 0) {
			return [];
		}

		const documentsToDelete =
			milestone?.documents?.filter((url) => !existingDocuments.includes(url)) ||
			[];

		// Handle deletions
		await handleDocumentDeletions(documentsToDelete);

		// Handle new uploads
		try {
			const newDocumentUrls = await handleNewFileUploads(newFiles);
			return [...existingDocuments, ...newDocumentUrls];
		} catch (error) {
			showNotification.error(
				'Upload Failed',
				'Failed to upload some files. Please try again.',
			);
			console.error('File upload failed:', error);
			throw error; // Re-throw to prevent milestone update
		}
	};

	const handleSubmit = async () => {
		if (!validateEditPermissions() || !hasChanges) {
			return;
		}

		try {
			const values = await form.validateFields();
			const milestoneData: Partial<MilestoneUpdate> = {};

			// Only include changed fields
			if (values.milestoneName !== originalValues.milestoneName) {
				milestoneData.name = values.milestoneName;
			}

			if ((values.note || '') !== originalValues.note) {
				milestoneData.note = values.note || undefined;
			}

			// Handle document changes
			const currentDocuments = [
				...existingDocuments,
				...newFiles.map(() => 'new-file'),
			];
			const originalDocuments = (originalValues.documents as string[]) || [];
			const sortedCurrentDocuments = [...currentDocuments].sort((a, b) =>
				a.localeCompare(b),
			);
			const sortedOriginalDocuments = [...originalDocuments].sort((a, b) =>
				a.localeCompare(b),
			);
			const hasDocumentChanges =
				JSON.stringify(sortedCurrentDocuments) !==
					JSON.stringify(sortedOriginalDocuments) || newFiles.length > 0;

			if (hasDocumentChanges) {
				// Process document updates
				const finalDocuments = await processDocumentUpdates();
				milestoneData.documents =
					finalDocuments.length > 0 ? finalDocuments : undefined;
			}

			// Only proceed if there are actually changes to send
			if (Object.keys(milestoneData).length === 0) {
				return;
			}

			const success = await updateMilestone(milestone!.id, milestoneData);
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
				disabled: isEditDisabled || !hasChanges,
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
				onValuesChange={checkForChanges}
				// Note: Files are not passed to edit mode for now
			/>

			{/* Document management section */}
			<DocumentEditSection
				existingDocuments={existingDocuments}
				newFiles={newFiles}
				onExistingDocumentsChange={(docs) => {
					setExistingDocuments(docs);
					checkForChanges();
				}}
				onNewFilesChange={(files) => {
					setNewFiles(files);
					checkForChanges();
				}}
				disabled={isEditDisabled}
			/>
		</Modal>
	);
}
