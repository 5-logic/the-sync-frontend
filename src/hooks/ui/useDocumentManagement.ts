'use client';

import { useState } from 'react';

export interface UploadInfo {
	readonly fileList: Array<{
		readonly originFileObj?: File;
		readonly name: string;
		readonly status?: string;
	}>;
}

interface UseDocumentManagementProps {
	readonly existingDocuments: string[];
	readonly newFiles: File[];
	readonly onExistingDocumentsChange: (documents: string[]) => void;
	readonly onNewFilesChange: (files: File[]) => void;
}

export function useDocumentManagement({
	existingDocuments,
	newFiles,
	onExistingDocumentsChange,
	onNewFilesChange,
}: UseDocumentManagementProps) {
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

	return {
		uploading,
		handleRemoveExistingDocument,
		handleFileSelect,
		handleRemoveNewFile,
	};
}
