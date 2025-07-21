'use client';

import { Button, Card, Space } from 'antd';
import { useState } from 'react';

import { DocumentUploadButton } from '@/components/common/FileUpload/DocumentUploadButton';
import { FileItem } from '@/components/common/FileUpload/FileItem';
import { FormLabel } from '@/components/common/FormLabel';

interface UploadInfo {
	readonly fileList: Array<{
		readonly originFileObj?: File;
		readonly name: string;
		readonly status?: string;
	}>;
}

interface SubmissionEditViewProps {
	readonly existingDocuments: string[]; // URLs of existing submitted documents
	readonly newFiles: File[]; // New files to upload
	readonly onExistingDocumentsChange: (documents: string[]) => void;
	readonly onNewFilesChange: (files: File[]) => void;
	readonly onSubmit: () => void;
	readonly onCancel: () => void;
	readonly isSubmitting?: boolean;
	readonly disabled?: boolean;
}

export function SubmissionEditView({
	existingDocuments,
	newFiles,
	onExistingDocumentsChange,
	onNewFilesChange,
	onSubmit,
	onCancel,
	isSubmitting = false,
	disabled = false,
}: SubmissionEditViewProps) {
	const [uploading] = useState(false);

	// Handle removing existing document
	const handleRemoveExistingDocument = (documentUrl: string) => {
		const updatedDocuments = existingDocuments.filter(
			(url) => url !== documentUrl,
		);
		onExistingDocumentsChange(updatedDocuments);
	};

	// Handle new file selection
	const handleFileSelect = (info: UploadInfo) => {
		const { fileList } = info;

		// Get all files from fileList
		const allFiles = fileList
			.filter((item) => item.originFileObj && item.status !== 'removed')
			.map((item) => item.originFileObj!)
			.filter((file): file is File => Boolean(file));

		// Filter out files that already exist (by name and size)
		const filteredNewFiles = allFiles.filter(
			(newFile) =>
				!newFiles.some(
					(existingFile) =>
						existingFile.name === newFile.name &&
						existingFile.size === newFile.size,
				),
		);

		if (filteredNewFiles.length === 0) return;

		// Add only the truly new files to existing files
		const updatedFiles = [...newFiles, ...filteredNewFiles];
		onNewFilesChange(updatedFiles);
	};

	// Handle removing new file
	const handleRemoveNewFile = (fileToRemove: File) => {
		const updatedFiles = newFiles.filter(
			(file) =>
				!(file.name === fileToRemove.name && file.size === fileToRemove.size),
		);
		onNewFilesChange(updatedFiles);
	};

	return (
		<Card
			size="small"
			style={{
				backgroundColor: '#fafafa',
				border: '1px solid #d9d9d9',
			}}
		>
			<Space direction="vertical" size={12} style={{ width: '100%' }}>
				<FormLabel text="Update Submission Files" isBold />
				<div style={{ fontSize: 13, color: '#666', marginTop: -8 }}>
					Modify your submission by removing existing files or adding new ones
				</div>

				{/* Display existing documents */}
				{existingDocuments.length > 0 && (
					<div>
						<div style={{ fontWeight: 500, marginBottom: 8, color: '#333' }}>
							Current Submission:
						</div>
						{existingDocuments.map((documentUrl, index) => (
							<FileItem
								key={`existing-${documentUrl}-${index}`}
								documentUrl={documentUrl}
								variant="existing"
								disabled={disabled}
								onDelete={() => handleRemoveExistingDocument(documentUrl)}
							/>
						))}
					</div>
				)}

				{/* Display new files to upload */}
				{newFiles.length > 0 && (
					<div>
						<div style={{ fontWeight: 500, marginBottom: 8, color: '#333' }}>
							New Files to Add:
						</div>
						{newFiles.map((file, index) => (
							<FileItem
								key={`new-${file.name}-${file.size}-${index}`}
								file={file}
								variant="new"
								showSize={true}
								disabled={disabled}
								onDelete={() => handleRemoveNewFile(file)}
							/>
						))}
					</div>
				)}

				{/* Upload section */}
				{!disabled && (
					<DocumentUploadButton
						onFilesSelect={handleFileSelect}
						disabled={disabled}
						uploading={uploading}
						buttonText="Add More Files"
						helpText="Support: All file types (Max: 10MB per file)"
					/>
				)}

				{/* Action Buttons */}
				<div
					style={{
						display: 'flex',
						gap: 8,
						justifyContent: 'flex-end',
						marginTop: 16,
						paddingTop: 12,
						borderTop: '1px solid #e8e8e8',
					}}
				>
					<Button onClick={onCancel} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						type="primary"
						onClick={onSubmit}
						loading={isSubmitting}
						disabled={disabled}
					>
						Update Submission
					</Button>
				</div>
			</Space>
		</Card>
	);
}
