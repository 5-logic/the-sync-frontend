"use client";

import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Col, Row, Space, Tag, Typography } from "antd";
import { useRouter } from "next/navigation";

import { ConfirmationModal } from "@/components/common/ConfirmModal";
import { useSemesterStatus } from "@/hooks/student/useSemesterStatus";
import { useStudentGroupStatus } from "@/hooks/student/useStudentGroupStatus";
import { useThesisApplications } from "@/hooks/student/useThesisApplications";
import { useThesisRegistration } from "@/hooks/thesis";
import { DOMAIN_COLOR_MAP } from "@/lib/constants/domains";
import thesisApplicationService from "@/lib/services/thesis-application.service";
import { handleApiError } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";
import { ThesisWithRelations } from "@/schemas/thesis";
import { cacheUtils } from "@/store/helpers/cacheHelpers";

interface Props {
	readonly thesis: ThesisWithRelations;
	readonly studentRole?: "leader" | "member" | "guest";
	readonly onThesisUpdate?: () => void | Promise<void>;
}

export default function ThesisCard({
	thesis,
	studentRole,
	onThesisUpdate,
}: Props) {
	const { hasGroup, group, resetInitialization } = useStudentGroupStatus();
	const { canRegisterThesis, loading: semesterLoading } = useSemesterStatus();
	const { registerThesis, unregisterThesis, isRegistering } =
		useThesisRegistration();
	const { applications, refreshApplications } = useThesisApplications();
	const router = useRouter();

	// Get domain color
	const domainColor = thesis.domain
		? DOMAIN_COLOR_MAP[thesis.domain] || "default"
		: "default";

	// Process skills for display (max 1 line, show extra count if needed)
	const maxVisibleSkills = 3;
	const visibleSkills =
		thesis.thesisRequiredSkills?.slice(0, maxVisibleSkills) || [];
	const extraSkillsCount =
		(thesis.thesisRequiredSkills?.length || 0) - maxVisibleSkills;

	// Check if current group has application for this thesis
	const hasApplicationForThesis = applications.some(
		(app) => app.thesisId === thesis.id && app.status === "Pending",
	);

	// Check if thesis is already taken by another group
	const isThesisTaken = thesis.groupId != null; // Use != null to catch both null and undefined

	// Check if current group has this thesis assigned
	const isThesisAssignedToGroup = group?.id === thesis.groupId;

	// Determine if register button should be enabled
	const canRegister =
		studentRole === "leader" &&
		hasGroup &&
		!isThesisTaken &&
		!hasApplicationForThesis;

	// Determine if unregister button should be shown
	const canUnregister =
		studentRole === "leader" && hasGroup && isThesisAssignedToGroup;

	// Disable register button if semester is not in picking phase
	const isRegisterDisabled =
		!canRegister || !canRegisterThesis || isRegistering || semesterLoading;

	// Handle view details navigation
	const handleViewDetails = () => {
		router.push(`/student/list-thesis/${thesis.id}`);
	};

	// Handle register thesis
	const handleRegisterThesis = () => {
		registerThesis(thesis.id, thesis.englishName, () => {
			// Clear relevant caches
			cacheUtils.clear("semesterStatus");

			// Refresh group data to update UI
			resetInitialization();

			// Refresh thesis list immediately to show updated assignment
			onThesisUpdate?.();
		});
	};

	// Handle unregister thesis
	const handleUnregisterThesis = () => {
		unregisterThesis(thesis.englishName, () => {
			// Clear relevant caches
			cacheUtils.clear("semesterStatus");

			// Refresh group data to update UI
			resetInitialization();

			// Refresh thesis list immediately to show updated assignment
			onThesisUpdate?.();
		});
	};

	// Handle cancel application
	const handleCancelApplication = () => {
		if (!group) return;

		ConfirmationModal.show({
			title: "Cancel Application",
			message:
				"Are you sure you want to cancel your application for this thesis?",
			details: thesis.englishName,
			note: "This action cannot be undone.",
			noteType: "warning",
			okText: "Yes, Cancel",
			cancelText: "No",
			okType: "danger",
			onOk: async () => {
				try {
					await thesisApplicationService.cancelThesisApplication(
						group.id,
						thesis.id,
					);

					showNotification.success(
						"Application Canceled",
						"Your thesis application has been canceled successfully!",
					);

					// Refresh applications and thesis list
					refreshApplications();
					onThesisUpdate?.();
				} catch (error) {
					console.error("Error canceling application:", error);

					const apiError = handleApiError(
						error,
						"Failed to cancel application. Please try again.",
					);

					showNotification.error("Cancel Failed", apiError.message);
				}
			},
		});
	};

	// Get button tooltip message based on current state
	const getButtonTooltip = (): string => {
		if (hasApplicationForThesis) {
			return "You have a pending application for this thesis";
		}
		if (isThesisTaken) {
			return "This thesis is already taken by another group";
		}
		if (!hasGroup) {
			return "You need to be in a group to register";
		}
		if (studentRole !== "leader") {
			return "Only group leaders can register for thesis";
		}
		if (!canRegisterThesis) {
			return 'Registration is only available during the "Picking" phase or "Ongoing - Scope Adjustable" phase';
		}
		return "Register for this thesis";
	};

	// Get register button text based on current state
	const getRegisterButtonText = (): string => {
		if (isRegistering) {
			return "Processing...";
		}
		if (hasApplicationForThesis) {
			return "Cancel Request";
		}
		if (isThesisTaken) {
			return "Taken";
		}
		return "Register";
	};

	return (
		<Card
			title={null}
			style={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				borderRadius: 12,
			}}
			bodyStyle={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
		>
			<Space
				direction="vertical"
				size="middle"
				style={{ width: "100%", flexGrow: 1 }}
			>
				<Typography.Title
					level={5}
					style={{
						marginBottom: 0,
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
						textOverflow: "ellipsis",
						lineHeight: "1.4",
						minHeight: "2.8em", // Always maintain 2 lines height
						maxHeight: "2.8em", // 2 lines * 1.4 line-height
					}}
				>
					{thesis.englishName}
				</Typography.Title>

				<Typography.Text
					type="secondary"
					style={{
						display: "-webkit-box",
						WebkitLineClamp: 4,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
						textOverflow: "ellipsis",
						lineHeight: "1.4",
						minHeight: "5.6em", // Always maintain 4 lines height
						maxHeight: "5.6em", // 4 lines * 1.4 line-height
					}}
				>
					{thesis.description}
				</Typography.Text>

				<Space align="center">
					<Avatar size="small" icon={<UserOutlined />} />
					<Typography.Text type="secondary">Lecturer:</Typography.Text>
					<Typography.Text strong>
						{thesis.lecturer.user.fullName}
					</Typography.Text>
				</Space>

				{thesis.domain && (
					<Tag color={domainColor} style={{ borderRadius: 6 }}>
						{thesis.domain}
					</Tag>
				)}

				<Space
					wrap
					size={[8, 8]}
					style={{
						minHeight: "2em", // Always maintain consistent height
						maxHeight: "2em",
						overflow: "hidden",
					}}
				>
					{visibleSkills.map((skill) => (
						<Tag key={skill.id} style={{ borderRadius: 6 }}>
							{skill.name}
						</Tag>
					))}
					{extraSkillsCount > 0 && (
						<Tag style={{ borderRadius: 6 }}>+{extraSkillsCount} more</Tag>
					)}
					{visibleSkills.length === 0 && (
						<Typography.Text type="secondary">
							No skills specified
						</Typography.Text>
					)}
				</Space>
			</Space>

			<Row gutter={8} style={{ marginTop: 24 }}>
				<Col span={12}>
					<Button type="primary" block onClick={handleViewDetails}>
						View Details
					</Button>
				</Col>
				<Col span={12}>
					{canUnregister ? (
						<Button
							block
							danger
							onClick={handleUnregisterThesis}
							loading={isRegistering || semesterLoading}
							title="Unregister from this thesis"
						>
							{isRegistering ? "Unregistering..." : "Unregister"}
						</Button>
					) : (
						<Button
							block
							disabled={isRegisterDisabled && !hasApplicationForThesis}
							title={getButtonTooltip()}
							onClick={
								hasApplicationForThesis
									? handleCancelApplication
									: handleRegisterThesis
							}
							loading={isRegistering || semesterLoading}
							danger={hasApplicationForThesis}
						>
							{getRegisterButtonText()}
						</Button>
					)}
				</Col>
			</Row>
		</Card>
	);
}
