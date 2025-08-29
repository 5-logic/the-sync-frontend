'use client';

import { Card, Steps, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import milestoneService from '@/lib/services/milestones.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { convertToVietnamTime } from '@/lib/utils/milestoneUtils';
import { Milestone } from '@/schemas/milestone';

const { Text } = Typography;

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
				const response =
					await milestoneService.findAllBySemester(semesterIdParam);
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
						padding: '12px',
						background: '#f5f5f5',
						borderRadius: '6px',
					}}
				>
					<div
						style={{
							marginBottom: 8,
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						}}
					>
						<Text strong>Milestone Period: </Text>
						<Text>
							{convertToVietnamTime(
								currentMilestone.startDate,
							).toLocaleDateString('vi-VN')}{' '}
							-{' '}
							{convertToVietnamTime(
								currentMilestone.endDate,
							).toLocaleDateString('vi-VN')}
						</Text>
						<span
							style={{
								fontSize: '14px',
								color: (() => {
									const now = new Date();
									const startDate = new Date(
										currentMilestone.startDate.toString(),
									);
									const isActive = now >= startDate;
									return isActive ? '#52c41a' : '#ff4d4f';
								})(),
								fontWeight: 'bold',
							}}
						>
							{(() => {
								const now = new Date();
								const startDate = new Date(
									currentMilestone.startDate.toString(),
								);
								const isActive = now >= startDate;
								return isActive ? 'Active' : 'Inactive';
							})()}
						</span>
					</div>
				</div>
			)}
		</Card>
	);
}
