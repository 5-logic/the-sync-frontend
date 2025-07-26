'use client';

import { DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Grid, Row, Spin, Steps, Typography } from 'antd';
import { useEffect } from 'react';

import type { FullMockGroup } from '@/data/group';
import { useSubmission } from '@/hooks/lecturer/useSubmission';
import { Group, SupervisedGroup } from '@/lib/services/groups.service';
import { GroupDashboard } from '@/schemas/group';
import { Milestone } from '@/schemas/milestone';
import { SubmissionDetail } from '@/schemas/submission';

interface Props {
	group: FullMockGroup | Group | GroupDashboard | SupervisedGroup;
	milestone: Milestone | null;
	milestones?: Milestone[];
	onMilestoneChange?: (milestone: Milestone) => void;
	loading?: boolean;
}

const { Text } = Typography;
const { useBreakpoint } = Grid;
const { Step } = Steps;

/**
 * Extract filename from URL
 * @param url - The URL string
 * @returns The filename or fallback text
 */
const getFileNameFromUrl = (url: string): string => {
	try {
		const urlParts = url.split('/');
		const fileName = urlParts[urlParts.length - 1];
		// Decode URI component to handle encoded characters
		return decodeURIComponent(fileName) || 'Document';
	} catch {
		return 'Document';
	}
};

export default function MilestoneDetailCard({
	group,
	milestone,
	milestones = [],
	onMilestoneChange,
	loading: externalLoading = false,
}: Readonly<Props>) {
	const screens = useBreakpoint();

	// Submission hook for API data
	const {
		submission,
		loading: submissionLoading,
		error,
		fetchSubmission,
	} = useSubmission();

	// Helper functions for safe data access
	const hasDocuments = (sub: SubmissionDetail | null): boolean => {
		try {
			return Boolean(
				sub?.documents &&
					Array.isArray(sub.documents) &&
					sub.documents.length > 0,
			);
		} catch {
			return false;
		}
	};

	const hasAssignmentReviews = (sub: SubmissionDetail | null): boolean => {
		try {
			return Boolean(
				sub?.assignmentReviews &&
					Array.isArray(sub.assignmentReviews) &&
					sub.assignmentReviews.length > 0,
			);
		} catch {
			return false;
		}
	};

	const getDocuments = (sub: SubmissionDetail | null): string[] => {
		try {
			return sub?.documents || [];
		} catch {
			return [];
		}
	};

	const getAssignmentReviews = (sub: SubmissionDetail | null) => {
		try {
			return sub?.assignmentReviews || [];
		} catch {
			return [];
		}
	};

	// Fetch submission when group and milestone change
	useEffect(() => {
		if (group?.id && milestone?.id) {
			fetchSubmission(group.id, milestone.id);
		}
	}, [group?.id, milestone?.id, fetchSubmission]);

	// Type guards for different group types
	const isFullMockGroup = (
		g: FullMockGroup | Group | GroupDashboard | SupervisedGroup,
	): g is FullMockGroup => {
		try {
			return (
				g &&
				typeof g === 'object' &&
				'submissionFile' in g &&
				'submissionDate' in g &&
				'uploadedBy' in g
			);
		} catch {
			return false;
		}
	};

	// Early safety checks after hooks
	if (!group || typeof group !== 'object') {
		return <Card title="No Group Available" />;
	}

	return (
		<Spin
			spinning={externalLoading || submissionLoading}
			tip={
				externalLoading
					? 'Loading milestone details...'
					: submissionLoading
						? 'Loading submission...'
						: ''
			}
		>
			<Card
				title={milestone?.name ? `Milestone - ${milestone.name}` : 'Milestone'}
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
				{/* Milestone Steps */}
				{milestones.length > 0 && (
					<Steps
						current={milestones.findIndex((m) => m.id === milestone?.id)}
						style={{ marginBottom: 16 }}
					>
						{milestones.map((ms) => (
							<Step
								key={ms.id}
								title={ms.name}
								onClick={() => onMilestoneChange?.(ms)}
								style={{ cursor: 'pointer' }}
							/>
						))}
					</Steps>
				)}
				{/* Milestone information */}
				{milestone && milestone.startDate && milestone.endDate && (
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
				{error && (
					<div style={{ marginBottom: 16 }}>
						<Typography.Text type="danger">
							Error loading submission: {error}
						</Typography.Text>
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
								{hasDocuments(submission)
									? getFileNameFromUrl(getDocuments(submission)[0] || '')
									: isFullMockGroup(group) && group.submissionFile
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
								disabled={!hasDocuments(submission)}
								onClick={() => {
									if (hasDocuments(submission)) {
										const docs = getDocuments(submission);
										if (docs[0]) {
											window.open(docs[0], '_blank');
										}
									}
								}}
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
								{submission
									? new Date(submission.createdAt).toLocaleDateString()
									: isFullMockGroup(group) && group.submissionDate
										? group.submissionDate
										: 'No submission yet'}
							</Text>
						</Col>
						<Col span={screens.xs ? 24 : 'auto'}>
							<Text type="secondary">
								Uploaded by:{' '}
								{submission && submission.group
									? `Group ${submission.group.code}`
									: isFullMockGroup(group) && group.uploadedBy
										? group.uploadedBy
										: 'N/A'}
							</Text>
						</Col>
					</Row>

					{/* Additional submission info */}
					{submission && (
						<>
							<Row style={{ marginTop: 16 }}>
								<Col span={24}>
									<Text strong>Status: </Text>
									<Text
										type={
											submission.status === 'Submitted' ? 'success' : 'warning'
										}
									>
										{submission.status}
									</Text>
								</Col>
							</Row>

							{hasDocuments(submission) &&
								getDocuments(submission).length > 1 && (
									<Row style={{ marginTop: 8 }}>
										<Col span={24}>
											<Text strong>Additional Files:</Text>
											{getDocuments(submission)
												.slice(1)
												.map((docUrl, index) => (
													<div key={index} style={{ marginTop: 4 }}>
														<Button
															type="link"
															size="small"
															style={{ paddingLeft: 0 }}
															onClick={() => window.open(docUrl, '_blank')}
														>
															{getFileNameFromUrl(docUrl)}
														</Button>
													</div>
												))}
										</Col>
									</Row>
								)}

							{hasAssignmentReviews(submission) && (
								<Row style={{ marginTop: 16 }}>
									<Col span={24}>
										<Text strong>Reviewers:</Text>
										{getAssignmentReviews(submission).map((review, index) => (
											<div key={review.reviewerId} style={{ marginTop: 4 }}>
												<Text type="secondary">
													{index + 1}. {review.reviewer.user.fullName}
												</Text>
											</div>
										))}
									</Col>
								</Row>
							)}
						</>
					)}
				</div>
			</Card>
		</Spin>
	);
}
