"use client";

import { EyeOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, Space, Table, Badge, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import NewThesisDetailModal from "@/components/features/lecturer/RequestApplyThesis/NewThesisDetailModal";
import ThesisRequestsModal from "@/components/features/lecturer/RequestApplyThesis/ThesisRequestsModal";
import { ThesisWithRequests } from "@/types/thesis-requests";
import { getOrientationDisplay } from "@/lib/constants/orientation";

interface Props {
	data: ThesisWithRequests[];
	loading?: boolean;
	onRefresh: () => void;
	updateApplicationStatus: (
		groupId: string,
		thesisId: string,
		status: "Approved" | "Rejected",
	) => Promise<void>;
}

export default function NewRequestApplyThesisTable({
	data,
	loading,
	onRefresh,
	updateApplicationStatus,
}: Props) {
	// Modal states
	const [selectedThesis, setSelectedThesis] = useState<
		ThesisWithRequests["thesis"] | null
	>(null);
	const [selectedThesisForRequests, setSelectedThesisForRequests] =
		useState<ThesisWithRequests | null>(null);
	const [actionLoading, setActionLoading] = useState(false);

	const handleApprove = async (groupId: string, thesisId: string) => {
		setActionLoading(true);
		try {
			await updateApplicationStatus(groupId, thesisId, "Approved");
			onRefresh();
		} finally {
			setActionLoading(false);
		}
	};

	const handleReject = async (groupId: string, thesisId: string) => {
		setActionLoading(true);
		try {
			await updateApplicationStatus(groupId, thesisId, "Rejected");
			onRefresh();
		} finally {
			setActionLoading(false);
		}
	};

	const getPendingRequestsCount = (
		requests: ThesisWithRequests["requests"],
	) => {
		return requests.filter((request) => request.status === "Pending").length;
	};

	const columns: ColumnsType<ThesisWithRequests> = [
		{
			title: "Thesis Information",
			key: "thesis",
			render: (_, record) => (
				<div>
					<div>
						<strong>{record.thesis.englishName}</strong>
					</div>
					<div style={{ color: "#666", fontSize: "14px", marginTop: 4 }}>
						{record.thesis.vietnameseName}
					</div>
					<div style={{ marginTop: 8 }}>
						<Space wrap>
							<Tag color="blue">{record.thesis.abbreviation}</Tag>
							{(() => {
								const orientationDisplay = getOrientationDisplay(
									record.thesis.orientation,
								);
								return orientationDisplay ? (
									<Tag color={orientationDisplay.color}>
										{orientationDisplay.label}
									</Tag>
								) : null;
							})()}
							<Tag color="cyan">{record.thesis.domain}</Tag>
						</Space>
					</div>
				</div>
			),
			width: "75%",
		},
		{
			title: "Actions",
			key: "actions",
			align: "center",
			render: (_, record) => {
				const pendingCount = getPendingRequestsCount(record.requests);

				return (
					<Space direction="vertical" size="small">
						<Button
							type="default"
							icon={<EyeOutlined />}
							onClick={() => setSelectedThesis(record.thesis)}
							size="small"
							block
						>
							View Details
						</Button>
						<Badge count={pendingCount} size="small">
							<Button
								type="primary"
								icon={<UnorderedListOutlined />}
								onClick={() => setSelectedThesisForRequests(record)}
								size="small"
								block
								disabled={record.requests.length === 0}
							>
								View Requests ({record.requests.length})
							</Button>
						</Badge>
					</Space>
				);
			},
			width: "25%",
		},
	];

	return (
		<>
			<Table
				columns={columns}
				dataSource={data}
				rowKey={(record) => record.thesis.id}
				loading={loading}
				pagination={{
					pageSize: 10,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} of ${total} theses`,
				}}
				locale={{
					emptyText: "No thesis applications found",
				}}
			/>

			{/* Thesis Detail Modal */}
			<NewThesisDetailModal
				open={!!selectedThesis}
				onClose={() => setSelectedThesis(null)}
				thesis={selectedThesis}
			/>

			{/* Thesis Requests Modal */}
			{selectedThesisForRequests && (
				<ThesisRequestsModal
					open={!!selectedThesisForRequests}
					onClose={() => setSelectedThesisForRequests(null)}
					requests={selectedThesisForRequests.requests}
					thesisTitle={selectedThesisForRequests.thesis.englishName}
					onApprove={handleApprove}
					onReject={handleReject}
					loading={actionLoading}
				/>
			)}
		</>
	);
}
