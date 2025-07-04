'use client';

import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';

import { showNotification } from '@/lib/utils/notification';

interface Props {
	templateFileName: string;
	onDownloaded?: () => void;
}

const DownloadTemplateButton = ({ templateFileName, onDownloaded }: Props) => {
	const [downloading, setDownloading] = useState(false);

	const handleDownload = () => {
		setDownloading(true);
		setTimeout(() => {
			showNotification.success(
				'Template Downloaded',
				'Excel template has been downloaded.',
			);
			setDownloading(false);
			onDownloaded?.();
		}, 1000);
	};

	return (
		<Button
			icon={<DownloadOutlined />}
			type="default"
			onClick={handleDownload}
			disabled={!templateFileName || downloading}
			loading={downloading}
			title={
				!templateFileName
					? 'Template file not available'
					: 'Download Excel template'
			}
		>
			{downloading ? 'Downloading...' : 'Download Template'}
		</Button>
	);
};

export default DownloadTemplateButton;
