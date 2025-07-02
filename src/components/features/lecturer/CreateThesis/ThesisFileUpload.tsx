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
}

export default function SupportingDocumentField({
	mode,
	initialFile,
	onFileChange,
}: Readonly<Props>) {
	const [uploadedFile, setUploadedFile] = useState(initialFile || null);
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		setUploadedFile(initialFile || null);
	}, [initialFile]);

	const handleFileUpload = async (file: File) => {
		try {
			setUploading(true);

			// Upload new file to Supabase Storage with support-doc folder
			// Note: We don't delete the old file in edit mode as it's kept for version history
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

	const handleFileDelete = async () => {
		try {
			if (uploadedFile?.url) {
				await StorageService.deleteFile(uploadedFile.url);
			}
			setUploadedFile(null);
			onFileChange(null);
			showNotification.success('Delete Success', 'File deleted successfully!');
		} catch {
			// Error notification is already shown in StorageService
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
				rules={
					mode === 'create'
						? [{ required: true, message: 'Please upload your document' }]
						: []
				}
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
								<div style={{ fontWeight: 500 }}>{uploadedFile.name}</div>
								<div style={{ color: '#666', fontSize: 13 }}>
									{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB • Uploaded
									on{' '}
									{new Date().toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
										year: 'numeric',
									})}
								</div>
							</div>
							<DeleteOutlined
								style={{ color: 'red', cursor: 'pointer', fontSize: 16 }}
								onClick={handleFileDelete}
							/>
						</div>

						<div style={{ marginTop: 16 }}>
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

							<div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
								Support for DOC, DOCX (Max: 10MB)
							</div>
						</div>
					</div>
				)}
			</Form.Item>
		</>
	);
}
