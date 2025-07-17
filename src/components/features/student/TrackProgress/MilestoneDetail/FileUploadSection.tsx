'use client';

import {
	DeleteOutlined,
	FileTextOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Upload } from 'antd';

import { FormLabel } from '@/components/common/FormLabel';

interface UploadInfo {
	readonly fileList: Array<{
		readonly originFileObj?: File;
		readonly name: string;
	}>;
}

interface FileUploadSectionProps {
	readonly files: File[];
	readonly canSubmit: boolean;
	readonly isSubmitting: boolean;
	readonly onFileChange: (info: UploadInfo) => void;
	readonly onRemoveFile: (fileName: string, fileSize: number) => void;
}

export function FileUploadSection({
	files,
	canSubmit,
	isSubmitting,
	onFileChange,
	onRemoveFile,
}: FileUploadSectionProps) {
	return (
		<Card
			size="small"
			style={{
				backgroundColor: '#fafafa',
				border: '1px solid #d9d9d9',
				marginTop: 12,
			}}
		>
			<Space direction="vertical" size={12} style={{ width: '100%' }}>
				<FormLabel text="Upload Files" isRequired isBold />

				{/* Files display area */}
				{files.length > 0 ? (
					<div>
						{files.map((file) => (
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
										<div style={{ color: '#666', fontSize: 13 }}>
											{(file.size / 1024 / 1024).toFixed(1)} MB
										</div>
									</div>
								</div>
								<DeleteOutlined
									style={{
										color: 'red',
										cursor: 'pointer',
										fontSize: 16,
										flexShrink: 0,
									}}
									onClick={() => onRemoveFile(file.name, file.size)}
								/>
							</div>
						))}

						<div style={{ marginTop: 16 }}>
							<Upload
								multiple
								onChange={onFileChange}
								showUploadList={false}
								disabled={!canSubmit || isSubmitting}
							>
								<Button
									icon={<UploadOutlined />}
									disabled={!canSubmit || isSubmitting}
									loading={isSubmitting}
								>
									{isSubmitting ? 'Uploading...' : 'Upload More Files'}
								</Button>
							</Upload>

							<div
								style={{
									fontSize: 12,
									color: '#999',
									marginTop: 4,
								}}
							>
								Support for all file types (Max: 10MB per file)
							</div>
						</div>
					</div>
				) : (
					<Upload.Dragger
						multiple
						onChange={onFileChange}
						showUploadList={false}
						disabled={!canSubmit || isSubmitting}
						style={{
							border: '2px dashed #d9d9d9',
							borderRadius: 8,
							backgroundColor: '#fafafa',
						}}
					>
						<p className="ant-upload-drag-icon">
							<UploadOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
						</p>
						<p className="ant-upload-text" style={{ fontSize: 16 }}>
							Click or drag files to this area to upload
						</p>
						<p className="ant-upload-hint" style={{ color: '#999' }}>
							Support for multiple files. Max 10MB per file.
						</p>
					</Upload.Dragger>
				)}
			</Space>
		</Card>
	);
}
