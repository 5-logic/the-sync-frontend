'use client';

import {
	DeleteOutlined,
	DownloadOutlined,
	FileTextOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';

import { StorageService } from '@/lib/services/storage.service';

interface FileItemProps {
	file?: File;
	documentUrl?: string;
	fileName?: string;
	fileSize?: number;
	showSize?: boolean;
	showDownload?: boolean;
	disabled?: boolean;
	variant?: 'default' | 'new' | 'existing';
	onDelete?: () => void;
	onDownload?: (url: string) => void;
}

export function FileItem({
	file,
	documentUrl,
	fileName,
	fileSize,
	showSize = false,
	showDownload = false,
	disabled = false,
	variant = 'default',
	onDelete,
	onDownload,
}: FileItemProps) {
	// Determine display values
	const displayName =
		fileName ||
		file?.name ||
		(documentUrl ? StorageService.getFileNameFromUrl(documentUrl) : '');
	const displaySize = fileSize || file?.size;

	// Determine styling based on variant
	const getBackgroundColor = () => {
		switch (variant) {
			case 'new':
				return '#f6ffed';
			case 'existing':
				return '#fff';
			default:
				return '#fff';
		}
	};

	const getBorderColor = () => {
		switch (variant) {
			case 'new':
				return '#e6f7ff';
			default:
				return '#d9d9d9';
		}
	};

	const getIconColor = () => {
		switch (variant) {
			case 'new':
				return '#52c41a';
			default:
				return '#1890ff';
		}
	};

	const handleDownload = async () => {
		if (documentUrl && onDownload) {
			onDownload(documentUrl);
		}
	};

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '12px 16px',
				border: `1px solid ${getBorderColor()}`,
				borderRadius: 8,
				backgroundColor: getBackgroundColor(),
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
				<FileTextOutlined style={{ color: getIconColor(), flexShrink: 0 }} />
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
						title={displayName}
					>
						{displayName}
						{variant === 'new' && (
							<span style={{ color: '#52c41a' }}> (New)</span>
						)}
					</div>
					{showSize && displaySize && (
						<div style={{ color: '#666', fontSize: 13 }}>
							{(displaySize / 1024 / 1024).toFixed(1)} MB
						</div>
					)}
				</div>
			</div>

			<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
				{showDownload && documentUrl && !disabled && (
					<Button
						type="text"
						size="small"
						icon={<DownloadOutlined />}
						onClick={handleDownload}
						style={{
							color: '#1890ff',
							flexShrink: 0,
						}}
					>
						Download
					</Button>
				)}
				{onDelete && !disabled && (
					<DeleteOutlined
						style={{
							color: 'red',
							cursor: 'pointer',
							fontSize: 16,
							flexShrink: 0,
						}}
						onClick={onDelete}
					/>
				)}
			</div>
		</div>
	);
}
