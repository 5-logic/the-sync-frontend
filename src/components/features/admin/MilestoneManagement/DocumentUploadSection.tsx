'use client';

import { Card, Space } from 'antd';
import { useState } from 'react';

import { DocumentUploadButton } from '@/components/common/FileUpload/DocumentUploadButton';
import { FileItem } from '@/components/common/FileUpload/FileItem';
import { FormLabel } from '@/components/common/FormLabel';

interface UploadedFile {
	name: string;
	size: number;
	file: File; // Store the actual File object instead of URL
}

interface UploadInfo {
	readonly fileList: Array<{
		readonly originFileObj?: File;
		readonly name: string;
		readonly status?: string;
	}>;
}

interface DocumentUploadSectionProps {
	readonly files: File[]; // Changed from documents to files
	readonly onFilesChange: (files: File[]) => void; // Changed from onDocumentsChange
	readonly disabled?: boolean;
}

export function DocumentUploadSection({
	files,
	onFilesChange,
	disabled = false,
}: DocumentUploadSectionProps) {
	const [uploading] = useState(false);

	// Convert files to displayable format
	const displayFiles: UploadedFile[] = files.map((file) => ({
		name: file.name,
		size: file.size,
		file,
	}));

	const handleFileSelect = (info: UploadInfo) => {
		const { fileList } = info;

		// Get all files from fileList
		const allFiles = fileList
			.filter((item) => item.originFileObj && item.status !== 'removed')
			.map((item) => item.originFileObj!)
			.filter((file): file is File => Boolean(file));

		// Filter out files that already exist (by name and size)
		const newFiles = allFiles.filter(
			(newFile) =>
				!files.some(
					(existingFile) =>
						existingFile.name === newFile.name &&
						existingFile.size === newFile.size,
				),
		);

		if (newFiles.length === 0) return;

		// Add only the truly new files to existing files
		const updatedFiles = [...files, ...newFiles];
		onFilesChange(updatedFiles);
	};

	const handleFileRemove = (fileToRemove: File) => {
		// Remove file from the list
		const updatedFiles = files.filter(
			(file) =>
				!(file.name === fileToRemove.name && file.size === fileToRemove.size),
		);
		onFilesChange(updatedFiles);
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
				<FormLabel text="Template Document Submission" isBold />
				<div style={{ fontSize: 13, color: '#666', marginTop: -8 }}>
					Optional: Upload template documents for students to download
				</div>

				{/* Display uploaded files */}
				{displayFiles.length > 0 && (
					<div>
						{displayFiles.map((file) => (
							<FileItem
								key={`${file.name}-${file.size}`}
								file={file.file}
								disabled={disabled}
								onDelete={() => handleFileRemove(file.file)}
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
						buttonText="Upload Template Documents"
						helpText="Support: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT (Max: 10MB per file)"
					/>
				)}
			</Space>
		</Card>
	);
}
