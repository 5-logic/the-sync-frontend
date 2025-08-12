"use client";

import { RobotOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Card, Col, Grid, Row, Space, Typography } from "antd";
import { useRouter } from "next/navigation";

import GroupActionCard from "@/components/features/student/FirstLoginDashboard/GroupActionCard";
import WelcomeHeader from "@/components/features/student/FirstLoginDashboard/WelcomeHeader";

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function StudentFirstLoginDashboard() {
	const screens = useBreakpoint();
	const router = useRouter();

	const handleFormOrJoinGroup = () => {
		router.push("/student/form-or-join-group");
	};

	const handleAIFindGroup = () => {
		router.push("/student/form-or-join-group");
	};

	return (
		<Space
			direction="vertical"
			align="center"
			style={{
				minHeight: "100vh",
				width: "100%",
				display: "flex",
			}}
			size={32}
		>
			<Card
				style={{
					maxWidth: 700,
					width: "100%",
					textAlign: "center",
					borderRadius: 16,
				}}
				bodyStyle={{ padding: screens.xs ? 16 : 40 }}
			>
				<WelcomeHeader />
				<Row
					gutter={[screens.xs ? 16 : 32, 24]}
					justify="center"
					style={{ marginTop: 40 }}
				>
					<Col
						xs={24}
						sm={24}
						md={12}
						style={{ display: "flex", justifyContent: "center" }}
					>
						<GroupActionCard
							icon={
								<UsergroupAddOutlined
									style={{ fontSize: 36, color: "#1677ff", marginBottom: 12 }}
									aria-label="Form or Join Group"
								/>
							}
							title="Form or Join Group"
							description="Create a new group or join an existing one"
							buttonText="Get Started"
							type="primary"
							onClick={handleFormOrJoinGroup}
						/>
					</Col>
					<Col
						xs={24}
						sm={24}
						md={12}
						style={{ display: "flex", justifyContent: "center" }}
					>
						<GroupActionCard
							icon={
								<RobotOutlined
									style={{ fontSize: 36, color: "#1677ff", marginBottom: 12 }}
									aria-label="AI Group Suggestion"
								/>
							}
							title="AI Group Suggestion"
							description="Let our AI match you with the perfect team"
							buttonText="Find Match"
							onClick={handleAIFindGroup}
						/>
					</Col>
				</Row>
				<Text type="secondary" style={{ display: "block", marginTop: 32 }}>
					Need help? Contact your supervisor or academic advisor
				</Text>
			</Card>
		</Space>
	);
}
