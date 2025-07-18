'use client';

import { Card, Skeleton, Space } from 'antd';

/**
 * Checklist Loading Skeleton - matches the structure of ChecklistDetail and ChecklistEdit pages
 */
export default function ChecklistLoadingSkeleton() {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			{/* Header section */}
			<Space direction="vertical" size="small" style={{ width: '100%' }}>
				<Skeleton.Input active size="large" style={{ width: '200px' }} />
				<Skeleton.Input active size="small" style={{ width: '400px' }} />
			</Space>

			{/* Checklist Info Card */}
			<Card
				title={
					<Skeleton.Input active size="small" style={{ width: '150px' }} />
				}
			>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Skeleton.Input active size="default" style={{ width: '100%' }} />
					<Skeleton.Input active size="default" style={{ width: '100%' }} />
					<Skeleton.Input active size="default" style={{ width: '200px' }} />
				</Space>
			</Card>

			{/* Checklist Items Table Card */}
			<Card
				title={
					<Skeleton.Input active size="small" style={{ width: '120px' }} />
				}
			>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					{/* Table header */}
					<div style={{ display: 'flex', gap: '16px' }}>
						<Skeleton.Input active size="small" style={{ width: '150px' }} />
						<Skeleton.Input active size="small" style={{ width: '200px' }} />
						<Skeleton.Input active size="small" style={{ width: '100px' }} />
						<Skeleton.Input active size="small" style={{ width: '80px' }} />
					</div>

					{/* Table rows */}
					{[...Array(5)].map((_, index) => (
						<div key={index} style={{ display: 'flex', gap: '16px' }}>
							<Skeleton.Input
								active
								size="default"
								style={{ width: '150px' }}
							/>
							<Skeleton.Input
								active
								size="default"
								style={{ width: '200px' }}
							/>
							<Skeleton.Input
								active
								size="default"
								style={{ width: '100px' }}
							/>
							<Skeleton.Input active size="default" style={{ width: '80px' }} />
						</div>
					))}
				</Space>
			</Card>

			{/* Action buttons */}
			<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
				<Skeleton.Button active size="default" />
				<Skeleton.Button active size="default" />
			</div>
		</Space>
	);
}
