'use client';

import { Space } from 'antd';

import { FileUploadSection } from '@/components/features/student/TrackProgress/MilestoneDetail/FileUploadSection';
import { SubmissionActions } from '@/components/features/student/TrackProgress/MilestoneDetail/SubmissionActions';
import { SubmissionWarning } from '@/components/features/student/TrackProgress/MilestoneDetail/SubmissionWarning';

interface UploadInfo {
	readonly fileList: Array<{
		readonly originFileObj?: File;
		readonly name: string;
	}>;
}

interface MilestoneSubmissionFormProps {
	readonly files: File[];
	readonly canSubmit: boolean;
	readonly isSubmitting: boolean;
	readonly isUpdateMode: boolean;
	readonly hasSubmittedDocuments: boolean;
	readonly submissionMessage: string;
	readonly onFileChange: (info: UploadInfo) => void;
	readonly onRemoveFile: (fileName: string, fileSize: number) => void;
	readonly onCancelUpdate: () => void;
	readonly onSubmit: () => void;
}

export function MilestoneSubmissionForm({
	files,
	canSubmit,
	isSubmitting,
	isUpdateMode,
	hasSubmittedDocuments,
	submissionMessage,
	onFileChange,
	onRemoveFile,
	onCancelUpdate,
	onSubmit,
}: MilestoneSubmissionFormProps) {
	return (
		<Space direction="vertical" size={8} style={{ width: '100%' }}>
			<SubmissionWarning message={submissionMessage} canSubmit={canSubmit} />

			<FileUploadSection
				files={files}
				canSubmit={canSubmit}
				isSubmitting={isSubmitting}
				onFileChange={onFileChange}
				onRemoveFile={onRemoveFile}
			/>

			<SubmissionActions
				hasFiles={files.length > 0}
				isUpdateMode={isUpdateMode}
				canSubmit={canSubmit}
				isSubmitting={isSubmitting}
				hasSubmittedDocuments={hasSubmittedDocuments}
				onCancel={onCancelUpdate}
				onSubmit={onSubmit}
			/>
		</Space>
	);
}
