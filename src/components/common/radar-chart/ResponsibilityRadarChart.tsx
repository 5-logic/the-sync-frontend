"use client";

import { Card } from "antd";
import BaseRadarChart, {
	ResponsibilityData,
	prepareChartData,
} from "./BaseRadarChart";

interface ResponsibilityRadarChartProps {
	readonly data: ResponsibilityData[];
	readonly loading?: boolean;
	readonly height?: number;
	readonly showCard?: boolean;
}

export default function ResponsibilityRadarChart({
	data,
	loading = false,
	height = 200,
	showCard = false,
}: ResponsibilityRadarChartProps) {
	// Prepare data for radar chart
	const chartData = prepareChartData(data);

	const chartContent = <BaseRadarChart data={chartData} height={height} />;

	if (showCard) {
		return <Card loading={loading}>{chartContent}</Card>;
	}

	return chartContent;
}
