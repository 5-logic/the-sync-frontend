import { Card, Col, Row, Space, Typography } from 'antd';
import React, { useMemo } from 'react';

import { supervisorLoadData } from '@/data/moderatorStats';

const { Text, Title } = Typography;

// Constants được tách ra ngoài để dễ bảo trì
const CHART_CONSTANTS = {
	maxValue: 8,
	itemHeight: 60,
	gridValues: [0, 2, 4, 6, 8],
	padding: {
		container: 24,
		chart: 28,
		legend: 16,
	},
	positions: {
		yAxisWidth: 110,
		gridTop: 20,
		gridBottom: 40,
		axisHeight: 20,
		barHeight: 28,
	},
} as const;

// Kết hợp colors và gradients thành một object để dễ quản lý
const CATEGORY_STYLES: Record<string, { color: string; gradient: string }> = {
	'Over Load': {
		color: '#ff4757',
		gradient: 'linear-gradient(135deg, #ff4757 0%, #ff3838 100%)',
	},
	'High Load': {
		color: '#ffa502',
		gradient: 'linear-gradient(135deg, #ffa502 0%, #ff9500 100%)',
	},
	'Moderate Load': {
		color: '#3742fa',
		gradient: 'linear-gradient(135deg, #3742fa 0%, #2f3542 100%)',
	},
	'Low Load': {
		color: '#2ed573',
		gradient: 'linear-gradient(135deg, #2ed573 0%, #1dd1a1 100%)',
	},
} as const;

const SupervisorLoadChart: React.FC = () => {
	// Memoize các giá trị tính toán để tối ưu performance
	const chartConfig = useMemo(
		() => ({
			minHeight: supervisorLoadData.length * CHART_CONSTANTS.itemHeight + 80,
		}),
		[],
	);

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

				<div style={{ padding: '5px' }}>
					{/* Chart container with grid */}
					<div
						style={{
							position: 'relative',
							backgroundColor: '#fafafa',
							borderRadius: '18px',
							padding: `${CHART_CONSTANTS.padding.chart}px`,
							border: '1px solid #e8e8e8',
							overflow: 'visible',
							minHeight: `${chartConfig.minHeight}px`,
							boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
						}}
					>
						{/* Grid lines */}
						<div
							style={{
								position: 'absolute',
								top: CHART_CONSTANTS.positions.gridTop,
								left: CHART_CONSTANTS.positions.yAxisWidth,
								right: 20,
								bottom: CHART_CONSTANTS.positions.gridBottom,
							}}
						>
							{CHART_CONSTANTS.gridValues.map((i) => (
								<div
									key={i}
									style={{
										position: 'absolute',
										left: `${(i / CHART_CONSTANTS.maxValue) * 100}%`,
										top: 0,
										bottom: 0,
										width: '1px',
										borderLeft:
											i === 0 ? '1px solid #d9d9d9' : '1px dashed #dad5d5ff',
										zIndex: 1,
									}}
								/>
							))}
							{/* Horizontal grid lines */}
							{supervisorLoadData.map((_, index) => (
								<div
									key={`h-${index}`}
									style={{
										position: 'absolute',
										left: 0,
										right: 0,
										top: `${50 + index * CHART_CONSTANTS.itemHeight}px`,
										height: '1px',
										borderTop: '1px dashed #dad5d5ff',
										zIndex: 1,
									}}
								/>
							))}
						</div>

						{/* Y-axis labels */}
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: CHART_CONSTANTS.positions.gridTop,
								bottom: 50,
								width: `${CHART_CONSTANTS.positions.yAxisWidth}px`,
							}}
						>
							{supervisorLoadData.map((item, index) => (
								<div
									key={index}
									style={{
										position: 'absolute',
										right: '12px',
										top: `${50 + index * CHART_CONSTANTS.itemHeight}px`,
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
								left: CHART_CONSTANTS.positions.yAxisWidth,
								top: CHART_CONSTANTS.positions.gridTop,
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
										top: `${50 + index * CHART_CONSTANTS.itemHeight}px`,
										height: `${CHART_CONSTANTS.positions.barHeight}px`,
										width: `${(item.count / CHART_CONSTANTS.maxValue) * 100}%`,
										background: CATEGORY_STYLES[item.category]?.gradient,
										transform: 'translateY(-50%)',
										transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
										boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
										border: '1px solid rgba(255,255,255,0.4)',
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
								left: CHART_CONSTANTS.positions.yAxisWidth,
								right: 20,
								height: `${CHART_CONSTANTS.positions.axisHeight}px`,
								borderTop: '2px solid #d9d9d9',
							}}
						>
							{CHART_CONSTANTS.gridValues.map((i) => (
								<div
									key={i}
									style={{
										position: 'absolute',
										left: `${(i / CHART_CONSTANTS.maxValue) * 100}%`,
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
						padding: `${CHART_CONSTANTS.padding.legend}px 20px`,
					}}
				>
					<Row gutter={[32, 12]} justify="center">
						{Object.entries(CATEGORY_STYLES).map(([label, style]) => (
							<Col key={label}>
								<Space size="small" align="center">
									<div
										style={{
											width: '18px',
											height: '14px',
											background: style.gradient,
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

export default React.memo(SupervisorLoadChart);
