import { Alert, Button } from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { ConfirmationModal } from "@/components/common/ConfirmModal";
import { useSessionData } from "@/hooks/auth/useAuth";
import { useCurrentSemester } from "@/hooks/semester/useCurrentSemester";
import aiService, { type GroupSuggestion } from "@/lib/services/ai.service";
import studentsService from "@/lib/services/students.service";
import { handleApiResponse } from "@/lib/utils/handleApi";

const FORM_CONFIG = {
	BUTTON_HEIGHT: 40,
	BUTTON_MIN_WIDTH: 180,
	BUTTON_FONT_SIZE: 14,
} as const;

const BUTTON_STYLES = {
	height: FORM_CONFIG.BUTTON_HEIGHT,
	padding: "0 16px",
	fontSize: FORM_CONFIG.BUTTON_FONT_SIZE,
	minWidth: "auto",
} as const;

interface JoinGroupFormProps {
	readonly onSuggestionsReceived?: (suggestions: GroupSuggestion[]) => void;
}

export default function JoinGroupForm({
	onSuggestionsReceived,
}: JoinGroupFormProps) {
	const [loading, setLoading] = useState(false);
	const { session } = useSessionData();
	const { currentSemester } = useCurrentSemester();
	const router = useRouter();

	const callAISuggestAPI = useCallback(async () => {
		if (!session?.user?.id || !currentSemester?.id) {
			return;
		}

		try {
			const response = await aiService.suggestGroupsForStudent({
				studentId: session.user.id,
				semesterId: currentSemester.id,
			});

			// Direct access since service already returns proper response format
			if (response.success && response.data?.suggestions) {
				onSuggestionsReceived?.(response.data.suggestions);
			}
		} catch (error) {
			console.error("Error calling AI suggest API:", error);
		}
	}, [session?.user?.id, currentSemester?.id, onSuggestionsReceived]);

	const handleSuggestGroups = useCallback(async () => {
		if (!session?.user?.id || !currentSemester?.id) {
			return;
		}

		try {
			setLoading(true);

			// First, get current student data to check if they have responsibilities
			const studentResponse = await studentsService.findOne(session.user.id);
			const studentResult = handleApiResponse(studentResponse);

			if (!studentResult.success) {
				console.error("Failed to fetch student data");
				return;
			}

			const student = studentResult.data;
			const hasResponsibilities =
				student?.studentExpectedResponsibilities &&
				student.studentExpectedResponsibilities.length > 0;

			// Show modal if student doesn't have responsibilities
			if (!hasResponsibilities) {
				ConfirmationModal.show({
					title: "Set Up Your Profile",
					message:
						"To get the best group suggestions, please set up your expected responsibilities in your profile first.",
					details:
						"This helps our AI algorithm find groups that match your preferences.",
					okText: "Continue Anyway",
					cancelText: "Go to Profile",
					okType: "primary",
					onOk: async () => {
						await callAISuggestAPI();
					},
					onCancel: () => {
						router.push("/student/account-setting");
					},
				});
			} else {
				// If student has responsibilities, directly call API
				await callAISuggestAPI();
			}
		} catch (error) {
			console.error("Error in suggest groups:", error);
		} finally {
			setLoading(false);
		}
	}, [session?.user?.id, currentSemester?.id, router, callAISuggestAPI]);

	return (
		<div style={{ width: "100%" }}>
			{/* Desktop/Tablet: Alert with action button inline */}
			<div className="hidden sm:block">
				<Alert
					message="Having trouble finding a group?"
					description="Use our AI-powered group suggestion feature to find groups that match your responsibilities!"
					type="info"
					showIcon
					action={
						<Button
							type="primary"
							style={{
								...BUTTON_STYLES,
								width: "100%",
								maxWidth: "200px",
								whiteSpace: "normal",
								textAlign: "center",
								wordBreak: "break-word",
							}}
							loading={loading}
							onClick={handleSuggestGroups}
						>
							{loading ? "Finding Groups..." : "Suggest Groups by AI"}
						</Button>
					}
					style={{ width: "100%" }}
				/>
			</div>

			{/* Mobile only: Alert and Button separately */}
			<div className="block sm:hidden">
				<Alert
					message="Having trouble finding a group?"
					description="Use our AI-powered group suggestion feature to find groups that match your responsibilities!"
					type="info"
					showIcon
					style={{
						width: "100%",
						marginBottom: "16px",
						wordBreak: "break-word",
						wordWrap: "break-word",
						overflowWrap: "break-word",
					}}
				/>
				<Button
					type="primary"
					style={{
						...BUTTON_STYLES,
						width: "100%",
						whiteSpace: "normal",
						textAlign: "center",
						wordBreak: "break-word",
					}}
					loading={loading}
					onClick={handleSuggestGroups}
				>
					{loading ? "Finding Groups..." : "Suggest Groups by AI"}
				</Button>
			</div>
		</div>
	);
}
