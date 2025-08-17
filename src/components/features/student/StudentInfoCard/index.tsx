"use client";

import { TeamOutlined, UserOutlined } from "@ant-design/icons";
import {
	Avatar,
	Button,
	Card,
	Col,
	Descriptions,
	Row,
	Space,
	Tag,
	Typography,
} from "antd";
import Link from "next/link";

import { ConfirmationModal } from "@/components/common/ConfirmModal";
import { GroupDashboard } from "@/schemas/group";
import { StudentProfile } from "@/schemas/student";

const { Title, Text } = Typography;

interface StudentInfoCardProps {
	readonly student: StudentProfile | null;
	readonly studentGroup?: GroupDashboard;
	readonly isCurrentUserGroupLeader?: boolean;
	readonly loading?: boolean;
	// New props for request management
	readonly hasInvite?: boolean;
	readonly hasJoinRequest?: boolean;
	readonly requestLoading?: boolean;
	readonly onSendInvite?: () => void;
	readonly onCancelInvite?: () => void;
	readonly onApproveJoinRequest?: () => void;
	readonly onRejectJoinRequest?: () => void;
	readonly onGoBackToGroup?: () => void;
	readonly showGroupActions?: boolean;
}

export default function StudentInfoCard({
	student,
	studentGroup,
	isCurrentUserGroupLeader = false,
	loading = false,
	hasInvite,
	hasJoinRequest,
	requestLoading,
	onSendInvite,
	onCancelInvite,
	onApproveJoinRequest,
	onRejectJoinRequest,
	onGoBackToGroup,
	showGroupActions,
}: StudentInfoCardProps) {
	const handleSendInvite = () => {
		if (!student) return;

		ConfirmationModal.show({
			title: "Send Invitation",
			message: `Are you sure you want to send an invitation to ${student.fullName}?`,
			okText: "Yes, Send",
			cancelText: "Cancel",
			onOk: onSendInvite || (() => {}),
		});
	};

	const handleCancelInvite = () => {
		if (!student) return;

		ConfirmationModal.show({
			title: "Cancel Invitation",
			message: `Are you sure you want to cancel the invitation to ${student.fullName}?`,
			okText: "Yes, Cancel",
			cancelText: "No",
			okType: "danger",
			onOk: onCancelInvite || (() => {}),
		});
	};

	const handleApproveJoinRequest = () => {
		if (!student) return;

		ConfirmationModal.show({
			title: "Approve Join Request",
			message: `Are you sure you want to approve ${student.fullName}'s request to join your group?`,
			okText: "Yes, Approve",
			cancelText: "Cancel",
			onOk: onApproveJoinRequest || (() => {}),
		});
	};

	const handleRejectJoinRequest = () => {
		if (!student) return;

		ConfirmationModal.show({
			title: "Reject Join Request",
			message: `Are you sure you want to reject ${student.fullName}'s request to join your group?`,
			okText: "Yes, Reject",
			cancelText: "Cancel",
			okType: "danger",
			onOk: onRejectJoinRequest || (() => {}),
		});
	};

	// Helper function to render action buttons based on request status
	const renderActionButtons = () => {
		if (hasJoinRequest) {
			return (
				<>
					<Button
						danger
						onClick={handleRejectJoinRequest}
						loading={requestLoading}
					>
						Reject Join Request
					</Button>
					<Button
						type="primary"
						onClick={handleApproveJoinRequest}
						loading={requestLoading}
					>
						Approve Join Request
					</Button>
				</>
			);
		}

		if (hasInvite) {
			return (
				<Button danger onClick={handleCancelInvite} loading={requestLoading}>
					Cancel Invite
				</Button>
			);
		}

		return (
			<Button
				type="primary"
				onClick={handleSendInvite}
				loading={requestLoading}
			>
				Send Invite
			</Button>
		);
	};

	// Show loading state
	if (loading || !student) {
		return (
			<div className="space-y-6">
				<Card loading={true} />
				<Card loading={true} />
				<Card loading={true} />
				<Card loading={true} />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Basic Information Card */}
			<Card
				title={
					<div className="flex items-center gap-3">
						<Avatar size={40} icon={<UserOutlined />} />
						<div>
							<Title level={4} className="mb-0">
								{student.fullName}
							</Title>
							<Text type="secondary">{student.studentCode}</Text>
						</div>
					</div>
				}
				loading={loading}
			>
				<Descriptions column={2} size="middle">
					<Descriptions.Item label="Email">{student.email}</Descriptions.Item>
					<Descriptions.Item label="Phone Number">
						{student.phoneNumber}
					</Descriptions.Item>
					<Descriptions.Item label="Gender">{student.gender}</Descriptions.Item>
					<Descriptions.Item label="Major">
						<Tag color="blue">
							{student.major.name} ({student.major.code})
						</Tag>
					</Descriptions.Item>
					<Descriptions.Item label="Status">
						<Tag color={student.isActive ? "green" : "red"}>
							{student.isActive ? "Active" : "Inactive"}
						</Tag>
					</Descriptions.Item>
					<Descriptions.Item label="Joined">
						{new Date(student.createdAt).toLocaleDateString()}
					</Descriptions.Item>
				</Descriptions>
			</Card>

			{/* Enrollments */}
			<Card title="Semester Enrollments" loading={loading}>
				<Row gutter={[16, 16]}>
					{student.enrollments.map((enrollment) => (
						<Col xs={24} sm={12} md={8} key={enrollment.semester.name}>
							<Tag color="blue">{enrollment.semester.name}</Tag>
						</Col>
					))}
				</Row>
			</Card>

			{/* Expected Responsibilities */}
			<Card title="Expected Responsibilities" loading={loading}>
				<Space wrap>
					{student.studentResponsibilities.map((responsibility) => (
						<Tag key={responsibility.responsibilityName} color="purple">
							{responsibility.responsibilityName}
						</Tag>
					))}
				</Space>
				{student.studentResponsibilities.length === 0 && (
					<div className="text-center py-4">
						<Text type="secondary">No expected responsibilities specified</Text>
					</div>
				)}
			</Card>

			{/* Group Information */}
			{studentGroup && (
				<Card
					title="Current Group"
					loading={loading}
					extra={
						<Link href={`/student/group-detail/${studentGroup.id}`}>
							<Button type="link">View Group Detail</Button>
						</Link>
					}
				>
					<Descriptions column={2} size="middle">
						<Descriptions.Item label="Group Name">
							<Title level={5} className="mb-0">
								{studentGroup.name}
							</Title>
						</Descriptions.Item>
						<Descriptions.Item label="Group Code">
							<Tag color="blue">{studentGroup.code}</Tag>
						</Descriptions.Item>
						<Descriptions.Item label="Project Direction">
							{studentGroup.projectDirection || "Not specified"}
						</Descriptions.Item>
						<Descriptions.Item label="Leader">
							<div className="flex items-center gap-2">
								<Avatar size={24} icon={<UserOutlined />} />
								<span>{studentGroup.leader.user.fullName}</span>
								<Tag color="gold">Leader</Tag>
							</div>
						</Descriptions.Item>
						<Descriptions.Item label="Semester">
							{studentGroup.semester.name} ({studentGroup.semester.code})
						</Descriptions.Item>
						<Descriptions.Item label="Members">
							{studentGroup.members.length} members
						</Descriptions.Item>
					</Descriptions>
				</Card>
			)}

			{/* Action Buttons - Show if user has group */}
			{showGroupActions && (
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						gap: "12px",
						marginTop: "24px",
					}}
				>
					{/* Go Back to Group button - Always show when showGroupActions is true */}
					<Button
						type="default"
						icon={<TeamOutlined />}
						onClick={onGoBackToGroup}
					>
						Go Back to Group
					</Button>

					{/* Only show request action buttons if user is leader and student has no group */}
					{isCurrentUserGroupLeader && !studentGroup && (
						<>{renderActionButtons()}</>
					)}
				</div>
			)}
		</div>
	);
}
