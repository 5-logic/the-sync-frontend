'use client';

import { Card, Col, Row, Skeleton, Space } from 'antd';

/**
 * Assign Supervisor Page Loading Skeleton
 * Provides a specific skeleton for the assign supervisor page layout
 */
export default function AssignSupervisorSkeleton() {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			{/* Header section */}
			<Card variant="borderless">
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Skeleton.Input active size="large" style={{ width: '300px' }} />
					<Skeleton
						active
						paragraph={{ rows: 1, width: '60%' }}
						title={false}
					/>
				</Space>
			</Card>

			{/* Filter bar section */}
			<Card variant="borderless">
				<Row gutter={[16, 16]} align="middle">
					<Col xs={24} sm={12} md={8}>
						<Skeleton.Input active size="default" style={{ width: '100%' }} />
					</Col>
					<Col xs={24} sm={12} md={8}>
						<Skeleton.Input active size="default" style={{ width: '100%' }} />
					</Col>
					<Col xs={24} sm={24} md={8}>
						<Skeleton.Button active size="default" style={{ width: '100px' }} />
					</Col>
				</Row>
			</Card>

			{/* Table section */}
			<Card variant="borderless">
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					{/* Table header */}
					<Row gutter={16}>
						<Col span={4}>
							<Skeleton.Input active size="small" style={{ width: '100%' }} />
						</Col>
						<Col span={6}>
							<Skeleton.Input active size="small" style={{ width: '100%' }} />
						</Col>
						<Col span={4}>
							<Skeleton.Input active size="small" style={{ width: '100%' }} />
						</Col>
						<Col span={6}>
							<Skeleton.Input active size="small" style={{ width: '100%' }} />
						</Col>
						<Col span={4}>
							<Skeleton.Input active size="small" style={{ width: '100%' }} />
						</Col>
					</Row>

					{/* Table rows */}
					{Array.from({ length: 5 }).map(() => {
						const rowId = crypto.randomUUID();
						return (
							<Row key={rowId} gutter={16} style={{ marginTop: '16px' }}>
								<Col span={4}>
									<Skeleton active paragraph={{ rows: 1 }} title={false} />
								</Col>
								<Col span={6}>
									<Skeleton active paragraph={{ rows: 2 }} title={false} />
								</Col>
								<Col span={4}>
									<Skeleton active paragraph={{ rows: 1 }} title={false} />
								</Col>
								<Col span={6}>
									<Skeleton active paragraph={{ rows: 1 }} title={false} />
								</Col>
								<Col span={4}>
									<Skeleton.Button
										active
										size="default"
										style={{ width: '80px' }}
									/>
								</Col>
							</Row>
						);
					})}
				</Space>
			</Card>
		</Space>
	);
}
