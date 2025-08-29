import { SearchOutlined } from '@ant-design/icons';
import {
	Card,
	Col,
	Input,
	Row,
	Select,
	Skeleton,
	Space,
	Tooltip,
	Typography,
} from 'antd';
import React, { useMemo, useState } from 'react';

import type { SupervisorLoadDistribution } from '@/lib/services/dashboard.service';
import { createSearchFilter } from '@/lib/utils/textNormalization';
import { useDashboardStore } from '@/store';

const { Text, Title } = Typography;

// Constants được tách ra ngoài để dễ bảo trì
const CHART_CONSTANTS = {
	itemHeight: 42, // Reduced from 50 to 42 for even tighter spacing
	padding: {
		container: 24,
		chart: 28,
		legend: 16,
	},
	positions: {
		yAxisWidth: 140,
		gridTop: 20,
		gridBottom: 40,
		axisHeight: 20,
		barHeight: 20, // Reduced from 28 to 20 for thinner bars
		itemStartOffset: 80, // Offset from top to start positioning items
	},
} as const;

// Helper function to get category based on thesis count
const getLoadCategory = (count: number): string => {
	if (count >= 6) return 'Over Load';
	if (count >= 4) return 'High Load';
	if (count >= 2) return 'Moderate Load';
	return 'Low Load';
};

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

// Search and Filter Controls Component to avoid code duplication
const SearchFilterControls: React.FC<{
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	selectedCategory: string | null;
	setSelectedCategory: (value: string | null) => void;
	currentCount: number;
	totalCount: number;
}> = ({
	searchTerm,
	setSearchTerm,
	selectedCategory,
	setSelectedCategory,
	currentCount,
	totalCount,
}) => (
	<Row gutter={[16, 16]} align="middle">
		<Col xs={24} sm={16} md={14} lg={16}>
			<Input
				prefix={<SearchOutlined />}
				placeholder="Search by lecturer name or thesis count..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				allowClear
			/>
		</Col>
		<Col xs={24} sm={8} md={6} lg={5}>
			<Select
				style={{ width: '100%' }}
				placeholder="Filter category"
				value={selectedCategory}
				onChange={setSelectedCategory}
				allowClear
				options={[
					{ label: 'Over Load', value: 'Over Load' },
					{ label: 'High Load', value: 'High Load' },
					{ label: 'Moderate Load', value: 'Moderate Load' },
					{ label: 'Low Load', value: 'Low Load' },
				]}
			/>
		</Col>
		<Col xs={24} sm={24} md={4} lg={3}>
			<Text type="secondary" style={{ fontSize: '12px', textAlign: 'right' }}>
				{currentCount}/{totalCount}
			</Text>
		</Col>
	</Row>
);

