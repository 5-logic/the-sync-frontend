'use client';

import {
	CloudUploadOutlined,
	DeleteOutlined,
	DownloadOutlined,
} from '@ant-design/icons';
import { Button, Col, Form, Row, Upload, message } from 'antd';
import { useEffect, useState } from 'react';

interface Props {
	mode: 'create' | 'edit';
	initialFile?: {
		name: string;
		size: number;
	};
	onFileChange: (file: { name: string; size: number } | null) => void;
}

export default function SupportingDocumentField({
	mode,
	initialFile,
	onFileChange,
}: Props) {
	const [uploadedFile, setUploadedFile] = useState(initialFile || null);

	useEffect(() => {
		setUploadedFile(initialFile || null);
	}, [initialFile]);

	const uploadProps = {
		beforeUpload: (file: File) => {
			const isAllowed =
				file.type === 'application/pdf' ||
				file.type.includes('word') ||
				file.name.endsWith('.docx');

			if (!isAllowed) {
				message.error('Only PDF, DOC, DOCX files are allowed!');
			}
			if (file.size / 1024 / 1024 > 10) {
				message.error('File must be smaller than 10MB!');
				return Upload.LIST_IGNORE;
			}
			return isAllowed || Upload.LIST_IGNORE;
		},
		maxCount: 1,
	};

	return (
		<>
			<Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
				<Col>
					<span style={{ fontWeight: 500 }}>
						Supporting Documents
						{mode === 'create' && <span style={{ color: 'red' }}> *</span>}
					</span>
				</Col>
				{mode === 'create' && (
					<Col>
						<Button icon={<DownloadOutlined />} type="default" size="small">
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
						onChange={({ file }) => {
							if (file.status === 'done') {
								const info = {
									name: file.name,
									size: file.size ?? 0,
								};
								setUploadedFile(info);
								onFileChange(info);
							}
						}}
						showUploadList={false}
					>
						<p className="ant-upload-drag-icon">
							<CloudUploadOutlined />
						</p>
						<p>Click or drag file to upload</p>
						<p style={{ color: '#999' }}>Support PDF, DOC, DOCX (Max: 10MB)</p>
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
								onClick={() => {
									setUploadedFile(null);
									onFileChange(null);
								}}
							/>
						</div>

						<div style={{ marginTop: 16 }}>
							<Upload
								{...uploadProps}
								onChange={({ file }) => {
									if (file.status === 'done') {
										const info = {
											name: file.name,
											size: file.size ?? 0,
										};
										setUploadedFile(info);
										onFileChange(info);
									}
								}}
								showUploadList={false}
							>
								<Button icon={<CloudUploadOutlined />}>Upload New File</Button>
							</Upload>
							<div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
								Support for PDF, DOC, DOCX (Max: 10MB)
							</div>
						</div>
					</div>
				)}
			</Form.Item>
		</>
	);
}
