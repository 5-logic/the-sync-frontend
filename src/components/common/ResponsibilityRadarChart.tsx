"use client";

import { Card } from "antd";
import {
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
	ResponsiveContainer,
	Legend,
} from "recharts";

export interface ResponsibilityData {
	responsibilityId: string;
	responsibilityName: string;
	level: number;
}

interface ResponsibilityRadarChartProps {
	data: ResponsibilityData[];
	loading?: boolean;
	height?: number;
	showCard?: boolean;
}

export default function ResponsibilityRadarChart({
	data,
	loading = false,
	height = 200,
	showCard = false,
}: ResponsibilityRadarChartProps) {
	// Prepare data for radar chart
	const chartData = data.map((item) => ({
		responsibility: item.responsibilityName,
		level: Math.max(1, item.level), // Ensure minimum level of 1 for visibility
		fullLevel: item.level, // Keep original level for calculations
	}));

	const chartContent = (
		<div style={{ height, width: "100%" }}>
			<ResponsiveContainer width="100%" height="100%">
				<RadarChart
					data={chartData}
					margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
				>
					<PolarGrid />
					<PolarAngleAxis
						dataKey="responsibility"
						tick={{ fontSize: 12, fill: "#666" }}
					/>
					<PolarRadiusAxis
						angle={-90}
						domain={[0, 5]}
						tick={{ fontSize: 10, fill: "#999" }}
						tickCount={6}
					/>
					<Radar
						name="Level"
						dataKey="level"
						stroke="#1890ff"
						fill="#1890ff"
						fillOpacity={0.3}
						strokeWidth={2}
						dot={{ fill: "#1890ff", strokeWidth: 2, r: 4 }}
					/>
					<Legend />
				</RadarChart>
			</ResponsiveContainer>
		</div>
	);

	if (showCard) {
		return <Card loading={loading}>{chartContent}</Card>;
	}

	return chartContent;
}
