'use client';

import { Card, Steps } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import milestoneService from '@/lib/services/milestones.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { Milestone } from '@/schemas/milestone';

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
				console.error('Error fetching milestones:', error);
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
		</Card>
	);
}
