"use client";

import { Modal, Typography, Space, Tag, List, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ThesisApplication } from "@/lib/services/thesis-application.service";
import { ThesisRequest } from "@/types/thesis-requests";

const { Title, Text } = Typography;

interface Props {
	group: ThesisApplication["group"] | ThesisRequest["group"] | null;
	open: boolean;
	onClose: () => void;
}

export default function GroupDetailModal({
	group,
	open,
	onClose,
}: Readonly<Props>) {
	if (!group) return null;

	const members = group.studentGroupParticipations || [];

	return (
		<Modal
			title="Group Details"
			open={open}
			onCancel={onClose}
			footer={null}
			width={700}
			destroyOnClose
		>
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				{/* Group Name and Code */}
				<div>
					<Title level={4} style={{ marginBottom: 8 }}>
						Group Information
					</Title>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<div>
							<Text strong style={{ fontSize: 16 }}>
								{group.name}
							</Text>
						</div>
						<Tag color="blue">{group.code}</Tag>
					</div>
				</div>

				<Divider size="small" />

				{/* Group Members */}
				<div>
					<Title level={4} style={{ marginBottom: 16 }}>
						Members ({members.length})
					</Title>
					{members.length > 0 ? (
						<List
							dataSource={members}
							renderItem={(participation) => (
								<List.Item>
									<List.Item.Meta
										avatar={<UserOutlined style={{ fontSize: 20 }} />}
										title={
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
												}}
											>
												<div>
													<Text strong>
														{participation.student.user.fullName}
													</Text>
													{participation.isLeader && (
														<Tag color="gold" style={{ marginLeft: 8 }}>
															Leader
														</Tag>
													)}
												</div>
												<Tag color="orange">
													{participation.student.studentCode}
												</Tag>
											</div>
										}
										description={
											<div>
												<Text type="secondary">
													Email: {participation.student.user.email}
												</Text>
												<br />
												<Text type="secondary">
													Phone:{" "}
													{participation.student.user.phoneNumber || "N/A"}
												</Text>
												<br />
												<Text type="secondary">
													Gender: {participation.student.user.gender}
												</Text>
											</div>
										}
									/>
								</List.Item>
							)}
						/>
					) : (
						<Text type="secondary">No members found</Text>
					)}
				</div>
			</Space>
		</Modal>
	);
}
