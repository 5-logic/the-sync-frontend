'use client';

import { DownloadOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Typography } from 'antd';

import type { FullMockGroup } from '@/data/group';

interface Props {
	group: FullMockGroup;
	phase: string;
}

const { Text } = Typography;

export default function MilestoneDetailCard({ group, phase }: Readonly<Props>) {
	return (
		<Card
			title={`Milestone - ${phase}`}
			style={{ height: '100%' }}
			bodyStyle={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				height: '100%',
				paddingTop: 4,
				paddingBottom: 12,
			}}
		>
			<div style={{ paddingBottom: 4 }}>
				<Row justify="space-between" align="middle" style={{ marginBottom: 4 }}>
					<Col>
						<Text>Submission file: {group.submissionFile}</Text>
					</Col>
					<Col>
						<Button type="link" icon={<DownloadOutlined />} size="small">
							Download File
						</Button>
					</Col>
				</Row>

				<Row justify="space-between">
					<Col>
						<Text>Submission Date: {group.submissionDate}</Text>
					</Col>
					<Col>
						<Text type="secondary">Uploaded by: {group.uploadedBy}</Text>
					</Col>
				</Row>
			</div>

			<div>
				<Input.TextArea rows={4} placeholder="Enter feedback or notes" />
				<Button
					icon={<SendOutlined />}
					type="primary"
					style={{ marginTop: 12 }}
				>
					Send Feedback
				</Button>
			</div>
		</Card>
	);
}
