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
	const maxLoad = 5;

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
					<Space direction="vertical" size="middle" style={{ width: '100%' }}>
						{supervisorLoadData.map((item, index) => (
							<Row key={index} gutter={[16, 8]} align="middle">
								<Col span={5}>
									<Text strong style={{ fontSize: '14px' }}>
										{item.name}
									</Text>
								</Col>
								<Col span={14}>
									<div style={{ position: 'relative', width: '100%' }}>
										{/* Background bar */}
										<div
											style={{
												height: '24px',
												backgroundColor: '#f5f5f5',
												borderRadius: '12px',
												position: 'relative',
												overflow: 'hidden',
											}}
										>
											{/* Progress bar */}
											<div
												style={{
													height: '100%',
													width: `${(item.count / maxLoad) * 100}%`,
													backgroundColor: CATEGORY_COLORS[item.category],
													borderRadius: '12px',
													transition: 'width 0.6s ease-in-out',
													boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
													position: 'relative',
												}}
											>
												{/* Shimmer effect */}
												<div
													style={{
														position: 'absolute',
														top: 0,
														left: 0,
														right: 0,
														bottom: 0,
														background:
															'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
														animation: 'shimmer 2s infinite',
													}}
												/>
											</div>

											{/* Value label on bar */}
											<div
												style={{
													position: 'absolute',
													top: '50%',
													left: `${Math.min((item.count / maxLoad) * 100 + 5, 90)}%`,
													transform: 'translateY(-50%)',
													fontSize: '12px',
													fontWeight: 'bold',
													color:
														(item.count / maxLoad) * 100 < 20 ? '#666' : '#fff',
												}}
											>
												{item.count}/{maxLoad}
											</div>
										</div>
									</div>
								</Col>
								<Col span={5}>
									<Space size="small" align="center">
										<div
											style={{
												width: '8px',
												height: '8px',
												borderRadius: '50%',
												backgroundColor: CATEGORY_COLORS[item.category],
											}}
										/>
										<Text style={{ fontSize: '12px', color: '#666' }}>
											{item.category}
										</Text>
									</Space>
								</Col>
							</Row>
						))}
					</Space>
				</div>

				{/* Legend */}
				<div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
					<Row gutter={[16, 8]} justify="center">
						{Object.entries(CATEGORY_COLORS).map(([label, color]) => (
							<Col key={label}>
								<Space size="small" align="center">
									<div
										style={{
											width: '12px',
											height: '12px',
											borderRadius: '6px',
											backgroundColor: color,
											boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
										}}
									/>
									<Text style={{ fontSize: '12px' }}>{label}</Text>
								</Space>
							</Col>
						))}
					</Row>
				</div>
			</Space>

			{/* Add shimmer animation styles */}
			<style
				dangerouslySetInnerHTML={{
					__html: `
					@keyframes shimmer {
						0% { transform: translateX(-100%); }
						100% { transform: translateX(100%); }
					}
				`,
				}}
			/>
		</Card>
	);
};

export default SupervisorLoadChart;
