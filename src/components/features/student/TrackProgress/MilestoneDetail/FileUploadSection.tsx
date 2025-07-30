'use client';

import { UploadOutlined } from '@ant-design/icons';
import { Card, Space, Upload } from 'antd';

import { FileItem } from '@/components/common/FileUpload/FileItem';
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
							<FileItem
								key={`${file.name}-${file.size}`}
								file={file}
								showSize={true}
								onDelete={() => onRemoveFile(file.name, file.size)}
							/>
						))}

						<div style={{ marginTop: 16 }}>
							<div
								style={{
									fontSize: 12,
									color: '#999',
									textAlign: 'center',
								}}
							>
								Use the drag area below to add more files
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
