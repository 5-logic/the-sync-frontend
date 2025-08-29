'use client';

import {
	Legend,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts';

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
	readonly data: ChartData[];
	readonly height?: number;
	readonly showLegend?: boolean;
}

export default function BaseRadarChart({
	data,
	height = 200,
	showLegend = true,
}: BaseRadarChartProps) {
	return (
		<div style={{ height, width: '100%' }}>
			<ResponsiveContainer width="100%" height="100%">
				<RadarChart
					data={data}
					margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
				>
					<PolarGrid />
					<PolarAngleAxis
						dataKey="responsibility"
						tick={{ fontSize: 12, fill: '#666' }}
					/>
					<PolarRadiusAxis
						angle={90}
						domain={[0, 5]}
						tick={{ fontSize: 10, fill: '#999' }}
						tickCount={6}
						allowDataOverflow={false}
					/>
					<Tooltip
						formatter={(value) => {
							// Safe type conversion for value
							let numValue: number;
							if (typeof value === 'number') {
								numValue = value;
							} else if (typeof value === 'string') {
								numValue = parseFloat(value);
							} else {
								numValue = 0;
							}

							if (isNaN(numValue)) {
								return ['0', 'Level'];
							}

							// Show decimal places only if there are non-zero decimal digits
							const formattedValue =
								numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(2);

							return [formattedValue, 'Level'];
						}}
						labelFormatter={(label: string) => `Responsibility: ${label}`}
						contentStyle={{
							backgroundColor: 'white',
							border: '1px solid #d9d9d9',
							borderRadius: '6px',
							boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
						}}
					/>
					<Radar
						name="Level"
						dataKey="level"
						stroke="#1890ff"
						fill="#1890ff"
						fillOpacity={0.3}
						strokeWidth={2}
						dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
						connectNulls={false}
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
		level: item.level, // Use actual level without artificial minimum
		fullLevel: item.level, // Keep original level for calculations
	}));
}
