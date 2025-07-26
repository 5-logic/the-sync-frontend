'use client';

import { Empty, Space, Spin } from 'antd';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Header } from '@/components/common/Header';
import ActionButtons from '@/components/features/student/ViewThesisDetail/ActionButtons';
import AssignedGroupCard from '@/components/features/student/ViewThesisDetail/AssignedGroupCard';
import ThesisInfoCard from '@/components/features/student/ViewThesisDetail/ThesisInfoCard';
import groupsService from '@/lib/services/groups.service';
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

			// Fetch thesis data with relations
			const thesisResponse = await thesesService.findOneWithRelations(thesisId);
			const thesisResult = handleApiResponse(thesisResponse, 'Success');

			if (thesisResult.success && thesisResult.data) {
				const thesisData = thesisResult.data;

				// Since we're using findOneWithRelations, the data already has the correct structure
				setThesis(thesisData);

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
