"use client";

import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Col, Row, Space, Tag, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

import { ConfirmationModal } from "@/components/common/ConfirmModal";
import { useSemesterStatus } from "@/hooks/student/useSemesterStatus";
import { useStudentGroupStatus } from "@/hooks/student/useStudentGroupStatus";
import { useThesisRegistration } from "@/hooks/thesis";
import { DOMAIN_COLOR_MAP } from "@/lib/constants/domains";
import { getOrientationDisplay } from "@/lib/constants/orientation";
import thesisApplicationService, {
	ThesisApplication,
} from "@/lib/services/thesis-application.service";
import { handleApiError } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";
import { ThesisWithRelations } from "@/schemas/thesis";
import { cacheUtils } from "@/store/helpers/cacheHelpers";

interface Props {
	readonly thesis: ThesisWithRelations;
	readonly studentRole?: "leader" | "member" | "guest";
	readonly applications?: ThesisApplication[];
	readonly applicationsLoading?: boolean;
	readonly onThesisUpdate?: () => void | Promise<void>;
	readonly onApplicationsRefresh?: () => void | Promise<void>;
}

export default function ThesisCard({
	thesis,
	studentRole,
	applications = [],
	applicationsLoading = false,
	onThesisUpdate,
	onApplicationsRefresh,
}: Props) {
	const { hasGroup, group, resetInitialization } = useStudentGroupStatus();
	const { canRegisterThesis, loading: semesterLoading } = useSemesterStatus();
	const { registerThesis, unregisterThesis, isRegistering } =
		useThesisRegistration();
	const router = useRouter();

	// Local state to track pending application to avoid race conditions
	const [localPendingApplication, setLocalPendingApplication] = useState(false);

	// Get domain color
	const domainColor = thesis.domain
		? DOMAIN_COLOR_MAP[thesis.domain] || "default"
		: "default";

	// Check if current group has application for this thesis
	const hasApplicationForThesis = useMemo(() => {
		// Check local state first for immediate UI update
		if (localPendingApplication) return true;

		// Then check server data
		return applications.some(
			(app: ThesisApplication) =>
				app.thesisId === thesis.id && app.status === "Pending",
		);
	}, [applications, thesis.id, localPendingApplication]);

	// Reset local pending state when server data confirms the application exists
	useEffect(() => {
		if (localPendingApplication) {
			const serverHasApplication = applications.some(
				(app: ThesisApplication) =>
					app.thesisId === thesis.id && app.status === "Pending",
			);
			if (serverHasApplication) {
				setLocalPendingApplication(false);
			}
		}
	}, [applications, thesis.id, localPendingApplication]);

	// Check if thesis is already taken by another group
	const isThesisTaken = thesis.groupId != null; // Use != null to catch both null and undefined

	// Check if current group has this thesis assigned
	const isThesisAssignedToGroup = group?.id === thesis.groupId;

	// Check if all data is loaded
	const isAllDataLoaded = !applicationsLoading && !semesterLoading;

	// Determine if register button should be enabled
	const canRegister =
		studentRole === "leader" &&
		hasGroup &&
		!isThesisTaken &&
		!hasApplicationForThesis &&
		isAllDataLoaded;

	// Determine if unregister button should be shown
	const canUnregister =
		studentRole === "leader" &&
		hasGroup &&
		isThesisAssignedToGroup &&
		isAllDataLoaded;

	// Show loading button when data is still being loaded
	const showLoadingButton =
		!isAllDataLoaded &&
		studentRole === "leader" &&
		hasGroup &&
		!isThesisAssignedToGroup &&
		!localPendingApplication;

	// Disable register button if semester is not in picking phase
	const isRegisterDisabled =
		!canRegister || !canRegisterThesis || isRegistering;

	// Handle view details navigation
	const handleViewDetails = () => {
		router.push(`/student/list-thesis/${thesis.id}`);
	};

	// Handle register thesis
	const handleRegisterThesis = () => {
		registerThesis(thesis.id, thesis.englishName, () => {
			// Set local pending state AFTER successful submission
			setLocalPendingApplication(true);

			// Clear relevant caches
			cacheUtils.clear("semesterStatus");

			// Refresh group data to update UI
			resetInitialization();

			// Refresh applications immediately to update button state
			onApplicationsRefresh?.();

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

					// Clear local pending state immediately
					setLocalPendingApplication(false);

					// Refresh applications first to update button state immediately
					onApplicationsRefresh?.();

					// Then refresh thesis list
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
		if (showLoadingButton) {
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

				{thesis.orientation &&
					(() => {
						const orientationDisplay = getOrientationDisplay(
							thesis.orientation,
						);
						return orientationDisplay ? (
							<Tag color={orientationDisplay.color} style={{ borderRadius: 6 }}>
								{orientationDisplay.label}
							</Tag>
						) : null;
					})()}
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
							loading={isRegistering}
							disabled={!isAllDataLoaded}
							title="Cancel thesis application"
						>
							{isRegistering ? "Canceling..." : "Cancel Application"}
						</Button>
					) : (
						<Button
							block
							disabled={
								showLoadingButton ||
								(isRegisterDisabled && !hasApplicationForThesis)
							}
							title={getButtonTooltip()}
							onClick={
								hasApplicationForThesis
									? handleCancelApplication
									: handleRegisterThesis
							}
							loading={isRegistering || showLoadingButton}
							danger={hasApplicationForThesis && isAllDataLoaded}
						>
							{getRegisterButtonText()}
						</Button>
					)}
				</Col>
			</Row>
		</Card>
	);
}
