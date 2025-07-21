'use client';

import {
	DeleteOutlined,
	FileTextOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Upload, UploadProps } from 'antd';
import { useState } from 'react';

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
				<FormLabel text="Template Document Submission" isBold />
				<div style={{ fontSize: 13, color: '#666', marginTop: -8 }}>
					Optional: Upload template documents for students to download
				</div>

				{/* Display uploaded files */}
				{displayFiles.length > 0 && (
					<div>
						{displayFiles.map((file) => (
							<div
								key={`${file.name}-${file.size}`}
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
											title={file.name}
										>
											{file.name}
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
										onClick={() => handleFileRemove(file.file)}
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
								{uploading ? 'Uploading...' : 'Upload Template Documents'}
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
