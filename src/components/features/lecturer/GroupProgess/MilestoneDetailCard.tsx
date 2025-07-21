'use client';

import { DownloadOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Card, Col, Grid, Input, Row, Typography } from 'antd';

import type { FullMockGroup } from '@/data/group';
import { Group } from '@/lib/services/groups.service';
import { GroupDashboard } from '@/schemas/group';
import { Milestone } from '@/schemas/milestone';

interface Props {
	group: FullMockGroup | Group | GroupDashboard;
	milestone: Milestone | null;
}

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function MilestoneDetailCard({
	group,
	milestone,
}: Readonly<Props>) {
	const screens = useBreakpoint();

	// Type guards for different group types
	const isFullMockGroup = (
		g: FullMockGroup | Group | GroupDashboard,
	): g is FullMockGroup =>
		'submissionFile' in g && 'submissionDate' in g && 'uploadedBy' in g;

	return (
		<Card
			title={milestone ? `Milestone - ${milestone.name}` : 'Select a Milestone'}
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
				overflow: 'hidden',
			}}
		>
			{/* Milestone information */}
			{milestone && (
				<div
					style={{
						marginBottom: 16,
						padding: '12px',
						background: '#f5f5f5',
						borderRadius: '6px',
					}}
				>
					<Text strong>Milestone Period: </Text>
					<Text>
						{new Date(milestone.startDate).toLocaleDateString()} -{' '}
						{new Date(milestone.endDate).toLocaleDateString()}
					</Text>
				</div>
			)}

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
						<Text>
							Submission file:{' '}
							{isFullMockGroup(group)
								? group.submissionFile
								: 'No submission yet'}
						</Text>
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
						<Text>
							Submission Date:{' '}
							{isFullMockGroup(group)
								? group.submissionDate
								: 'No submission yet'}
						</Text>
					</Col>
					<Col span={screens.xs ? 24 : 'auto'}>
						<Text type="secondary">
							Uploaded by: {isFullMockGroup(group) ? group.uploadedBy : 'N/A'}
						</Text>
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
