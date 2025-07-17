'use client';

import { Button, Col, Row, Space } from 'antd';

interface SubmissionActionsProps {
	readonly hasFiles: boolean;
	readonly isUpdateMode: boolean;
	readonly canSubmit: boolean;
	readonly isSubmitting: boolean;
	readonly hasSubmittedDocuments: boolean;
	readonly onCancel: () => void;
	readonly onSubmit: () => void;
}

export function SubmissionActions({
	hasFiles,
	isUpdateMode,
	canSubmit,
	isSubmitting,
	hasSubmittedDocuments,
	onCancel,
	onSubmit,
}: SubmissionActionsProps) {
	const getSubmitButtonText = (
		isSubmitting: boolean,
		hasSubmittedDocuments: boolean,
	): string => {
		if (isSubmitting) {
			return 'Processing...';
		}

		return hasSubmittedDocuments ? 'Update Submission' : 'Submit Milestone';
	};

	if (!hasFiles && !isUpdateMode) {
		return null;
	}

	return (
		<Row align="middle" justify="end" style={{ marginTop: 16 }}>
			<Col>
				<Space size={8} wrap>
					{/* Cancel button for update mode */}
					{isUpdateMode && (
						<Button onClick={onCancel} disabled={isSubmitting}>
							Cancel Update
						</Button>
					)}

					{/* Submit button - only show when there are files */}
					{hasFiles && (
						<Button
							type="primary"
							size="large"
							onClick={onSubmit}
							disabled={!canSubmit || !hasFiles || isSubmitting}
							loading={isSubmitting}
						>
							{getSubmitButtonText(isSubmitting, hasSubmittedDocuments)}
						</Button>
					)}
				</Space>
			</Col>
		</Row>
	);
}
