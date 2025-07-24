'use client';

import { Empty, Space, Spin } from 'antd';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Header } from '@/components/common/Header';
import ActionButtons from '@/components/features/student/ViewThesisDetail/ActionButtons';
import AssignedGroupCard from '@/components/features/student/ViewThesisDetail/AssignedGroupCard';
import ThesisInfoCard from '@/components/features/student/ViewThesisDetail/ThesisInfoCard';
import groupsService from '@/lib/services/groups.service';
import lecturersService from '@/lib/services/lecturers.service';
import thesesService from '@/lib/services/theses.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { GroupDashboard } from '@/schemas/group';
import { ThesisWithRelations } from '@/schemas/thesis';

export default function StudentThesisDetailPage() {
	const { id: thesisId } = useParams() as { id: string };

	const [thesis, setThesis] = useState<ThesisWithRelations | null>(null);
	const [assignedGroup, setAssignedGroup] = useState<GroupDashboard | null>(
		null,
	);
	const [loading, setLoading] = useState(true);

	// Fetch thesis details and lecturer info
	const fetchThesisDetails = useCallback(async () => {
		if (!thesisId) return;

		try {
			// Only set loading if not already loading (to avoid double loading state)
			setLoading((prevLoading) => prevLoading || true);

			// Fetch thesis data
			const thesisResponse = await thesesService.findOne(thesisId);
			const thesisResult = handleApiResponse(thesisResponse, 'Success');

			if (thesisResult.success && thesisResult.data) {
				const thesisData = thesisResult.data;

				// Type guard for extended thesis data
				const hasThesisVersions = (
					data: unknown,
				): data is {
					thesisVersions?: Array<{
						id: string;
						version: number;
						supportingDocument: string;
					}>;
				} => {
					return (
						typeof data === 'object' &&
						data !== null &&
						'thesisVersions' in data
					);
				};

				const hasThesisSkills = (
					data: unknown,
				): data is {
					thesisRequiredSkills?: Array<{
						thesisId: string;
						skillId: string;
						skill: { id: string; name: string };
					}>;
				} => {
					return (
						typeof data === 'object' &&
						data !== null &&
						'thesisRequiredSkills' in data
					);
				};

				// Fetch lecturer info
				const lecturerResponse = await lecturersService.findOne(
					thesisData.lecturerId,
				);
				const lecturerResult = handleApiResponse(lecturerResponse, 'Success');

				// Create ThesisWithRelations object with real data
				const thesisWithRelations: ThesisWithRelations = {
					...thesisData,
					semesterId: thesisData.lecturerId, // Use lecturerId as temporary semesterId
					lecturer: {
						userId: lecturerResult.data?.id || thesisData.lecturerId,
						isModerator: lecturerResult.data?.isModerator || false,
						user: {
							id: lecturerResult.data?.id || thesisData.lecturerId,
							fullName: lecturerResult.data?.fullName || 'Unknown',
							email: lecturerResult.data?.email || 'No email',
							// Add phone number from lecturer API
							phoneNumber: lecturerResult.data?.phoneNumber,
						} as {
							id: string;
							fullName: string;
							email: string;
							phoneNumber?: string;
						},
					},
					// Map thesisRequiredSkills to the expected format
					thesisRequiredSkills: hasThesisSkills(thesisData)
						? (thesisData.thesisRequiredSkills || []).map((item) => ({
								id: item.skill.id,
								name: item.skill.name,
							}))
						: [],
					thesisVersions: hasThesisVersions(thesisData)
						? thesisData.thesisVersions || []
						: [],
				};

				setThesis(thesisWithRelations);

				// If thesis has a group assigned, fetch group details
				if (thesisData.groupId) {
					const groupResponse = await groupsService.findOne(thesisData.groupId);
					const groupResult = handleApiResponse(groupResponse, 'Success');

					if (groupResult.success && groupResult.data) {
						setAssignedGroup(groupResult.data);
					}
				} else {
					// Clear assigned group if thesis no longer has one
					setAssignedGroup(null);
				}
			}
		} catch (error) {
			console.error('Error fetching thesis details:', error);
		} finally {
			setLoading(false);
		}
	}, [thesisId]);

	useEffect(() => {
		fetchThesisDetails();
	}, [fetchThesisDetails]);

	// Handle refresh with cache clearing
	const handleRefreshThesis = useCallback(async () => {
		setLoading(true); // Show loading immediately
		setThesis(null);
		setAssignedGroup(null);
		await fetchThesisDetails();
	}, [fetchThesisDetails]);

	if (loading) {
		return (
			<div style={{ textAlign: 'center', padding: '50px' }}>
				<Spin size="large" tip="Loading thesis details..." />
			</div>
		);
	}

	if (!thesis) {
		return <Empty description="No thesis data available" />;
	}

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			{/* Header */}
			<Header
				title="Thesis Detail"
				description="View comprehensive thesis information, supervisor details, and group assignment status."
			/>

			{/* Thesis Information */}
			<ThesisInfoCard thesis={thesis} />

			{/* Group Assignment Card (if thesis is assigned to a group) */}
			{assignedGroup && <AssignedGroupCard assignedGroup={assignedGroup} />}

			{/* Action Buttons */}
			<ActionButtons thesis={thesis} onThesisUpdate={handleRefreshThesis} />
		</Space>
	);
}
