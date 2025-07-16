'use client';

import { BarChartOutlined } from '@ant-design/icons';
import { Button, Card, Progress, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

interface ProgressOverviewCardProps {
	readonly thesisId?: string;
}

export default function ProgressOverviewCard({
	thesisId,
}: ProgressOverviewCardProps) {
	const router = useRouter();

	const handleViewThesisDetails = () => {
		if (thesisId) {
			router.push(`/student/list-thesis/${thesisId}`);
		}
	};
	return (
		<Card
			title={
				<Space>
					<BarChartOutlined />
					<span>Progress Overview</span>
				</Space>
			}
		>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				{/* Milestone notification */}
				<Card
					size="small"
					style={{
						backgroundColor: '#e6f4ff',
						borderColor: '#91d5ff',
					}}
				>
					<Space>
						<span style={{ color: '#1890ff' }}>ℹ️</span>
						<Text>Milestone 2 submission due in 5 days</Text>
					</Space>
				</Card>

				{/* Overall Progress */}
				<Space direction="vertical" size={8} style={{ width: '100%' }}>
					<Text type="secondary">Overall Progress</Text>
					<Progress percent={60} />
				</Space>

				{/* Review Status */}
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Space style={{ width: '100%', justifyContent: 'space-between' }}>
						<Space>
							<span style={{ color: '#52c41a' }}>●</span>
							<Text>Review 1</Text>
						</Space>
						<Text type="secondary">Completed on Dec 15, 2023</Text>
					</Space>
					<Space style={{ width: '100%', justifyContent: 'space-between' }}>
						<Space>
							<span style={{ color: '#1890ff' }}>●</span>
							<Text>Review 2</Text>
						</Space>
						<Text type="secondary">In Progress - Due Feb 1, 2024</Text>
					</Space>
				</Space>

				{/* Action Buttons */}
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Button type="primary" block>
						Track Milestones
					</Button>
					<Button block onClick={handleViewThesisDetails} disabled={!thesisId}>
						View Thesis Details
					</Button>
				</Space>
			</Space>
		</Card>
	);
}
