'use client';

import { Card, Progress, Space, Typography } from 'antd';

import { progressOverview } from '@/data/moderatorStats';

const { Title, Text } = Typography;

export function ProgressOverview() {
	return (
		<Card>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Title level={4} style={{ margin: 0 }}>
						Semester Progress Overview
					</Title>
					<Text type="secondary">
						Track the overall progress of thesis management this semester.
					</Text>
				</Space>

				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					{progressOverview.map((item) => (
						<Space
							key={item.label}
							direction="vertical"
							size="small"
							style={{ width: '100%' }}
						>
							<Space style={{ width: '100%', justifyContent: 'space-between' }}>
								<Text strong style={{ fontSize: '14px' }}>
									{item.label}
								</Text>
								<Text strong style={{ fontSize: '14px' }}>
									{item.percent}%
								</Text>
							</Space>
							<Progress
								percent={item.percent}
								strokeColor={item.color}
								showInfo={false}
							/>
						</Space>
					))}
				</Space>
			</Space>
		</Card>
	);
}