const SupervisorLoadChart: React.FC = () => {
	const { supervisorLoadDistribution, loading, error } = useDashboardStore();

	// State for search and filter
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	// Transform API data to chart format with search and filter
	const chartData = useMemo(() => {
		if (
			!supervisorLoadDistribution ||
			supervisorLoadDistribution.length === 0
		) {
			return [];
		}

		let filteredData = supervisorLoadDistribution.map(
			(item: SupervisorLoadDistribution) => ({
				name: item.fullName,
				count: item.thesisCount,
				rawCount: item.rawThesisCount,
				category: getLoadCategory(item.thesisCount),
			}),
		);

		// Apply search filter
		if (searchTerm.trim()) {
			const searchFilter = createSearchFilter(
				searchTerm,
				(item: {
					name: string;
					count: number;
					rawCount: number;
					category: string;
				}) => [item.name, item.count.toString()],
			);
			filteredData = filteredData.filter(searchFilter);
		}

		// Apply category filter
		if (selectedCategory) {
			filteredData = filteredData.filter(
				(item) => item.category === selectedCategory,
			);
		}

		return filteredData;
	}, [supervisorLoadDistribution, searchTerm, selectedCategory]);

	// Calculate dynamic maxValue and gridValues based on actual data
	const chartConfig = useMemo(() => {
		const maxDataValue =
			chartData.length > 0
				? Math.max(...chartData.map((item) => item.count))
				: 8;

		// Set maxValue to be at least 8, or higher if data exceeds 8
		const dynamicMaxValue = Math.max(8, maxDataValue);

		// Generate gridValues with interval of 2 for tighter spacing
		const gridValues: number[] = [];
		for (let i = 0; i <= dynamicMaxValue; i += 2) {
			gridValues.push(i);
		}
		// Ensure we always include the maxValue
		if (!gridValues.includes(dynamicMaxValue)) {
			gridValues.push(dynamicMaxValue);
		}

		return {
			maxValue: dynamicMaxValue,
			gridValues,
			minHeight:
				chartData.length * CHART_CONSTANTS.itemHeight +
				CHART_CONSTANTS.positions.itemStartOffset +
				60,
		};
	}, [chartData]);

	// Show loading state
	if (loading) {
		return (
			<Card>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Skeleton.Input active size="large" style={{ width: 300 }} />
					<Skeleton.Input active size="small" style={{ width: 400 }} />
					<div style={{ padding: '20px 0' }}>
						{['bar-1', 'bar-2', 'bar-3', 'bar-4', 'bar-5'].map((barId) => (
							<div key={`skeleton-${barId}`} style={{ marginBottom: 16 }}>
								<Skeleton.Button
									active
									size="large"
									style={{ width: '100%', height: 40 }}
								/>
							</div>
						))}
					</div>
				</Space>
			</Card>
		);
	}

	// Show empty state if no data after filtering
	if (error || chartData.length === 0) {
		const hasData =
			supervisorLoadDistribution && supervisorLoadDistribution.length > 0;
		const isFiltered = searchTerm.trim() || selectedCategory;

		return (
			<Card>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Space direction="vertical" size="small" style={{ width: '100%' }}>
						<Title level={4} style={{ margin: 0 }}>
							Supervisor Load Distribution
						</Title>
						<Text type="secondary">
							Number of theses assigned to each supervisor
						</Text>
					</Space>

					{/* Show search and filter controls even when empty */}
					{hasData && (
						<SearchFilterControls
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							selectedCategory={selectedCategory}
							setSelectedCategory={setSelectedCategory}
							currentCount={0}
							totalCount={supervisorLoadDistribution?.length || 0}
						/>
					)}

					<div style={{ padding: '40px', textAlign: 'center' }}>
						<Text type="secondary">
							{(() => {
								if (error) {
									return 'Error loading supervisor load data';
								}
								if (hasData && isFiltered) {
									return 'No supervisors match your search criteria';
								}
								return 'No supervisor load data available for this semester';
							})()}
						</Text>
					</div>
				</Space>
			</Card>
		);
	}

	return (
		<Card>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Title level={4} style={{ margin: 0 }}>
						Supervisor Load Distribution
					</Title>
					<Text type="secondary">
						Number of theses assigned to each supervisor
					</Text>
				</Space>

				{/* Search and Filter Controls */}
				<SearchFilterControls
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					selectedCategory={selectedCategory}
					setSelectedCategory={setSelectedCategory}
					currentCount={chartData.length}
					totalCount={supervisorLoadDistribution?.length || 0}
				/>

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
							{chartConfig.gridValues.map((i) => (
								<div
									key={`grid-${i}`}
									style={{
										position: 'absolute',
										left: `${(i / chartConfig.maxValue) * 100}%`,
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
							{chartData.map((item, index) => (
								<div
									key={`h-${item.name}`}
									style={{
										position: 'absolute',
										left: 0,
										right: 0,
										top: `${CHART_CONSTANTS.positions.itemStartOffset + index * CHART_CONSTANTS.itemHeight}px`,
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
							{chartData.map((item, index) => (
								<div
									key={`y-label-${item.name}`}
									style={{
										position: 'absolute',
										right: '12px',
										top: `${CHART_CONSTANTS.positions.itemStartOffset + index * CHART_CONSTANTS.itemHeight}px`,
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
							{chartData.map((item, index) => (
								<Tooltip
									key={`bar-${item.name}`}
									title={
										<div>
											<div>
												<strong>{item.name}</strong>
											</div>
											<div>Assigned Theses: {item.rawCount}</div>
										</div>
									}
									placement="top"
								>
									<div
										style={{
											position: 'absolute',
											top: `${CHART_CONSTANTS.positions.itemStartOffset + index * CHART_CONSTANTS.itemHeight}px`,
											height: `${CHART_CONSTANTS.positions.barHeight}px`,
											width: `${(item.count / chartConfig.maxValue) * 100}%`,
											background: CATEGORY_STYLES[item.category]?.gradient,
											transform: 'translateY(-50%)',
											transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
											boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
											border: '1px solid rgba(255,255,255,0.4)',
											cursor: 'pointer',
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
								</Tooltip>
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
							{chartConfig.gridValues.map((i) => (
								<div
									key={`x-label-${i}`}
									style={{
										position: 'absolute',
										left: `${(i / chartConfig.maxValue) * 100}%`,
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
				</div>
			</Space>
		</Card>
	);
};

export default React.memo(SupervisorLoadChart);
