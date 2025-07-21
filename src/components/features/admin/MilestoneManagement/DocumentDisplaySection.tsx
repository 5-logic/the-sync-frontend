'use client';

import { Card, Space } from 'antd';

import { FileItem } from '@/components/common/FileUpload/FileItem';
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
					{documents.map((documentUrl, index) => (
						<FileItem
							key={`${documentUrl}-${index}`}
							documentUrl={documentUrl}
							showDownload={true}
							disabled={disabled}
							onDownload={handleDownload}
						/>
					))}
				</div>
			</Space>
		</Card>
	);
}
