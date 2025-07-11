'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Space, Tag, Tooltip, Typography } from 'antd';
import { useRouter } from 'next/navigation';

import { FullMockGroup } from '@/data/group';

interface Props {
	group: FullMockGroup | null;
}

export default function ThesisStatusCard({ group }: Readonly<Props>) {
	const router = useRouter();

	const handleClick = () => {
		if (group) {
			router.push('/student/thesis-detail');
		}
	};

	return (
		<Card
			hoverable
			onClick={handleClick}
			style={{ height: '100%', cursor: group ? 'pointer' : 'default' }}
			title={
				<Tooltip title={group ? 'Click to view details' : ''}>
					<Space align="center">
						<FileTextOutlined style={{ color: '#1890ff' }} />
						<Typography.Text strong style={{ fontSize: 16, color: '#1890ff' }}>
							Thesis Status
						</Typography.Text>
					</Space>
				</Tooltip>
			}
		>
			{group ? (
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Tag color="green" style={{ width: 'fit-content' }}>
						Approved
					</Tag>

					<Space direction="vertical" size={4}>
						<Typography.Text type="secondary">Title</Typography.Text>
						<Typography.Text strong style={{ fontSize: 15 }}>
							{group.title}
						</Typography.Text>
					</Space>

					<Space direction="vertical" size={4}>
						<Typography.Text type="secondary">Submitted on</Typography.Text>
						<Typography.Text strong style={{ fontSize: 15 }}>
							{group.submissionDate ?? 'N/A'}
						</Typography.Text>
					</Space>

					<Space direction="vertical" size={4}>
						<Typography.Text type="secondary">Supervisor</Typography.Text>
						<Typography.Text strong style={{ fontSize: 15 }}>
							{group.supervisors.length > 0
								? group.supervisors.join(', ')
								: 'Unassigned'}
						</Typography.Text>
					</Space>
				</Space>
			) : (
				<Button type="primary" block>
					Register Thesis
				</Button>
			)}
		</Card>
	);
}
