'use client';

import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, UploadProps } from 'antd';

interface UploadInfo {
	readonly fileList: Array<{
		readonly originFileObj?: File;
		readonly name: string;
		readonly status?: string;
	}>;
}

interface DocumentUploadButtonProps {
	readonly onFilesSelect: (info: UploadInfo) => void;
	readonly disabled?: boolean;
	readonly uploading?: boolean;
	readonly buttonText?: string;
	readonly helpText?: string;
}

export function DocumentUploadButton({
	onFilesSelect,
	disabled = false,
	uploading = false,
	buttonText = 'Upload Documents',
	helpText = 'Support: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT (Max: 10MB per file)',
}: DocumentUploadButtonProps) {
	const uploadProps: UploadProps = {
		multiple: true,
		onChange: onFilesSelect,
		showUploadList: false,
		disabled: disabled || uploading,
		beforeUpload: () => false, // Prevent auto upload
		accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
		fileList: [], // Always keep Upload component's internal fileList empty
	};

	return (
		<div>
			<Upload {...uploadProps}>
				<Button
					icon={<UploadOutlined />}
					loading={uploading}
					disabled={disabled}
					style={{ width: '100%' }}
				>
					{uploading ? 'Uploading...' : buttonText}
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
				{helpText}
			</div>
		</div>
	);
}
