import { Card, Col, Row, Space, Typography } from 'antd';
import React from 'react';

import { supervisorLoadData } from '@/data/moderatorStats';

const { Text, Title } = Typography;

const CATEGORY_COLORS: Record<string, string> = {
	'Over Load': '#ff4d4f',
	'High Load': '#faad14',
	'Moderate Load': '#1890ff',
	'Low Load': '#52c41a',
};

const SupervisorLoadChart: React.FC = () => {
	return (
		<Card>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Title level={4} style={{ margin: 0 }}>
						Supervisor Load Distribution
					</Title>
					<Text type="secondary">
						Number of groups assigned to each supervisor (Max load: 5 groups)
					</Text>
				</Space>

				<div style={{ padding: '20px 0' }}>
					{/* Chart container with grid */}
					<div
						style={{
							position: 'relative',
							backgroundColor: '#fafafa',
							borderRadius: '8px',
							padding: '20px',
							border: '1px solid #f0f0f0',
						}}
					>
						{/* Grid lines */}
						<div
							style={{
								position: 'absolute',
								top: 0,
								left: 100,
								right: 0,
								bottom: 0,
							}}
						>
							{[0, 2, 4, 6, 8].map((i) => (
								<div
									key={i}
									style={{
										position: 'absolute',
										left: `${(i / 8) * 100}%`,
										top: 0,
										bottom: 0,
										width: '1px',
										backgroundColor: i === 0 ? '#d9d9d9' : '#f0f0f0',
										zIndex: 1,
									}}
								/>
							))}
							{/* Horizontal grid lines */}
							{supervisorLoadData
								.map((_, index) => (
									<div
										key={`h-${index}`}
										style={{
											position: 'absolute',
											left: 0,
											right: 0,
											top: `${50 + index * 60}px`, // Center between bars
											height: '1px',
											backgroundColor: '#f0f0f0',
											zIndex: 1,
										}}
									/>
								))
								.slice(0, -1)}{' '}
							{/* Remove last line */}
						</div>

						{/* Y-axis labels */}
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: 0,
								bottom: 0,
								width: '100px',
							}}
						>
							{supervisorLoadData.map((item, index) => (
								<div
									key={index}
									style={{
										position: 'absolute',
										right: '10px',
										top: `${50 + index * 60}px`, // Align with horizontal grid lines (center between bars)
										fontSize: '12px',
										color: '#666',
										fontWeight: '500',
										transform: 'translateY(-50%)', // Center vertically
									}}
								>
									{item.name}
								</div>
							))}
						</div>

						{/* X-axis labels */}
						<div
							style={{
								position: 'absolute',
								bottom: '-25px',
								left: 100,
								right: 0,
								height: '20px',
							}}
						>
							{[0, 2, 4, 6, 8].map((i) => (
								<div
									key={i}
									style={{
										position: 'absolute',
										left: `${(i / 8) * 100}%`,
										fontSize: '12px',
										color: '#666',
										transform: 'translateX(-50%)',
									}}
								>
									{i}
								</div>
							))}
						</div>

						{/* Chart bars */}
						<div
							style={{ position: 'relative', paddingLeft: '100px', zIndex: 2 }}
						>
							{supervisorLoadData.map((item, index) => (
								<div
									key={index}
									style={{
										height: '24px',
										marginBottom: '36px',
										position: 'relative',
										marginTop: index === 0 ? '8px' : '0', // Start position
										display: 'flex',
										alignItems: 'center',
									}}
								>
									<div
										style={{
											height: '100%',
											width: `${(item.count / 8) * 100}%`,
											backgroundColor: CATEGORY_COLORS[item.category],
											borderRadius: '0 4px 4px 0',
											transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
											boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
											position: 'relative',
										}}
									>
										{/* Value label */}
										<div
											style={{
												position: 'absolute',
												right: '-30px',
												top: '50%',
												transform: 'translateY(-50%)',
												fontSize: '12px',
												fontWeight: 'bold',
												color: '#333',
												minWidth: '25px',
											}}
										>
											{item.count}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Legend */}
				<div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
					<Row gutter={[24, 8]} justify="center">
						{Object.entries(CATEGORY_COLORS).map(([label, color]) => (
							<Col key={label}>
								<Space size="small" align="center">
									<div
										style={{
											width: '16px',
											height: '12px',
											backgroundColor: color,
											borderRadius: '2px',
										}}
									/>
									<Text style={{ fontSize: '12px', color: '#666' }}>
										{label}
									</Text>
								</Space>
							</Col>
						))}
					</Row>
				</div>
			</Space>
		</Card>
	);
};

export default SupervisorLoadChart;
