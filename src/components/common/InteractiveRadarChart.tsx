"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, Typography, Slider, Row, Col, Space, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import BaseRadarChart, {
	ResponsibilityData,
	prepareChartData,
} from "./BaseRadarChart";

const { Title, Text } = Typography;

interface InteractiveRadarChartProps {
	readonly data: ResponsibilityData[];
	readonly originalData?: ResponsibilityData[]; // Original data for reset
	readonly loading?: boolean;
	readonly onChange?: (updatedData: ResponsibilityData[]) => void;
	readonly title?: string;
	readonly hasChanges?: boolean; // Receive hasChanges from parent
}

const LEVEL_NAMES = [
	"Beginner",
	"Intermediate",
	"Advanced",
	"Expert",
	"Master",
] as const;
const LEVEL_COLORS = [
	"#52c41a", // Green for low level (level 1)
	"#faad14", // Darker yellow for level 2 (Intermediate) - better visibility on white background
	"#fa8c16", // Orange for level 3
	"#ff4d4f", // Red for level 4
	"#1890ff", // Blue for highest level (level 5)
] as const;

export default function InteractiveRadarChart({
	data,
	originalData,
	loading = false,
	onChange,
	title = "Responsibility Levels",
	hasChanges = false, // Default to false if not provided
}: InteractiveRadarChartProps) {
	const [localData, setLocalData] = useState<ResponsibilityData[]>(data);

	// Update local data when prop data changes
	useEffect(() => {
		setLocalData(data);
	}, [data]);

	// Prepare data for radar chart
	const chartData = prepareChartData(localData);

	// Handle level change
	const handleLevelChange = useCallback(
		(responsibilityId: string, newLevel: number) => {
			const updatedData = localData.map((item) =>
				item.responsibilityId === responsibilityId
					? { ...item, level: newLevel }
					: item,
			);

			setLocalData(updatedData);

			// Notify parent component of changes
			if (onChange) {
				onChange(updatedData);
			}
		},
		[localData, onChange],
	);

	// Reset changes
	const handleReset = useCallback(() => {
		const resetData = originalData || data;
		setLocalData(resetData);

		// Notify parent component of reset
		if (onChange) {
			onChange(resetData);
		}
	}, [data, originalData, onChange]);

	// Get color based on level
	const getLevelColor = (level: number): string => {
		if (level === 0) return "#d9d9d9"; // Gray for no experience
		return LEVEL_COLORS[Math.min(level - 1, LEVEL_COLORS.length - 1)];
	};

	// Get level name
	const getLevelName = (level: number): string => {
		if (level === 0) return "No Experience";
		return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
	};

	return (
		<Card loading={loading}>
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				{/* Header */}
				<div style={{ textAlign: "center" }}>
					<Title level={4}>{title}</Title>
					<Text type="secondary">
						Adjust your skill levels for each responsibility area (0-5 scale)
					</Text>
				</div>

				{/* Radar Chart */}
				<BaseRadarChart data={chartData} height={400} />

				{/* Level Controls */}
				<div>
					<Row
						justify="space-between"
						align="middle"
						style={{ marginBottom: 16 }}
					>
						<Col>
							<Title level={5} style={{ margin: 0 }}>
								Adjust Levels
							</Title>
						</Col>
						<Col>
							<Button
								icon={<ReloadOutlined />}
								onClick={handleReset}
								disabled={!hasChanges}
							>
								Reset
							</Button>
						</Col>
					</Row>
					<Space direction="vertical" size="middle" style={{ width: "100%" }}>
						{localData.map((item) => (
							<Row key={item.responsibilityId} align="middle" gutter={[16, 0]}>
								<Col xs={24} sm={8}>
									<Text strong>{item.responsibilityName}</Text>
								</Col>
								<Col xs={24} sm={12}>
									<Slider
										min={0}
										max={5}
										step={1}
										value={item.level}
										onChange={(value) =>
											handleLevelChange(item.responsibilityId, value)
										}
										marks={{
											0: "0",
											1: "1",
											2: "2",
											3: "3",
											4: "4",
											5: "5",
										}}
										tooltip={{
											formatter: (value) => getLevelName(value || 0),
										}}
										trackStyle={{ backgroundColor: getLevelColor(item.level) }}
										handleStyle={{ borderColor: getLevelColor(item.level) }}
									/>
								</Col>
								<Col xs={24} sm={4}>
									<Text
										style={{
											color: getLevelColor(item.level),
											fontWeight: "bold",
											fontSize: "12px",
										}}
									>
										{getLevelName(item.level)}
									</Text>
								</Col>
							</Row>
						))}
					</Space>
				</div>
			</Space>
		</Card>
	);
}
