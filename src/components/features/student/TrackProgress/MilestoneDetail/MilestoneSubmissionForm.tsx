'use client';

import { Space } from 'antd';

import { FileUploadSection } from '@/components/features/student/TrackProgress/MilestoneDetail/FileUploadSection';
import { SubmissionActions } from '@/components/features/student/TrackProgress/MilestoneDetail/SubmissionActions';
import { SubmissionWarning } from '@/components/features/student/TrackProgress/MilestoneDetail/SubmissionWarning';

interface UploadInfo {
	fileList: Array<{
		originFileObj?: File;
		name: string;
	}>;
}

interface MilestoneSubmissionFormProps {
	files: File[];
	canSubmit: boolean;
	isSubmitting: boolean;
	isUpdateMode: boolean;
	hasSubmittedDocuments: boolean;
	submissionMessage: string;
	onFileChange: (info: UploadInfo) => void;
	onRemoveFile: (fileName: string, fileSize: number) => void;
	onCancelUpdate: () => void;
	onSubmit: () => void;
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
