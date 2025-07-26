'use client';

import { Card, Space } from 'antd';

import { DocumentUploadButton } from '@/components/common/FileUpload/DocumentUploadButton';
import { FileItem } from '@/components/common/FileUpload/FileItem';
import { FormLabel } from '@/components/common/FormLabel';
import { useDocumentManagement } from '@/hooks/ui/useDocumentManagement';

interface DocumentEditSectionProps {
	readonly existingDocuments: string[]; // URLs of existing documents
	readonly newFiles: File[]; // New files to upload
	readonly onExistingDocumentsChange: (documents: string[]) => void;
	readonly onNewFilesChange: (files: File[]) => void;
	readonly disabled?: boolean;
}

export function DocumentEditSection({
	existingDocuments,
	newFiles,
	onExistingDocumentsChange,
	onNewFilesChange,
	disabled = false,
}: DocumentEditSectionProps) {
	const {
		uploading,
		handleRemoveExistingDocument,
		handleFileSelect,
		handleRemoveNewFile,
	} = useDocumentManagement({
		existingDocuments,
		newFiles,
		onExistingDocumentsChange,
		onNewFilesChange,
	});

	return (
		<Card
			size="small"
			style={{
				backgroundColor: '#fafafa',
				border: '1px solid #d9d9d9',
			}}
		>
			<Space direction="vertical" size={12} style={{ width: '100%' }}>
				<FormLabel text="Template Documents" isBold />
				<div style={{ fontSize: 13, color: '#666', marginTop: -8 }}>
					Manage template documents for this milestone
				</div>

				{/* Display existing documents */}
				{existingDocuments.length > 0 && (
					<div>
						<div style={{ fontWeight: 500, marginBottom: 8, color: '#333' }}>
							Existing Documents:
						</div>
						{existingDocuments.map((documentUrl, index) => (
							<FileItem
								key={`existing-${documentUrl}-${index}`}
								documentUrl={documentUrl}
								variant="existing"
								disabled={disabled}
								onDelete={() => handleRemoveExistingDocument(documentUrl)}
							/>
						))}
					</div>
				)}

				{/* Display new files to upload */}
				{newFiles.length > 0 && (
					<div>
						<div style={{ fontWeight: 500, marginBottom: 8, color: '#333' }}>
							New Files to Upload:
						</div>
						{newFiles.map((file, index) => (
							<FileItem
								key={`new-${file.name}-${file.size}-${index}`}
								file={file}
								variant="new"
								disabled={disabled}
								onDelete={() => handleRemoveNewFile(file)}
							/>
						))}
					</div>
				)}

				{/* Upload section */}
				{!disabled && (
					<DocumentUploadButton
						onFilesSelect={handleFileSelect}
						disabled={disabled}
						uploading={uploading}
						buttonText="Add More Documents"
						helpText="Support: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT (Max: 10MB per file)"
					/>
				)}
			</Space>
		</Card>
	);
}
