'use client';

import { DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Grid, Row, Spin, Steps, Typography } from 'antd';
import { useEffect } from 'react';

import CardLoadingSkeleton from '@/components/common/loading/CardLoadingSkeleton';
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
	loading?: boolean; // Initial skeleton loading
	milestoneLoading?: boolean; // Spin loading when changing milestone
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
	loading: initialLoading = false,
	milestoneLoading = false,
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

	// Show skeleton loading for initial load
	if (initialLoading) {
		return <CardLoadingSkeleton />;
	}

	return (
		<Spin spinning={milestoneLoading || submissionLoading}>
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
				{milestone?.startDate && milestone?.endDate && (
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
					{/* Submission Files Section */}
					{hasDocuments(submission) ? (
						<div style={{ marginBottom: 16 }}>
							<Text strong>
								Submission Files ({getDocuments(submission).length} files):
							</Text>
							<div
								style={{
									background: '#fafafa',
									border: '1px solid #f0f0f0',
									borderRadius: '6px',
									padding: '12px',
								}}
							>
								{getDocuments(submission).map((docUrl, index) => (
									<div
										key={docUrl}
										style={{
											display: 'flex',
											alignItems: 'center',
											padding: '8px 0',
											borderBottom:
												index < getDocuments(submission).length - 1
													? '1px solid #f0f0f0'
													: 'none',
										}}
									>
										<DownloadOutlined
											style={{
												color: '#1890ff',
												marginRight: 8,
												fontSize: '14px',
											}}
										/>
										<Button
											type="link"
											size="small"
											style={{
												paddingLeft: 0,
												color: '#1890ff',
												fontSize: '14px',
												textAlign: 'left',
												height: 'auto',
												display: 'flex',
												alignItems: 'center',
											}}
											onClick={() => window.open(docUrl, '_blank')}
										>
											{getFileNameFromUrl(docUrl)}
										</Button>
									</div>
								))}
							</div>
						</div>
					) : (
						<div style={{ marginBottom: 16 }}>
							<Text
								strong
								style={{ fontSize: '16px', marginBottom: 8, display: 'block' }}
							>
								Submission Files:
							</Text>
							<div
								style={{
									background: '#fafafa',
									border: '1px solid #f0f0f0',
									borderRadius: '6px',
									padding: '12px',
									textAlign: 'center',
								}}
							>
								<Text type="secondary">
									{isFullMockGroup(group) && group.submissionFile
										? group.submissionFile
										: 'No submission files available'}
								</Text>
							</div>
						</div>
					)}

					{/* Submission Details */}
					<Row justify="space-between" wrap style={{ marginBottom: 16 }}>
						<Col
							span={screens.xs ? 24 : 12}
							style={{ marginBottom: screens.xs ? 8 : 0 }}
						>
							<Text strong>Submission Date: </Text>
							<Text>
								{(() => {
									if (submission) {
										return new Date(submission.createdAt).toLocaleDateString();
									}

									if (isFullMockGroup(group) && group.submissionDate) {
										return group.submissionDate;
									}

									return 'No submission yet';
								})()}
							</Text>
						</Col>
					</Row>

					{/* Additional submission info */}
					{submission && (
						<>
							<Row style={{ marginBottom: 16 }}>
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
