'use client';

import { Space } from 'antd';
import { useState } from 'react';

import { ReviewerConfirmationModals } from '@/components/common/ConfirmModal';
import { Header } from '@/components/common/Header';
import AssignReviewerModal from '@/components/features/lecturer/AssignLecturerReview/AssignReviewerModal';
import GroupTable from '@/components/features/lecturer/AssignLecturerReview/GroupTable';
import SearchFilterBar from '@/components/features/lecturer/AssignLecturerReview/SearchFilterBar';
import {
	useAssignReviewerColumns,
	useAssignReviewerDrafts,
	useAssignReviewerLecturers,
	useAssignReviewerSearch,
	useAssignReviewerSemesterMilestone,
	useAssignReviewerSubmissions,
} from '@/hooks/lecturer';

export default function AssignLecturerReview() {
	const [saveDraftLoading, setSaveDraftLoading] = useState(false);

	// Custom hooks for organized logic
	const {
		semester,
		setSemester,
		milestone,
		setMilestone,
		semesters,
		milestones,
		loadingSemesters,
		loadingMilestones,
	} = useAssignReviewerSemesterMilestone();

	const {
		submissions,
		groupsInSemester,
		loadingSubmissions,
		handleRefresh,
		reloadSubmissionById,
	} = useAssignReviewerSubmissions(milestone);

	const { getReviewersForGroup, getLecturerNameById } =
		useAssignReviewerLecturers();

	const { search, setSearch, filteredGroups } =
		useAssignReviewerSearch(groupsInSemester);

	const {
		updating,
		draftCount,
		getDraftReviewerAssignment,
		removeDraftReviewerAssignment,
		handleAssignAllDrafts,
		saveDraftReviewerAssignment,
	} = useAssignReviewerDrafts();

	const { columns, selectedGroup, setSelectedGroup } = useAssignReviewerColumns(
		{
			submissions,
			draftCount,
			getDraftReviewerAssignment,
			removeDraftReviewerAssignment,
		},
	);

	/**
	 * Handle bulk assignment confirmation for reviewer drafts
	 */
	const handleAssignAllDraftsConfirm = (): void => {
		ReviewerConfirmationModals.assignAllDrafts(
			draftCount,
			() => handleAssignAllDrafts(milestone, handleRefresh),
			updating,
		);
	};

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Assign Reviewer"
				description="Review and assign lecturers to project groups for each milestone."
				badgeText="Moderator Only"
			/>

			<SearchFilterBar
				search={search}
				onSearchChange={setSearch}
				semester={semester}
				onSemesterChange={setSemester}
				milestone={milestone}
				onMilestoneChange={setMilestone}
				semesters={semesters}
				milestones={milestones}
				loadingSemesters={loadingSemesters}
				loadingMilestones={loadingMilestones}
				noMilestone={milestone === 'NO_MILESTONE'}
				onRefresh={handleRefresh}
				onAssignAllDrafts={handleAssignAllDraftsConfirm}
				draftCount={draftCount}
				updating={updating}
			/>

			<GroupTable
				groups={filteredGroups}
				columns={columns}
				loading={loadingSubmissions}
				noMilestone={milestone === 'NO_MILESTONE'}
			/>

			<AssignReviewerModal
				open={!!selectedGroup}
				group={selectedGroup}
				saveDraftLoading={saveDraftLoading}
				initialValues={
					selectedGroup
						? (() => {
								// Check if there's a draft for this submission
								const draft = getDraftReviewerAssignment(
									selectedGroup.submissionId || '',
								);

								if (draft) {
									// Use draft values if they exist
									return [
										draft.mainReviewerId,
										draft.secondaryReviewerId,
									].filter(Boolean) as string[];
								}

								// Fall back to current assigned reviewers
								return getReviewersForGroup(
									selectedGroup.id,
									selectedGroup.phase ?? '',
									filteredGroups,
								);
							})()
						: []
				}
				onCancel={() => setSelectedGroup(null)}
				onAssign={() => setSelectedGroup(null)}
				onReloadSubmission={reloadSubmissionById}
				onSaveDraft={(mainReviewerId, secondaryReviewerId) => {
					if (!selectedGroup) return;

					setSaveDraftLoading(true);

					const submissionId = selectedGroup.submissionId;
					if (!submissionId) {
						setSaveDraftLoading(false);
						return;
					}

					const mainReviewerName = mainReviewerId
						? getLecturerNameById(mainReviewerId)
						: undefined;
					const secondaryReviewerName = secondaryReviewerId
						? getLecturerNameById(secondaryReviewerId)
						: undefined;

					saveDraftReviewerAssignment(
						submissionId,
						selectedGroup.name,
						selectedGroup.title,
						mainReviewerId,
						mainReviewerName,
						secondaryReviewerId,
						secondaryReviewerName,
					);

					setSaveDraftLoading(false);
					setSelectedGroup(null);
				}}
			/>
		</Space>
	);
}
