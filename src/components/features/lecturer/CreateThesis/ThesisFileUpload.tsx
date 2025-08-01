'use client';

import {
	CloudUploadOutlined,
	DeleteOutlined,
	DownloadOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import { Button, Col, Form, Row, Space, Upload } from 'antd';
import { useEffect, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { THESIS_TEMPLATE_URLS } from '@/lib/constants';
import { StorageService } from '@/lib/services/storage.service';
import { showNotification } from '@/lib/utils/notification';

interface Props {
	mode: 'create' | 'edit';
	initialFile?: {
		name: string;
		size: number;
		url?: string;
	};
	onFileChange: (
		file: { name: string; size: number; url: string } | null,
	) => void;
	onFileChangeStateUpdate?: (state: FileChangeState) => void; // New prop for edit mode
}

interface FileChangeState {
	action: 'none' | 'delete' | 'replace';
	newFile?: File;
}

export default function SupportingDocumentField({
	mode,
	initialFile,
	onFileChange,
	onFileChangeStateUpdate,
}: Readonly<Props>) {
	const [uploadedFile, setUploadedFile] = useState(initialFile || null);
	const [uploading, setUploading] = useState(false);
	const [fileChangeState, setFileChangeState] = useState<FileChangeState>({
		action: 'none',
	});
	const [lastInitialFile, setLastInitialFile] = useState(initialFile);
	const [userHasInteracted, setUserHasInteracted] = useState(false);

	useEffect(() => {
		// Only reset state when initialFile actually changes to a different file
		// Compare by URL and name to detect real changes, not just reference changes
		const prevFileUrl = lastInitialFile?.url || '';
		const prevFileName = lastInitialFile?.name || '';
		const currentFileUrl = initialFile?.url || '';
		const currentFileName = initialFile?.name || '';

		const hasInitialFileChanged =
			prevFileUrl !== currentFileUrl || prevFileName !== currentFileName;

		// Don't reset if user has already performed delete/replace actions
		const userHasChanges = fileChangeState.action !== 'none';

		if (hasInitialFileChanged && !userHasChanges && !userHasInteracted) {
			setLastInitialFile(initialFile);
			// Reset to initial state only when initialFile content actually changes
			// and user hasn't made any changes yet
			setUploadedFile(initialFile || null);
			setFileChangeState({ action: 'none' });
		}
	}, [initialFile, lastInitialFile, fileChangeState.action, userHasInteracted]);

	const handleCreateModeUpload = async (file: File) => {
		try {
			setUploading(true);

			const fileUrl = await StorageService.uploadFile(file, 'support-doc');

			const uploadedFileInfo = {
				name: file.name,
				size: file.size,
				url: fileUrl,
			};

			setUploadedFile(uploadedFileInfo);
			onFileChange(uploadedFileInfo);

			showNotification.success('Upload Success', 'File uploaded successfully!');
		} catch {
			// Error notification is already shown in StorageService
		} finally {
			setUploading(false);
		}
	};

	const handleEditModeUpload = (file: File) => {
		const newState = {
			action: 'replace' as const,
			newFile: file,
		};

		setFileChangeState(newState);
		onFileChangeStateUpdate?.(newState);

		// Show the new file in UI
		const newFileInfo = {
			name: file.name,
			size: file.size,
			url: '', // No URL yet since we haven't uploaded
		};

		setUploadedFile(newFileInfo);

		// Notify parent about the change (provide the File object for later upload)
		onFileChange({
			name: file.name,
			size: file.size,
			url: 'pending-upload', // Special marker to indicate pending upload
		});

		// No notification needed - UI already shows the change clearly
	};

	const handleFileUpload = async (file: File) => {
		// Mark that user has interacted with the component
		setUserHasInteracted(true);

		if (mode === 'create') {
			await handleCreateModeUpload(file);
		} else {
			handleEditModeUpload(file);
		}
	};

	const handleFileDelete = async () => {
		// Mark that user has interacted with the component
		setUserHasInteracted(true);

		if (mode === 'create') {
			// In create mode, delete immediately as before
			try {
				if (uploadedFile?.url) {
					await StorageService.deleteFile(uploadedFile.url);
				}
				setUploadedFile(null);
				onFileChange(null);
				showNotification.success(
					'Delete Success',
					'File deleted successfully!',
				);
			} catch {
				// Error notification is already shown in StorageService
			}
		} else {
			// In edit mode, just mark for deletion without actually deleting
			const newState = {
				action: 'delete' as const,
			};

			setFileChangeState(newState);
			onFileChangeStateUpdate?.(newState);

			setUploadedFile(null);
			onFileChange(null);

			// No notification needed - UI already shows the change clearly
		}
	};

	const handleFileDownload = async () => {
		try {
			if (uploadedFile?.url) {
				const downloadUrl = await StorageService.getDownloadUrl(
					uploadedFile.url,
				);
				window.open(downloadUrl, '_blank');
			}
		} catch {
			showNotification.error('Download Failed', 'Could not download file');
		}
	};

	const handleTemplateDownload = () => {
		try {
			// Download template from constant URL
			window.open(THESIS_TEMPLATE_URLS.THESIS_REGISTER_DOCUMENT, '_blank');
		} catch {
			showNotification.error('Download Failed', 'Could not download template');
		}
	};

	// Shared file validation function
	const validateFile = (file: File): boolean => {
		const isAllowed =
			file.type.includes('word') ||
			file.name.endsWith('.docx') ||
			file.name.endsWith('.doc');

		if (!isAllowed) {
			showNotification.error('Error', 'Only DOC, DOCX files are allowed!');
			return false;
		}

		if (file.size / 1024 / 1024 > 10) {
			showNotification.error('Error', 'File must be smaller than 10MB!');
			return false;
		}

		return true;
	};

	// Factory function to create upload props
	const createUploadProps = (additionalProps = {}) => ({
		beforeUpload: (file: File) => {
			if (!validateFile(file)) {
				return Upload.LIST_IGNORE;
			}

			// Handle the upload
			handleFileUpload(file);

			return false; // Prevent antd's default upload behavior
		},
		maxCount: 1,
		...additionalProps,
	});

	// Create upload props using factory
	const uploadProps = createUploadProps();
	const newFileUploadProps = createUploadProps({ showUploadList: false });

	// Helper function to get help text based on mode and file state
	const getHelpText = () => {
		if (mode === 'create') {
			return 'Support for DOC, DOCX (Max: 10MB)';
		}

		if (fileChangeState.action === 'none') {
			return 'Support for DOC, DOCX (Max: 10MB). Changes will be applied when you save the thesis.';
		}

		return 'File changes will be applied when you save the thesis.';
	};

	return (
		<>
			<Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
				<Col>
					<FormLabel text="Supporting Documents" isRequired isBold />
				</Col>
				{mode === 'create' && (
					<Col>
						<Button
							icon={<DownloadOutlined />}
							type="default"
							size="small"
							onClick={handleTemplateDownload}
						>
							Download Template
						</Button>
					</Col>
				)}
			</Row>

			<Form.Item
				name="supportingDocument"
				valuePropName="fileList"
				getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
				rules={[
					{
						validator: (_, value) => {
							// For create mode, file is always required
							if (mode === 'create') {
								if (!value || value.length === 0) {
									return Promise.reject(
										new Error('Please upload your document'),
									);
								}
								return Promise.resolve();
							}

							// For edit mode, file is required unless there's an initial file and no deletion action
							if (mode === 'edit') {
								const hasCurrentFile = value && value.length > 0;
								const hasInitialFile = initialFile;
								const isDeleting = fileChangeState.action === 'delete';

								// If user deleted the file and hasn't uploaded a new one, it's invalid
								if (isDeleting && !hasCurrentFile) {
									return Promise.reject(
										new Error('Please upload a supporting document'),
									);
								}

								// If no initial file and no current file, it's invalid
								if (!hasInitialFile && !hasCurrentFile) {
									return Promise.reject(
										new Error('Please upload your document'),
									);
								}

								return Promise.resolve();
							}

							return Promise.resolve();
						},
					},
				]}
			>
				{!uploadedFile ? (
					<Upload.Dragger
						{...uploadProps}
						showUploadList={false}
						disabled={uploading}
					>
						<p className="ant-upload-drag-icon">
							<CloudUploadOutlined />
						</p>
						<p>{uploading ? 'Uploading...' : 'Click or drag file to upload'}</p>
						<p style={{ color: '#999' }}>Support DOC, DOCX (Max: 10MB)</p>
					</Upload.Dragger>
				) : (
					<div
						style={{
							border: '1px solid #d9d9d9',
							borderRadius: 8,
							padding: 16,
							background: '#fafafa',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'flex-start',
							}}
						>
							<div>
								<div style={{ fontWeight: 500 }}>
									{uploadedFile.name}
									{mode === 'edit' && fileChangeState.action === 'replace' && (
										<span style={{ color: '#1890ff', marginLeft: 8 }}>
											(New file selected)
										</span>
									)}
								</div>
								<div style={{ color: '#666', fontSize: 13 }}>
									{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
									{mode === 'create' && (
										<>
											{' '}
											• Uploaded on{' '}
											{new Date().toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
												year: 'numeric',
											})}
										</>
									)}
									{mode === 'edit' && fileChangeState.action === 'none' && (
										<> • Current file</>
									)}
									{mode === 'edit' && fileChangeState.action === 'replace' && (
										<> • Will replace current file when saved</>
									)}
								</div>
							</div>
							<DeleteOutlined
								style={{ color: 'red', cursor: 'pointer', fontSize: 16 }}
								onClick={handleFileDelete}
								title={
									mode === 'edit'
										? 'Mark file for deletion (will be deleted when thesis is saved)'
										: 'Delete file immediately'
								}
							/>
						</div>

						<div style={{ marginTop: 16 }}>
							{mode === 'create' ? (
								<Space>
									<Upload {...newFileUploadProps}>
										<Button icon={<UploadOutlined />} loading={uploading}>
											{uploading ? 'Uploading...' : 'Upload New File'}
										</Button>
									</Upload>

									<Button
										icon={<DownloadOutlined />}
										onClick={handleFileDownload}
									>
										Download File
									</Button>
								</Space>
							) : (
								<Space>
									{fileChangeState.action === 'none' && (
										<>
											<Upload {...newFileUploadProps}>
												<Button icon={<UploadOutlined />}>Replace File</Button>
											</Upload>

											<Button
												icon={<DownloadOutlined />}
												onClick={handleFileDownload}
											>
												Download Current File
											</Button>
										</>
									)}

									{fileChangeState.action === 'replace' && (
										<Button
											icon={<UploadOutlined />}
											onClick={() => {
												// Reset to show original file
												const resetState = { action: 'none' as const };
												setFileChangeState(resetState);
												onFileChangeStateUpdate?.(resetState);
												setUploadedFile(initialFile || null);

												// Only call onFileChange if initialFile has url
												if (initialFile?.url) {
													onFileChange({
														name: initialFile.name,
														size: initialFile.size,
														url: initialFile.url,
													});
												} else {
													onFileChange(null);
												}
											}}
										>
											Cancel File Change
										</Button>
									)}
								</Space>
							)}

							<div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
								{getHelpText()}
							</div>
						</div>
					</div>
				)}
			</Form.Item>
		</>
	);
}
