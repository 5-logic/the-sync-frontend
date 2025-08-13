"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Row, Space } from "antd";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useSemesterStatus } from "@/hooks/student/useSemesterStatus";
import { useStudentGroupStatus } from "@/hooks/student/useStudentGroupStatus";
import { useThesisRegistration } from "@/hooks/thesis";
import { ThesisWithRelations } from "@/schemas/thesis";
import { cacheUtils } from "@/store/helpers/cacheHelpers";
import { useGroupDashboardStore } from "@/store/useGroupDashboardStore";

interface Props {
	readonly thesis: ThesisWithRelations;
	readonly disabled?: boolean;
	readonly onThesisUpdate?: () => void | Promise<void>;
}

export default function ActionButtons({
	thesis,
	disabled = false,
	onThesisUpdate,
}: Props) {
	const router = useRouter();
	const { hasGroup, isLeader, group, resetInitialization } =
		useStudentGroupStatus();
	const { canRegisterThesis, loading: semesterLoading } = useSemesterStatus();
	const { registerThesis, unregisterThesis, isRegistering } =
		useThesisRegistration();
	const { fetchStudentGroup } = useGroupDashboardStore();

	const handleBackToList = useCallback(() => {
		router.push("/student/list-thesis");
	}, [router]);
	const handleRegisterThesis = useCallback(async () => {
		await registerThesis(thesis.id, thesis.englishName, async () => {
			// Immediately trigger thesis refresh for instant UI update
			onThesisUpdate?.();

			// Clear relevant caches and refresh group data in background
			cacheUtils.clear("semesterStatus");
			fetchStudentGroup(true); // Remove await to not block UI
			resetInitialization();
		});
	}, [
		registerThesis,
		thesis.id,
		thesis.englishName,
		fetchStudentGroup,
		resetInitialization,
		onThesisUpdate,
	]);
	const handleUnregisterThesis = useCallback(async () => {
		await unregisterThesis(thesis.englishName, async () => {
			// Immediately trigger thesis refresh for instant UI update
			onThesisUpdate?.();

			// Clear relevant caches and refresh group data in background
			cacheUtils.clear("semesterStatus");
			fetchStudentGroup(true); // Remove await to not block UI
			resetInitialization();
		});
	}, [
		unregisterThesis,
		thesis.englishName,
		fetchStudentGroup,
		resetInitialization,
		onThesisUpdate,
	]);

	// Check if current group has this thesis assigned (check if thesis.groupId matches current group)
	const isThesisAssignedToGroup = group?.id === thesis.groupId;

	// Show register button only if user has group, is leader, and thesis is not assigned to any group
	const showRegisterButton = hasGroup && isLeader && thesis.groupId == null; // Use == null to catch both null and undefined

	// Show unregister button only if user has group, is leader, and this thesis is assigned to their group
	const showUnregisterButton = hasGroup && isLeader && isThesisAssignedToGroup;

	// Disable register button if semester is not in picking phase
	const isRegisterDisabled =
		disabled || !canRegisterThesis || isRegistering || semesterLoading;

	return (
		<Row justify="end">
			<Space>
				<Button icon={<ArrowLeftOutlined />} onClick={handleBackToList}>
					Back to List
				</Button>
				{showRegisterButton && (
					<Button
						type="primary"
						onClick={handleRegisterThesis}
						loading={isRegistering || semesterLoading}
						disabled={isRegisterDisabled}
						title={
							!canRegisterThesis
								? 'Registration is only available during the "Picking" phase or "Ongoing - Scope Adjustable" phase'
								: undefined
						}
					>
						{isRegistering ? "Registering..." : "Register Thesis"}
					</Button>
				)}
				{showUnregisterButton && (
					<Button
						type="primary"
						danger
						onClick={handleUnregisterThesis}
						loading={isRegistering}
						disabled={disabled}
					>
						Unregister Thesis
					</Button>
				)}
			</Space>
		</Row>
	);
}
