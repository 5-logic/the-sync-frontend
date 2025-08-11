"use client";

import {
	Card,
	Col,
	Empty,
	Row,
	Skeleton,
	Space,
	Tooltip,
	Typography,
} from "antd";
import React, { useMemo } from "react";

import type { AIStatistic } from "@/lib/services/ai-statistics.service";

const { Text, Title } = Typography;

interface AIUsageChartProps {
	readonly statistics: AIStatistic[];
	readonly totalCalls: number;
	readonly loading?: boolean;
	readonly error?: string | null;
}

// Constants for chart styling
const CHART_SIZE = 200;
const STROKE_WIDTH = 20;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Add padding for scale effect
const SVG_PADDING = 20;
const SVG_SIZE = CHART_SIZE + SVG_PADDING * 2;

// Colors for different AI types
const AI_TYPE_COLORS = {
	CheckDuplicateThesis: "#1890ff",
	SuggestThesis: "#52c41a",
	SuggestParticipants: "#faad14",
} as const;

// Labels for display
const AI_TYPE_LABELS = {
	CheckDuplicateThesis: "Duplicate Check",
	SuggestThesis: "Thesis Suggestion",
	SuggestParticipants: "Participant Suggestion",
} as const;

const AIUsageChart: React.FC<AIUsageChartProps> = ({
	statistics,
	totalCalls,
	loading = false,
	error = null,
}) => {
	// Calculate chart data
	const chartData = useMemo(() => {
		if (!statistics || statistics.length === 0 || totalCalls === 0) {
			return [];
		}

		let accumulatedPercent = 0;

		return statistics.map((stat) => {
			const percentage = (stat.count / totalCalls) * 100;
			const strokeDasharray = `${(percentage / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
			const strokeDashoffset = (-accumulatedPercent * CIRCUMFERENCE) / 100;

			// Calculate angles for path-based segments
			const startAngle = (accumulatedPercent / 100) * 360;
			const endAngle = ((accumulatedPercent + percentage) / 100) * 360;

			const result = {
				type: stat.type,
				count: stat.count,
				percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
				color: AI_TYPE_COLORS[stat.type],
				label: AI_TYPE_LABELS[stat.type],
				strokeDasharray,
				strokeDashoffset,
				startAngle,
				endAngle,
			};

			accumulatedPercent += percentage;
			return result;
		});
	}, [statistics, totalCalls]);

	// Helper function to create SVG path for pie slice
	const createPieSlicePath = (startAngle: number, endAngle: number) => {
		const centerX = SVG_SIZE / 2;
		const centerY = SVG_SIZE / 2;
		const outerRadius = RADIUS + STROKE_WIDTH / 2;
		const innerRadius = RADIUS - STROKE_WIDTH / 2;

		const startAngleRad = (startAngle - 90) * (Math.PI / 180);
		const endAngleRad = (endAngle - 90) * (Math.PI / 180);

		const x1 = centerX + outerRadius * Math.cos(startAngleRad);
		const y1 = centerY + outerRadius * Math.sin(startAngleRad);
		const x2 = centerX + outerRadius * Math.cos(endAngleRad);
		const y2 = centerY + outerRadius * Math.sin(endAngleRad);

		const x3 = centerX + innerRadius * Math.cos(endAngleRad);
		const y3 = centerY + innerRadius * Math.sin(endAngleRad);
		const x4 = centerX + innerRadius * Math.cos(startAngleRad);
		const y4 = centerY + innerRadius * Math.sin(startAngleRad);

		const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

		return `
			M ${x1} ${y1}
			A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
			L ${x3} ${y3}
			A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
			Z
		`;
	};

	// Show loading state
	if (loading) {
		return (
			<Card>
				<Space direction="vertical" size="middle" style={{ width: "100%" }}>
					<Space direction="vertical" size="small" style={{ width: "100%" }}>
						<Skeleton.Input active size="large" style={{ width: 250 }} />
						<Skeleton.Input active size="small" style={{ width: 350 }} />
					</Space>
					<Row gutter={[24, 16]} align="middle">
						{/* Left Column - Pie Chart Skeleton */}
						<Col xs={24} sm={24} md={12} lg={10} xl={8}>
							<div style={{ textAlign: "center", padding: "20px 0" }}>
								<Skeleton.Avatar active size={SVG_SIZE} shape="circle" />
							</div>
						</Col>
						{/* Right Column - Legend Skeleton */}
						<Col xs={24} sm={24} md={12} lg={14} xl={16}>
							<Space
								direction="vertical"
								size="small"
								style={{ width: "100%" }}
							>
								{[1, 2, 3].map((i) => (
									<div
										key={`legend-skeleton-${i}`}
										style={{
											display: "flex",
											alignItems: "center",
											gap: 12,
											padding: "12px 16px",
										}}
									>
										<Skeleton.Avatar active size={20} shape="circle" />
										<Skeleton.Input
											active
											size="small"
											style={{ width: 140 }}
										/>
										<Skeleton.Input active size="small" style={{ width: 80 }} />
									</div>
								))}
							</Space>
						</Col>
					</Row>
				</Space>
			</Card>
		);
	}

	// Show empty state
	if (error || !statistics || statistics.length === 0 || totalCalls === 0) {
		return (
			<Card>
				<Space direction="vertical" size="middle" style={{ width: "100%" }}>
					<Space direction="vertical" size="small" style={{ width: "100%" }}>
						<Title level={4} style={{ margin: 0 }}>
							AI Usage Statistics
						</Title>
						<Text type="secondary">
							Track AI feature usage across the system this semester.
						</Text>
					</Space>
					<div style={{ textAlign: "center", padding: "40px 0" }}>
						<Empty
							description={
								error
									? "Error loading AI usage data"
									: "No AI usage data available for this semester"
							}
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						/>
					</div>
				</Space>
			</Card>
		);
	}

	return (
		<Card>
			<Space direction="vertical" size="middle" style={{ width: "100%" }}>
				{/* Header */}
				<Space direction="vertical" size="small" style={{ width: "100%" }}>
					<Title level={4} style={{ margin: 0 }}>
						AI Usage Statistics
					</Title>
					<Text type="secondary">
						Track AI feature usage across the system this semester.
					</Text>
				</Space>

				{/* Chart and Legend Layout */}
				<Row gutter={[24, 16]} align="middle">
					{/* Left Column - Pie Chart */}
					<Col xs={24} sm={24} md={12} lg={10} xl={8}>
						<div style={{ textAlign: "center", padding: "20px 0" }}>
							<div style={{ position: "relative", display: "inline-block" }}>
								<svg width={SVG_SIZE} height={SVG_SIZE}>
									{/* Data segments */}
									{chartData.map((segment) => (
										<Tooltip
											key={`tooltip-${segment.type}`}
											title={
												<div style={{ textAlign: "center" }}>
													<div style={{ fontWeight: "bold", marginBottom: 4 }}>
														{segment.label}
													</div>
													<div>
														{segment.count} calls ({segment.percentage}%)
													</div>
												</div>
											}
											placement="top"
										>
											<path
												d={createPieSlicePath(
													segment.startAngle,
													segment.endAngle,
												)}
												fill={segment.color}
												stroke="white"
												strokeWidth={2}
												style={{
													transition: "all 0.1s ease-in-out",
													cursor: "pointer",
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.filter = "brightness(1.15)";
													e.currentTarget.style.transform = "scale(1.05)";
													e.currentTarget.style.transformOrigin = `${SVG_SIZE / 2}px ${SVG_SIZE / 2}px`;
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.filter = "brightness(1)";
													e.currentTarget.style.transform = "scale(1)";
												}}
											/>
										</Tooltip>
									))}
								</svg>

								{/* Center text */}
								<div
									style={{
										position: "absolute",
										top: "50%",
										left: "50%",
										transform: "translate(-50%, -50%)",
										textAlign: "center",
									}}
								>
									<div
										style={{
											fontSize: "24px",
											fontWeight: "bold",
											color: "#262626",
										}}
									>
										{totalCalls}
									</div>
									<div style={{ fontSize: "14px", color: "#8c8c8c" }}>
										Total Calls
									</div>
								</div>
							</div>
						</div>
					</Col>

					{/* Right Column - Legend */}
					<Col xs={24} sm={24} md={12} lg={14} xl={16}>
						<Space direction="vertical" size="small" style={{ width: "100%" }}>
							{chartData.map((segment) => (
								<div
									key={`legend-${segment.type}`}
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										padding: "12px 16px",
										borderRadius: "8px",
										backgroundColor: "#fafafa",
										border: "1px solid #f0f0f0",
										transition: "all 0.2s ease",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = "#f5f5f5";
										e.currentTarget.style.transform = "translateY(-1px)";
										e.currentTarget.style.boxShadow =
											"0 2px 8px rgba(0,0,0,0.1)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = "#fafafa";
										e.currentTarget.style.transform = "translateY(0)";
										e.currentTarget.style.boxShadow = "none";
									}}
								>
									<div
										style={{ display: "flex", alignItems: "center", gap: 12 }}
									>
										<div
											style={{
												width: 20,
												height: 20,
												borderRadius: "50%",
												backgroundColor: segment.color,
												boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
											}}
										/>
										<Text strong style={{ fontSize: 15 }}>
											{segment.label}
										</Text>
									</div>
									<Space size={16}>
										<Text style={{ fontSize: 14, color: "#595959" }}>
											{segment.count} calls
										</Text>
										<Text strong style={{ fontSize: 15, color: segment.color }}>
											{segment.percentage}%
										</Text>
									</Space>
								</div>
							))}
						</Space>
					</Col>
				</Row>
			</Space>
		</Card>
	);
};

export default React.memo(AIUsageChart);
