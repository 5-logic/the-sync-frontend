'use client';

import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';

import { showNotification } from '@/lib/utils/notification';

interface DownloadTemplateButtonProps {
	templateFileName: string;
	buttonText?: string;
	buttonType?: 'default' | 'primary' | 'link' | 'text';
	icon?: React.ReactNode;
	disabled?: boolean;
}

export default function DownloadTemplateButton({
	templateFileName,
	buttonText = 'Download Template',
	buttonType = 'default',
	icon = <DownloadOutlined />,
	disabled = false,
}: DownloadTemplateButtonProps) {
	const [downloading, setDownloading] = useState(false);

	const handleDownload = async () => {
		if (!templateFileName) {
			showNotification.error('Error', 'Template file is not available');
			return;
		}

		setDownloading(true);
		try {
			const downloadUrl = `/files/${templateFileName}`;
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = templateFileName;
			link.target = '_blank';
			link.rel = 'noopener noreferrer';

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			showNotification.success('Success', 'Template download started');
		} catch (error) {
			console.error('Download failed:', error);
			showNotification.error(
				'Error',
				'Failed to download template. Please try again.',
			);
		} finally {
			setTimeout(() => setDownloading(false), 1000);
		}
	};

	return (
		<Button
			icon={icon}
			type={buttonType}
			onClick={handleDownload}
			loading={downloading}
			disabled={!templateFileName || disabled || downloading}
			title={
				!templateFileName
					? 'Template file not available'
					: 'Download Excel template'
			}
		>
			{downloading ? 'Downloading...' : buttonText}
		</Button>
	);
}
