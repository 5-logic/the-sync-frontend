"use client";

import { UserOutlined } from "@ant-design/icons";
import {
	Avatar,
	Button,
	Card,
	Col,
	Progress,
	Row,
	Space,
	Tag,
	Typography,
} from "antd";
import { useRouter } from "next/navigation";

import { ConfirmationModal } from "@/components/common/ConfirmModal";
import { useSemesterStatus } from "@/hooks/student/useSemesterStatus";
import { useStudentGroupStatus } from "@/hooks/student/useStudentGroupStatus";
import { useThesisApplications } from "@/hooks/student/useThesisApplications";
import { useThesisRegistration } from "@/hooks/thesis";
import { getOrientationDisplay } from "@/lib/constants/orientation";
import { SuggestedThesis } from "@/lib/services/ai.service";
import thesisApplicationService, {
	ThesisApplication,
} from "@/lib/services/thesis-application.service";
import { handleApiError } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";
import { ThesisOrientation } from "@/schemas/_enums";
import { cacheUtils } from "@/store/helpers/cacheHelpers";

interface Props {
	readonly suggestion: SuggestedThesis;
	readonly studentRole?: "leader" | "member" | "guest";
	readonly onThesisUpdate?: () => void | Promise<void>;
}

export default function AISuggestThesisCard({
	suggestion,
	studentRole,
	onThesisUpdate,
}: Props) {
	const { hasGroup, group, resetInitialization } = useStudentGroupStatus();
	const { canRegisterThesis, loading: semesterLoading } = useSemesterStatus();
	const {
		applications,
		refreshApplications,
		initialized: applicationsInitialized,
	} = useThesisApplications();
	const { registerThesis, unregisterThesis, isRegistering } =
		useThesisRegistration();
	const router = useRouter();

	// Check if current group has application for this thesis
	const hasApplicationForThesis = applications.some(
		(app: ThesisApplication) =>
			app.thesisId === suggestion.id && app.status === "Pending",
	);

	// Check if thesis is already taken by another group (we don't have groupId in SuggestedThesis, so we'll assume it's available)
	const isThesisTaken = false; // AI suggestions should only show available theses

	// Check if current group has this thesis assigned
	const isThesisAssignedToGroup = group?.thesis?.id === suggestion.id;

	// Check if all data is loaded
	const isAllDataLoaded = applicationsInitialized && !semesterLoading;

	// Determine if register button should be enabled
	const canRegister =
		studentRole === "leader" &&
		hasGroup &&
		!isThesisTaken &&
		!hasApplicationForThesis &&
		!isThesisAssignedToGroup &&
		isAllDataLoaded;

	// Determine if unregister button should be shown
	const canUnregister =
		studentRole === "leader" &&
		hasGroup &&
		isThesisAssignedToGroup &&
		isAllDataLoaded;

	// Disable register button if semester is not in picking phase
	const isRegisterDisabled =
		!canRegister || !canRegisterThesis || isRegistering;

	// Handle view details navigation
	const handleViewDetails = () => {
		router.push(`/student/list-thesis/${suggestion.id}`);
	};

	// Handle register thesis
	const handleRegisterThesis = () => {
		registerThesis(suggestion.id, suggestion.englishName, () => {
			// Clear relevant caches
			cacheUtils.clear("semesterStatus");

			// Refresh group data to update UI
			resetInitialization();

			// Refresh applications immediately to update button state
			refreshApplications();

			// Refresh thesis list immediately to show updated assignment
			onThesisUpdate?.();
		});
	};

	// Handle cancel application
	const handleCancelApplication = () => {
		if (!group?.id) return;

		ConfirmationModal.show({
			title: "Cancel Application",
			message:
				"Are you sure you want to cancel your application for this thesis?",
			details: suggestion.englishName,
			note: "This action cannot be undone.",
			noteType: "warning",
			okText: "Yes, Cancel",
			cancelText: "No",
			okType: "danger",
			onOk: async () => {
				try {
					await thesisApplicationService.cancelThesisApplication(
						group.id,
						suggestion.id,
					);

					showNotification.success(
						"Application Canceled",
						"Your thesis application has been canceled successfully!",
					);

					// Refresh applications to update button state
					refreshApplications();

					// Refresh thesis list
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

	// Handle unregister thesis
	const handleUnregisterThesis = () => {
		unregisterThesis(suggestion.englishName, () => {
			// Clear relevant caches
			cacheUtils.clear("semesterStatus");

			// Refresh group data to update UI
			resetInitialization();

			// Refresh applications to update button state
			refreshApplications();

			// Refresh thesis list immediately to show updated assignment
			onThesisUpdate?.();
		});
	};

	// Get button tooltip message based on current state
	const getButtonTooltip = (): string => {
		if (isThesisAssignedToGroup) {
			return "This thesis is already assigned to your group";
		}
		if (hasApplicationForThesis) {
			return "You have a pending application for this thesis";
		}
		if (isThesisTaken) {
			return "This thesis is already taken by another group";
		}
		if (!hasGroup) {
			return "You need to be in a group to apply";
		}
		if (studentRole !== "leader") {
			return "Only group leaders can apply for thesis";
		}
		if (!canRegisterThesis) {
			return 'Application is only available during the "Picking" phase or "Ongoing - Scope Adjustable" phase';
		}
		return "Apply for this thesis";
	};

	// Get register button text based on current state
	const getRegisterButtonText = (): string => {
		if (isRegistering) {
			return "Processing...";
		}
		if (!isAllDataLoaded) {
			return "Checking...";
		}
		if (hasApplicationForThesis) {
			return "Cancel Application";
		}
		if (isThesisTaken) {
			return "Taken";
		}
		return "Apply Thesis";
	};

	// Get progress color based on compatibility score
	const getProgressColor = (score: number): string => {
		if (score >= 0.9) return "#52c41a"; // Green
		if (score >= 0.7) return "#1890ff"; // Blue
		if (score >= 0.5) return "#faad14"; // Orange
		return "#ff4d4f"; // Red
	};

	// Convert compatibility to percentage
	const compatibilityPercentage = Math.round(suggestion.compatibility * 100);

	return (
		<Card
			style={{ height: "100%", display: "flex", flexDirection: "column" }}
			bodyStyle={{ flex: 1, display: "flex", flexDirection: "column" }}
			hoverable
		>
			<Space
				direction="vertical"
				size="middle"
				style={{ width: "100%", flex: 1 }}
			>
				{/* AI Score Section */}
				<div>
					<Row justify="space-between" align="middle">
						<Col>
							<Typography.Text strong style={{ color: "#1890ff" }}>
								AI Match Score
							</Typography.Text>
						</Col>
						<Col>
							<Typography.Text strong style={{ fontSize: "16px" }}>
								{compatibilityPercentage}%
							</Typography.Text>
						</Col>
					</Row>
					<Progress
						percent={compatibilityPercentage}
						strokeColor={getProgressColor(suggestion.compatibility)}
						showInfo={false}
						size="small"
					/>
				</div>

				{/* Thesis Title */}
				<div>
					<Typography.Title
						level={4}
						style={{
							margin: 0,
							marginBottom: "8px",
							minHeight: "84px",
							maxHeight: "84px",
							lineHeight: "1.4",
						}}
						ellipsis={{
							rows: 3,
							tooltip: suggestion.englishName,
						}}
					>
						{suggestion.englishName}
					</Typography.Title>

					{/* Tags Section */}
					<div style={{ marginBottom: "8px" }}>
						{/* Abbreviation */}
						{suggestion.abbreviation && (
							<Tag color="geekblue" style={{ marginRight: "8px" }}>
								{suggestion.abbreviation}
							</Tag>
						)}

						{/* Orientation Tag */}
						{suggestion.orientation &&
							(() => {
								const orientationData = getOrientationDisplay(
									suggestion.orientation as ThesisOrientation,
								);
								return orientationData ? (
									<Tag
										color={orientationData.color}
										title={orientationData.description}
									>
										{orientationData.label}
									</Tag>
								) : null;
							})()}
					</div>
				</div>

				{/* Supervisors Info */}
				<div style={{ flex: 1 }}>
					<Typography.Text
						strong
						style={{ fontSize: "14px", marginBottom: "8px", display: "block" }}
					>
						Supervisors:
					</Typography.Text>
					<Space direction="vertical" size="small" style={{ width: "100%" }}>
						{suggestion.supervisorsName.map((supervisor) => (
							<Row key={supervisor} align="middle" gutter={8}>
								<Col>
									<Avatar size="small" icon={<UserOutlined />} />
								</Col>
								<Col flex="auto">
									<Typography.Text>{supervisor}</Typography.Text>
								</Col>
							</Row>
						))}
					</Space>
				</div>

				{/* Action Buttons */}
				<Row gutter={8}>
					<Col flex="auto">
						<Button block onClick={handleViewDetails}>
							View Details
						</Button>
					</Col>
					<Col>
						{canUnregister ? (
							<Button
								block
								danger
								onClick={handleUnregisterThesis}
								loading={isRegistering}
								disabled={!isAllDataLoaded}
								title="Unpick this thesis"
							>
								{isRegistering ? "Unpicking..." : "Unpick Thesis"}
							</Button>
						) : (
							<Button
								type="primary"
								disabled={
									isRegistering ||
									(isRegisterDisabled && !hasApplicationForThesis)
								}
								loading={isRegistering || !isAllDataLoaded}
								onClick={
									hasApplicationForThesis
										? handleCancelApplication
										: handleRegisterThesis
								}
								title={getButtonTooltip()}
								block
								danger={hasApplicationForThesis && isAllDataLoaded}
							>
								{getRegisterButtonText()}
							</Button>
						)}
					</Col>
				</Row>
			</Space>
		</Card>
	);
}
