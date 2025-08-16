"use client";

import { Button, Card, Space, Typography } from "antd";
import Link from "next/link";

import { GroupDashboard } from "@/schemas/group";

const { Title, Text } = Typography;

interface Props {
	readonly assignedGroup: GroupDashboard;
}

export default function AssignedGroupCard({ assignedGroup }: Props) {
	return (
		<Card title="Assigned Group" style={{ borderRadius: 12 }}>
			<Space direction="vertical" size="middle" style={{ width: "100%" }}>
				<div>
					<Title level={5} style={{ marginBottom: 8 }}>
						{assignedGroup.name}
					</Title>
					<Text type="secondary">
						Leader: {assignedGroup.leader?.user?.fullName || "N/A"}
					</Text>
				</div>

				<div>
					<Text strong>Members: </Text>
					<Text>{assignedGroup.members?.length || 0} students</Text>
				</div>

				<Link href={`/student/join-group/${assignedGroup.id}`}>
					<Button type="primary">View Group Details</Button>
				</Link>
			</Space>
		</Card>
	);
}
