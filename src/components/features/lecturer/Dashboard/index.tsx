"use client";

import { Col, Row, Space } from "antd";

import { Header } from "@/components/common/Header";
import AssignedGroupsTable from "@/components/features/lecturer/Dashboard/AssignedGroupsTable";
import DashboardStats from "@/components/features/lecturer/Dashboard/DashboardStats";
import MilestonesTimeline from "@/components/features/lecturer/Dashboard/MilestonesTimeline";
import MyThesisSection from "@/components/features/lecturer/Dashboard/MyThesisSection";

export default function DashboardPage() {
	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Header
				title="Dashboard"
				description="Welcome to your dashboard. Here you can track student progress, manage milestones, and provide timely feedback to guide thesis development."
			/>

			<DashboardStats />

			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				<Row>
					<Col span={24}>
						<MilestonesTimeline />
					</Col>
				</Row>

				<Row>
					<Col span={24}>
						<MyThesisSection />
					</Col>
				</Row>

				<Row>
					<Col span={24}>
						<AssignedGroupsTable />
					</Col>
				</Row>
			</Space>
		</Space>
	);
}
