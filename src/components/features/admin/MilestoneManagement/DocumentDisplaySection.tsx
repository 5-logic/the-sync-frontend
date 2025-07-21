'use client';

import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Space } from 'antd';

import { FormLabel } from '@/components/common/FormLabel';
import { StorageService } from '@/lib/services/storage.service';

interface DocumentDisplaySectionProps {
	readonly documents: string[];
	readonly disabled?: boolean;
}

export function DocumentDisplaySection({
	documents,
	disabled = false,
}: DocumentDisplaySectionProps) {
	const handleDownload = async (documentUrl: string) => {
		try {
			// Extract filename from URL
			const fileName = StorageService.getFileNameFromUrl(documentUrl);

			// Create a download link
			const link = document.createElement('a');
			link.href = documentUrl;
			link.download = fileName;
			link.target = '_blank';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error('Download failed:', error);
		}
	};

	if (documents.length === 0) {
		return null;
	}

	return (
		<Card
			size="small"
			style={{
				backgroundColor: '#fafafa',
				border: '1px solid #d9d9d9',
			}}
		>
			<Space direction="vertical" size={12} style={{ width: '100%' }}>
				<FormLabel text="Existing Template Documents" isBold />
				<div style={{ fontSize: 13, color: '#666', marginTop: -8 }}>
					Documents uploaded with this milestone
				</div>

				{/* Display existing documents */}
				<div>
					{documents.map((documentUrl, index) => {
						const fileName = StorageService.getFileNameFromUrl(documentUrl);

						return (
							<div
								key={`${documentUrl}-${index}`}
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
											title={fileName}
										>
											{fileName}
										</div>
									</div>
								</div>
								{!disabled && (
									<Button
										type="text"
										size="small"
										icon={<DownloadOutlined />}
										onClick={() => handleDownload(documentUrl)}
										style={{
											color: '#1890ff',
											flexShrink: 0,
										}}
									>
										Download
									</Button>
								)}
							</div>
						);
					})}
				</div>
			</Space>
		</Card>
	);
}
