"use client";

import {
	EyeOutlined,
	UnorderedListOutlined,
	ReloadOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import {
	Button,
	Space,
	Table,
	Badge,
	Tag,
	Input,
	Select,
	Row,
	Col,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useMemo } from "react";

import ThesisDetailModal from "@/components/features/lecturer/RequestApplyThesis/ThesisDetailModal";
import ThesisRequestsModal from "@/components/features/lecturer/RequestApplyThesis/ThesisRequestsModal";
import GroupDetailModal from "@/components/features/lecturer/RequestApplyThesis/GroupDetailModal";
import { ThesisWithRequests, ThesisRequest } from "@/types/thesis-requests";

// Type alias for Group from ThesisRequest
type GroupWithDetails = ThesisRequest["group"];
import {
	getOrientationDisplay,
	ORIENTATION_LABELS,
} from "@/lib/constants/orientation";
import { THESIS_DOMAINS } from "@/lib/constants/domains";
import { isTextMatch } from "@/lib/utils/textNormalization";

interface Props {
	readonly data: ThesisWithRequests[];
	readonly loading?: boolean;
	readonly onRefresh: () => void;
	readonly updateApplicationStatus: (
		groupId: string,
		thesisId: string,
		status: "Approved" | "Rejected",
	) => Promise<void>;
}

export default function RequestApplyThesisTable({
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
	const [selectedGroup, setSelectedGroup] = useState<GroupWithDetails | null>(
		null,
	);
	const [actionLoading, setActionLoading] = useState(false);

	// Filter states
	const [searchText, setSearchText] = useState("");
	const [orientationFilter, setOrientationFilter] = useState<
		string | undefined
	>(undefined);
	const [domainFilter, setDomainFilter] = useState<string | undefined>(
		undefined,
	);

	// Search utility function

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

	// Filter data based on search and filters
	const filteredData = useMemo(() => {
		return data.filter((item) => {
			// Search filter
			if (searchText) {
				const matchesSearch = isTextMatch(searchText, [
					item.thesis.englishName,
					item.thesis.vietnameseName,
					item.thesis.abbreviation,
				]);
				if (!matchesSearch) return false;
			}

			// Orientation filter
			if (orientationFilter && item.thesis.orientation !== orientationFilter) {
				return false;
			}

			// Domain filter
			if (domainFilter && item.thesis.domain !== domainFilter) {
				return false;
			}

			return true;
		});
	}, [data, searchText, orientationFilter, domainFilter]);

	const getPendingRequestsCount = (
		requests: ThesisWithRequests["requests"],
	) => {
		return requests.filter((request) => request.status === "Pending").length;
	};

	// Get approved group for a thesis
	const getApprovedGroup = (requests: ThesisWithRequests["requests"]) => {
		const approvedRequest = requests.find(
			(request) => request.status === "Approved",
		);
		return approvedRequest?.group || null;
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
			width: "50%",
		},
		{
			title: "Assigned Group",
			key: "assignedGroup",
			render: (_, record) => {
				const approvedGroup = getApprovedGroup(record.requests);

				if (!approvedGroup) {
					return (
						<span style={{ color: "#999", fontStyle: "italic" }}>
							No group assigned
						</span>
					);
				}

				return (
					<div>
						<Button
							type="link"
							onClick={() => setSelectedGroup(approvedGroup)}
							style={{ padding: 0, height: "auto", fontWeight: "500" }}
						>
							{approvedGroup.name}
						</Button>
						<div style={{ color: "#666", fontSize: "12px", marginTop: 2 }}>
							{approvedGroup.code}
						</div>
					</div>
				);
			},
			width: "25%",
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
			{/* Search and Filter Controls */}
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col span={11}>
					<Input
						placeholder="Search by thesis name or abbreviation..."
						prefix={<SearchOutlined />}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						allowClear
					/>
				</Col>
				<Col span={5}>
					<Select
						placeholder="Filter by Orientation"
						value={orientationFilter}
						onChange={setOrientationFilter}
						allowClear
						showSearch
						style={{ width: "100%" }}
					>
						{Object.entries(ORIENTATION_LABELS).map(([key, label]) => (
							<Select.Option key={key} value={key}>
								{label}
							</Select.Option>
						))}
					</Select>
				</Col>
				<Col span={5}>
					<Select
						placeholder="Filter by Domain"
						value={domainFilter}
						onChange={setDomainFilter}
						allowClear
						showSearch
						style={{ width: "100%" }}
					>
						{THESIS_DOMAINS.map((domain) => (
							<Select.Option key={domain} value={domain}>
								{domain}
							</Select.Option>
						))}
					</Select>
				</Col>
				<Col span={3}>
					<Button
						type="default"
						icon={<ReloadOutlined />}
						onClick={onRefresh}
						loading={loading}
						block
					>
						Refresh
					</Button>
				</Col>
			</Row>

			<Table
				columns={columns}
				dataSource={filteredData}
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
			<ThesisDetailModal
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
					onRefresh={onRefresh}
					loading={actionLoading}
					dataLoading={loading}
				/>
			)}

			{/* Group Detail Modal */}
			<GroupDetailModal
				open={!!selectedGroup}
				onClose={() => setSelectedGroup(null)}
				group={selectedGroup}
			/>
		</>
	);
}
