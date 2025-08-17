"use client";

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

export interface ChartData {
	responsibility: string;
	level: number;
	fullLevel: number;
}

interface BaseRadarChartProps {
	data: ChartData[];
	height?: number;
	showLegend?: boolean;
}

export default function BaseRadarChart({
	data,
	height = 200,
	showLegend = true,
}: BaseRadarChartProps) {
	return (
		<div style={{ height, width: "100%" }}>
			<ResponsiveContainer width="100%" height="100%">
				<RadarChart
					data={data}
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
					{showLegend && <Legend />}
				</RadarChart>
			</ResponsiveContainer>
		</div>
	);
}

// Utility function to prepare chart data
export function prepareChartData(data: ResponsibilityData[]): ChartData[] {
	return data.map((item) => ({
		responsibility: item.responsibilityName,
		level: Math.max(1, item.level), // Ensure minimum level of 1 for visibility
		fullLevel: item.level, // Keep original level for calculations
	}));
}
