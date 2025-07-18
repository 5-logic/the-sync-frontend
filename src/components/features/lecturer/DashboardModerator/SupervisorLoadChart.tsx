import { Card, Col, Row, Space, Typography } from 'antd';
import React from 'react';

import { supervisorLoadData } from '@/data/moderatorStats';

const { Text, Title } = Typography;

const CATEGORY_COLORS: Record<string, string> = {
	'Over Load': '#ff4757',
	'High Load': '#ffa502',
	'Moderate Load': '#3742fa',
	'Low Load': '#2ed573',
};

const CATEGORY_GRADIENTS: Record<string, string> = {
	'Over Load': 'linear-gradient(135deg, #ff4757 0%, #ff3838 100%)',
	'High Load': 'linear-gradient(135deg, #ffa502 0%, #ff9500 100%)',
	'Moderate Load': 'linear-gradient(135deg, #3742fa 0%, #2f3542 100%)',
	'Low Load': 'linear-gradient(135deg, #2ed573 0%, #1dd1a1 100%)',
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

				<div style={{ padding: '24px 0' }}>
					{/* Chart container with grid */}
					<div
						style={{
							position: 'relative',
							backgroundColor: '#fafafa',
							borderRadius: '18px',
							padding: '28px',
							border: '1px solid #e8e8e8',
							overflow: 'visible',
							minHeight: `${supervisorLoadData.length * 60 + 80}px`,
							boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
						}}
					>
						{/* Grid lines */}
						<div
							style={{
								position: 'absolute',
								top: 20,
								left: 110,
								right: 20,
								bottom: 40,
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
											top: `${50 + index * 60}px`,
											height: '1px',
											backgroundColor: '#f0f0f0',
											zIndex: 1,
										}}
									/>
								))
								.slice(0, -1)}
						</div>

						{/* Y-axis labels */}
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: 20,
								bottom: 50,
								width: '110px',
							}}
						>
							{supervisorLoadData.map((item, index) => (
								<div
									key={index}
									style={{
										position: 'absolute',
										right: '12px',
										top: `${50 + index * 60}px`,
										fontSize: '13px',
										color: '#4a4a4a',
										fontWeight: '500',
										transform: 'translateY(-50%)',
									}}
								>
									{item.name}
								</div>
							))}
						</div>

						{/* Chart bars */}
						<div
							style={{
								position: 'absolute',
								left: 110,
								top: 20,
								bottom: 50,
								right: 20,
								zIndex: 2,
							}}
						>
							{supervisorLoadData.map((item, index) => (
								<div
									key={index}
									style={{
										position: 'absolute',
										top: `${50 + index * 60}px`,
										height: '28px',
										width: `${(item.count / 8) * 100}%`,
										background: CATEGORY_GRADIENTS[item.category],
										transform: 'translateY(-50%)',
										transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
										boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
										border: '1px solid rgba(255,255,255,0.2)',
									}}
								>
									{/* Bar value label */}
									<div
										style={{
											position: 'absolute',
											right: '8px',
											top: '50%',
											transform: 'translateY(-50%)',
											color: 'white',
											fontSize: '12px',
											fontWeight: 'bold',
											textShadow: '0 1px 2px rgba(0,0,0,0.3)',
										}}
									>
										{item.count}
									</div>
								</div>
							))}
						</div>

						{/* X-axis labels with axis line */}
						<div
							style={{
								position: 'absolute',
								bottom: '20px',
								left: 110,
								right: 20,
								height: '20px',
								borderTop: '2px solid #d9d9d9',
							}}
						>
							{[0, 2, 4, 6, 8].map((i) => (
								<div
									key={i}
									style={{
										position: 'absolute',
										left: `${(i / 8) * 100}%`,
										transform: 'translateX(-50%)',
										fontSize: '12px',
										color: '#595959',
										marginTop: '6px',
										fontWeight: '500',
									}}
								>
									{i}
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Legend */}
				<div
					style={{
						borderTop: '1px solid #e8e8e8',
						paddingTop: '20px',
						padding: '16px 20px',
					}}
				>
					<Row gutter={[32, 12]} justify="center">
						{Object.entries(CATEGORY_COLORS).map(([label]) => (
							<Col key={label}>
								<Space size="small" align="center">
									<div
										style={{
											width: '18px',
											height: '14px',
											background: CATEGORY_GRADIENTS[label],
											borderRadius: '7px',
											boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
											border: '1px solid rgba(255,255,255,0.2)',
										}}
									/>
									<Text
										style={{
											fontSize: '13px',
											color: '#4a4a4a',
											fontWeight: '500',
										}}
									>
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
