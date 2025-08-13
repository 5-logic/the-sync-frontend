"use client";

import { useEffect } from "react";
import { Col, Row, Space } from "antd";

import AIUsageChart from "@/components/common/Dashboard/AIUsageChart";
import DashboardStats from "@/components/common/Dashboard/DashboardStats";
import { GroupInfo } from "@/components/common/Dashboard/GroupTableInfo";
import { ProgressOverview } from "@/components/common/Dashboard/ProgressOverview";
import SemesterFilter from "@/components/common/Dashboard/SemesterFilter";
import SupervisorLoadChart from "@/components/common/Dashboard/SupervisorLoadChart";
import { Header } from "@/components/common/Header";
import { useSessionData } from "@/hooks/auth/useAuth";
import { useDashboardStore } from "@/store";

export default function Dashboard() {
	const { session } = useSessionData();
	const {
		selectedSemesterId,
		aiStatistics,
		aiLoading,
		aiError,
		fetchAIStatistics,
	} = useDashboardStore();

	// Check if user is admin (not moderator)
	const isAdmin = session?.user?.role === "admin";

	// Fetch AI statistics when selectedSemesterId changes and user is admin
	useEffect(() => {
		if (isAdmin && selectedSemesterId) {
			fetchAIStatistics(selectedSemesterId);
		}
	}, [isAdmin, selectedSemesterId, fetchAIStatistics]);

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Header
				title="Dashboard"
				description="Welcome to your dashboard. Here you can track student progress, manage milestones, and provide timely feedback to guide thesis development."
				badgeText="Admin & Moderator Only"
			/>
			<SemesterFilter />
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<DashboardStats />
				</Col>
				<Col span={24}>
					<ProgressOverview />
				</Col>
				<Col span={24}>
					<SupervisorLoadChart />
				</Col>
				{/* AI Usage Chart - Only show for admin */}
				{isAdmin && (
					<Col span={24}>
						<AIUsageChart
							statistics={aiStatistics?.statistics || []}
							totalCalls={aiStatistics?.totalCalls || 0}
							loading={aiLoading}
							error={aiError}
						/>
					</Col>
				)}
				{/* Group Table Info - Only show for admin */}
				{isAdmin && (
					<Col span={24}>
						<GroupInfo />
					</Col>
				)}
			</Row>
		</Space>
	);
}
