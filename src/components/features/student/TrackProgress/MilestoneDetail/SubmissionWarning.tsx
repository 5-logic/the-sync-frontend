'use client';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';

interface SubmissionWarningProps {
	readonly message: string;
	readonly canSubmit: boolean;
}

export function SubmissionWarning({
	message,
	canSubmit,
}: SubmissionWarningProps) {
	if (canSubmit) {
		return (
			<Card
				size="small"
				style={{
					backgroundColor: '#fffbe6',
					border: '1px solid #ffe58f',
				}}
			>
				<Typography.Text type="warning">
					<ExclamationCircleOutlined style={{ marginRight: 6 }} />
					Please make sure to submit your report before the deadline.
				</Typography.Text>
			</Card>
		);
	}

	return (
		<Card
			size="small"
			style={{
				backgroundColor: '#fff7e6',
				border: '1px solid #ffd591',
			}}
		>
			<Typography.Text type="warning">
				<ExclamationCircleOutlined style={{ marginRight: 6 }} />
				{message}
			</Typography.Text>
		</Card>
	);
}
