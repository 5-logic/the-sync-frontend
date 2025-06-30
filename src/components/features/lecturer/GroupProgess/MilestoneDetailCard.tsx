'use client';

import { DownloadOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Card, Col, Grid, Input, Row, Typography } from 'antd';

import type { FullMockGroup } from '@/data/group';

interface Props {
	group: FullMockGroup;
	phase: string;
}

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function MilestoneDetailCard({ group, phase }: Readonly<Props>) {
	const screens = useBreakpoint();

	return (
		<Card
			title={`Milestone - ${phase}`}
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
			bodyStyle={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				padding: screens.xs ? '12px' : '16px',
				overflow: 'hidden', // Quan trọng: ngăn overflow
			}}
		>
			{/* Phần nội dung có thể scroll */}
			<div
				style={{
					flex: 1,
					overflowY: 'auto',
					marginBottom: 16,
				}}
			>
				<Row
					justify="space-between"
					align="middle"
					wrap
					style={{ marginBottom: 8 }}
				>
					<Col span={screens.xs ? 24 : 'auto'}>
						<Text>Submission file: {group.submissionFile}</Text>
					</Col>
					<Col
						span={screens.xs ? 24 : 'auto'}
						style={{ marginTop: screens.xs ? 8 : 0 }}
					>
						<Button
							type="link"
							icon={<DownloadOutlined />}
							size="small"
							style={{ paddingLeft: 0 }}
						>
							Download File
						</Button>
					</Col>
				</Row>

				<Row justify="space-between" wrap style={{ marginTop: 8 }}>
					<Col
						span={screens.xs ? 24 : 'auto'}
						style={{ marginBottom: screens.xs ? 8 : 0 }}
					>
						<Text>Submission Date: {group.submissionDate}</Text>
					</Col>
					<Col span={screens.xs ? 24 : 'auto'}>
						<Text type="secondary">Uploaded by: {group.uploadedBy}</Text>
					</Col>
				</Row>
			</div>

			<div
				style={{
					flexShrink: 0,
					paddingTop: 16,
					borderTop: '1px solid #f0f0f0',
				}}
			>
				<Input.TextArea
					rows={screens.xs ? 3 : 4}
					placeholder="Enter feedback or notes"
				/>
				<Button
					icon={<SendOutlined />}
					type="primary"
					block={screens.xs}
					style={{ marginTop: 12 }}
				>
					Send Feedback
				</Button>
			</div>
		</Card>
	);
}
