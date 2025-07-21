'use client';

import {
	DeleteOutlined,
	FileTextOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Upload, UploadProps } from 'antd';
import { useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { StorageService } from '@/lib/services/storage.service';

interface UploadInfo {
	readonly fileList: Array<{
		readonly originFileObj?: File;
		readonly name: string;
		readonly status?: string;
	}>;
}

interface DocumentEditSectionProps {
	readonly existingDocuments: string[]; // URLs of existing documents
	readonly newFiles: File[]; // New files to upload
	readonly onExistingDocumentsChange: (documents: string[]) => void;
	readonly onNewFilesChange: (files: File[]) => void;
	readonly disabled?: boolean;
}

export function DocumentEditSection({
	existingDocuments,
	newFiles,
	onExistingDocumentsChange,
	onNewFilesChange,
	disabled = false,
}: DocumentEditSectionProps) {
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

	const uploadProps: UploadProps = {
		multiple: true,
		onChange: handleFileSelect,
		showUploadList: false,
		disabled: disabled || uploading,
		beforeUpload: () => false, // Prevent auto upload
		accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
		fileList: [], // Always keep Upload component's internal fileList empty
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
				<FormLabel text="Template Documents" isBold />
				<div style={{ fontSize: 13, color: '#666', marginTop: -8 }}>
					Manage template documents for this milestone
				</div>

				{/* Display existing documents */}
				{existingDocuments.length > 0 && (
					<div>
						<div style={{ fontWeight: 500, marginBottom: 8, color: '#333' }}>
							Existing Documents:
						</div>
						{existingDocuments.map((documentUrl, index) => {
							const fileName = StorageService.getFileNameFromUrl(documentUrl);

							return (
								<div
									key={`existing-${documentUrl}-${index}`}
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										padding: '12px 16px',
										border: '1px solid #d9d9d9',
										borderRadius: 8,
										backgroundColor: '#fff',
										marginBottom: 8,
										gap: 8,
										minWidth: 0,
									}}
								>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: 8,
											minWidth: 0,
											flex: 1,
										}}
									>
										<FileTextOutlined
											style={{ color: '#1890ff', flexShrink: 0 }}
										/>
										<div style={{ minWidth: 0, flex: 1 }}>
											<div
												style={{
													fontWeight: 500,
													wordBreak: 'break-all',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
													maxWidth: '100%',
												}}
												title={fileName}
											>
												{fileName}
											</div>
										</div>
									</div>
									{!disabled && (
										<DeleteOutlined
											style={{
												color: 'red',
												cursor: 'pointer',
												fontSize: 16,
												flexShrink: 0,
											}}
											onClick={() => handleRemoveExistingDocument(documentUrl)}
										/>
									)}
								</div>
							);
						})}
					</div>
				)}

				{/* Display new files to upload */}
				{newFiles.length > 0 && (
					<div>
						<div style={{ fontWeight: 500, marginBottom: 8, color: '#333' }}>
							New Files to Upload:
						</div>
						{newFiles.map((file, index) => (
							<div
								key={`new-${file.name}-${file.size}-${index}`}
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									padding: '12px 16px',
									border: '1px solid #e6f7ff',
									borderRadius: 8,
									backgroundColor: '#f6ffed',
									marginBottom: 8,
									gap: 8,
									minWidth: 0,
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										minWidth: 0,
										flex: 1,
									}}
								>
									<FileTextOutlined
										style={{ color: '#52c41a', flexShrink: 0 }}
									/>
									<div style={{ minWidth: 0, flex: 1 }}>
										<div
											style={{
												fontWeight: 500,
												wordBreak: 'break-all',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
												maxWidth: '100%',
											}}
											title={file.name}
										>
											{file.name}{' '}
											<span style={{ color: '#52c41a' }}>(New)</span>
										</div>
									</div>
								</div>
								{!disabled && (
									<DeleteOutlined
										style={{
											color: 'red',
											cursor: 'pointer',
											fontSize: 16,
											flexShrink: 0,
										}}
										onClick={() => handleRemoveNewFile(file)}
									/>
								)}
							</div>
						))}
					</div>
				)}

				{/* Upload section */}
				{!disabled && (
					<div>
						<Upload {...uploadProps}>
							<Button
								icon={<UploadOutlined />}
								loading={uploading}
								disabled={disabled}
								style={{ width: '100%' }}
							>
								{uploading ? 'Uploading...' : 'Add More Documents'}
							</Button>
						</Upload>

						<div
							style={{
								fontSize: 12,
								color: '#999',
								marginTop: 4,
								textAlign: 'center',
							}}
						>
							Support: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT (Max: 10MB per
							file)
						</div>
					</div>
				)}
			</Space>
		</Card>
	);
}
