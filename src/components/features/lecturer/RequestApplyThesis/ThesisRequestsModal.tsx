"use client";

import { Modal, Table, Button, Space, Tag, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ThesisRequest } from "@/types/thesis-requests";

const { Title } = Typography;

interface Props {
	open: boolean;
	onClose: () => void;
	requests: ThesisRequest[];
	thesisTitle: string;
	onApprove: (groupId: string, thesisId: string) => Promise<void>;
	onReject: (groupId: string, thesisId: string) => Promise<void>;
	loading?: boolean;
}

export default function ThesisRequestsModal({
	open,
	onClose,
	requests,
	thesisTitle,
	onApprove,
	onReject,
	loading,
}: Props) {
	const getLeaderInfo = (request: ThesisRequest) => {
		const leader = request.group.studentGroupParticipations.find(
			(participation) => participation.isLeader,
		);
		return leader?.student;
	};

	const columns: ColumnsType<ThesisRequest> = [
		{
			title: "Group",
			key: "group",
			render: (_, record) => (
				<div>
					<div>
						<strong>{record.group.name}</strong>
					</div>
					<div style={{ color: "#666", fontSize: "12px" }}>
						{record.group.code}
					</div>
				</div>
			),
		},
		{
			title: "Leader",
			key: "leader",
			render: (_, record) => {
				const leader = getLeaderInfo(record);
				if (!leader) return <span style={{ color: "#999" }}>No leader</span>;

				return (
					<div>
						<div>
							<strong>{leader.user.fullName}</strong>
						</div>
						<div style={{ color: "#666", fontSize: "12px" }}>
							{leader.studentCode}
						</div>
						<div style={{ color: "#666", fontSize: "12px" }}>
							{leader.user.email}
						</div>
					</div>
				);
			},
		},
		{
			title: "Created Date",
			key: "createdAt",
			render: (_, record) => (
				<div>
					<div>{new Date(record.createdAt).toLocaleDateString()}</div>
					<div style={{ color: "#666", fontSize: "12px" }}>
						{new Date(record.createdAt).toLocaleTimeString()}
					</div>
				</div>
			),
		},
		{
			title: "Status",
			key: "status",
			render: (_, record) => {
				const getStatusColor = (status: string) => {
					switch (status) {
						case "Approved":
							return "success";
						case "Rejected":
							return "error";
						case "Pending":
							return "warning";
						default:
							return "default";
					}
				};

				return <Tag color={getStatusColor(record.status)}>{record.status}</Tag>;
			},
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, record) => {
				if (record.status !== "Pending") {
					return (
						<Tag color={record.status === "Approved" ? "success" : "error"}>
							{record.status}
						</Tag>
					);
				}

				return (
					<Space>
						<Button
							type="primary"
							icon={<CheckOutlined />}
							size="small"
							onClick={() => onApprove(record.groupId, record.thesisId)}
							loading={loading}
						>
							Approve
						</Button>
						<Button
							danger
							icon={<CloseOutlined />}
							size="small"
							onClick={() => onReject(record.groupId, record.thesisId)}
							loading={loading}
						>
							Reject
						</Button>
					</Space>
				);
			},
		},
	];

	return (
		<Modal
			title={<Title level={4}>Thesis Requests - {thesisTitle}</Title>}
			open={open}
			onCancel={onClose}
			footer={null}
			width={1000}
			centered
		>
			<Table
				columns={columns}
				dataSource={requests}
				rowKey={(record) => `${record.groupId}-${record.thesisId}`}
				pagination={false}
				locale={{
					emptyText: "No requests found for this thesis",
				}}
			/>
		</Modal>
	);
}
