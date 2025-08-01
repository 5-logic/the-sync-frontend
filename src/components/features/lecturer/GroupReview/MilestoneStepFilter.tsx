"use client";

import { Card, Steps, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";

import milestoneService from "@/lib/services/milestones.service";
import { handleApiResponse } from "@/lib/utils/handleApi";
import { Milestone } from "@/schemas/milestone";

const { Text } = Typography;

/**
 * Check if current time (already in Vietnam timezone) is within milestone period
 * @param startDate - Milestone start date string
 * @param endDate - Milestone end date string
 * @returns boolean - true if current time is within milestone period
 */
const isWithinMilestonePeriod = (
	startDate: string,
	endDate: string,
): boolean => {
	try {
		// Get current time (already in Vietnam timezone since user is in Vietnam)
		const now = new Date();

		// Parse milestone dates from backend (assumed to be in UTC)
		const start = new Date(startDate);
		const end = new Date(endDate);

		// Convert milestone dates to Vietnam timezone (UTC+7)
		const vietnamStart = new Date(start.getTime() + 7 * 60 * 60 * 1000);
		const vietnamEnd = new Date(end.getTime() + 7 * 60 * 60 * 1000);

		// Set start time to beginning of day
		const startOfDay = new Date(vietnamStart);
		startOfDay.setHours(0, 0, 0, 0);

		// Set end time to end of day
		const endOfDay = new Date(vietnamEnd);
		endOfDay.setHours(23, 59, 59, 999);

		// Check if current time is within milestone period
		return now >= startOfDay && now <= endOfDay;
	} catch (error) {
		console.error("Error checking milestone period:", error);
		return false; // Deny access on error
	}
};

interface Props {
	selectedMilestone: string | null;
	onMilestoneChange: (milestoneId: string | null) => void;
	semesterId: string | null;
	loading?: boolean;
	onLoadingChange?: (loading: boolean) => void;
}

export default function MilestoneStepFilter({
	selectedMilestone,
	onMilestoneChange,
	semesterId,
	loading = false,
	onLoadingChange,
}: Readonly<Props>) {
	const [milestones, setMilestones] = useState<Milestone[]>([]);
	const [milestonesLoading, setMilestonesLoading] = useState(false);

	const fetchMilestones = useCallback(
		async (semesterIdParam: string) => {
			try {
				setMilestonesLoading(true);
				onLoadingChange?.(true);
				const response = await milestoneService.findBySemester(semesterIdParam);
				const result = handleApiResponse(response);

				if (result.success && result.data) {
					setMilestones(result.data);
				}
			} catch (error) {
				console.error("Error fetching milestones:", error);
				setMilestones([]);
			} finally {
				setMilestonesLoading(false);
				onLoadingChange?.(false);
			}
		},
		[onLoadingChange],
	);

	// Fetch milestones when semester changes
	useEffect(() => {
		if (semesterId) {
			fetchMilestones(semesterId);
		} else {
			setMilestones([]);
			onMilestoneChange(null);
		}
		// Reset selected milestone when semester changes
		return () => {
			setMilestones([]);
		};
	}, [semesterId, fetchMilestones, onMilestoneChange]);

	// Auto-select first milestone when milestones are loaded and no selection exists
	useEffect(() => {
		if (!selectedMilestone && milestones.length > 0) {
			onMilestoneChange(milestones[0].id);
		}
	}, [milestones, selectedMilestone, onMilestoneChange]);

	// Get current step index
	const currentStep = selectedMilestone
		? milestones.findIndex((m) => m.id === selectedMilestone)
		: 0;

	// Get current milestone for period display
	const currentMilestone = selectedMilestone
		? milestones.find((m) => m.id === selectedMilestone)
		: milestones[0];

	// Handle step change
	const handleStepChange = (index: number) => {
		if (milestones[index]) {
			onMilestoneChange(milestones[index].id);
		}
	};

	// Don't render if no semester selected
	if (!semesterId) {
		return null;
	}

	// Don't render if no milestones (but don't show loading here, let table handle it)
	if (milestones.length === 0) {
		return null;
	}

	return (
		<Card style={{ marginBottom: 10 }}>
			<Steps
				current={currentStep}
				items={milestones.map((milestone) => ({
					title: milestone.name,
					disabled: milestonesLoading || loading,
				}))}
				onChange={handleStepChange}
			/>

			{/* Milestone Period Information */}
			{currentMilestone && (
				<div
					style={{
						marginTop: 16,
						padding: "12px",
						background: "#f5f5f5",
						borderRadius: "6px",
					}}
				>
					<div
						style={{
							marginBottom: 8,
							display: "flex",
							alignItems: "center",
							gap: 8,
						}}
					>
						<Text strong>Milestone Period: </Text>
						<Text>
							{new Date(
								new Date(currentMilestone.startDate).getTime() +
									7 * 60 * 60 * 1000,
							).toLocaleDateString("vi-VN")}{" "}
							-{" "}
							{new Date(
								new Date(currentMilestone.endDate).getTime() +
									7 * 60 * 60 * 1000,
							).toLocaleDateString("vi-VN")}
						</Text>
						<span
							style={{
								fontSize: "14px",
								color: isWithinMilestonePeriod(
									currentMilestone.startDate.toString(),
									currentMilestone.endDate.toString(),
								)
									? "#52c41a"
									: "#ff4d4f",
								fontWeight: "bold",
							}}
						>
							{isWithinMilestonePeriod(
								currentMilestone.startDate.toString(),
								currentMilestone.endDate.toString(),
							)
								? "Active"
								: "Inactive"}
						</span>
					</div>
				</div>
			)}
		</Card>
	);
}
