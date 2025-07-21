'use client';

import { Space } from 'antd';
import { useEffect, useState } from 'react';

import { Header } from '@/components/common/Header';
import AssignReviewerModal from '@/components/features/lecturer/AssignLecturerReview/AssignReviewerModal';
import DraftReviewerAssignmentsList from '@/components/features/lecturer/AssignLecturerReview/DraftReviewerAssignmentsList';
import GroupTable, {
	GroupTableProps,
} from '@/components/features/lecturer/AssignLecturerReview/GroupTable';
import SearchFilterBar from '@/components/features/lecturer/AssignLecturerReview/SearchFilterBar';
import { mockLecturers } from '@/data/lecturers';
import { mockReviews } from '@/data/review';
import reviewService from '@/lib/services/review.service';
import {
	useMilestoneStore,
	useSemesterStore,
	useSubmissionStore,
} from '@/store';
import { useDraftReviewerAssignmentStore } from '@/store/useDraftReviewerAssignmentStore';

export default function AssignLecturerReview() {
	// Draft reviewer store
	const {
		addDraftReviewerAssignment,
		getDraftReviewerAssignmentsList,
		clearAllDraftReviewerDrafts,
	} = useDraftReviewerAssignmentStore();
	const [updating, setUpdating] = useState(false);
	const [selectedGroup, setSelectedGroup] = useState<GroupTableProps | null>(
		null,
	);
	const [search, setSearch] = useState('');
	const [semester, setSemester] = useState('');
	const [milestone, setMilestone] = useState('');

	// Submission store
	const {
		submissions,
		fetchByMilestone,
		loading: loadingSubmissions,
	} = useSubmissionStore();

	// Semester store
	const {
		semesters,
		fetchSemesters,
		loading: loadingSemesters,
	} = useSemesterStore();

	// Milestone store
	const {
		milestones,
		fetchMilestonesBySemester,
		loading: loadingMilestones,
	} = useMilestoneStore();

	// Fetch semesters ngay khi mount
	useEffect(() => {
		fetchSemesters();
	}, [fetchSemesters]);

	// Khi semesters đã có, chọn semester đầu tiên hợp lệ và fetch milestones cho nó
	useEffect(() => {
		if (semesters && semesters.length > 0) {
			const filtered = semesters.filter(
				(s) => s.status !== 'NotYet' && s.status !== 'End',
			);
			const defaultSemester = filtered.length > 0 ? filtered[0].id : '';
			if (defaultSemester && defaultSemester !== semester) {
				setSemester(defaultSemester);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [semesters]);

	// Fetch milestones bất cứ khi nào semester thay đổi
	useEffect(() => {
		if (semester) {
			fetchMilestonesBySemester(semester);
		} else {
			// Clear milestones nếu không có semester
			setMilestone('');
		}
	}, [semester, fetchMilestonesBySemester]);

	// Khi milestones đã có, chọn milestone mặc định (gần ngày hiện tại nhất và ở tương lai)
	useEffect(() => {
		if (milestones && milestones.length > 0) {
			const now = new Date();
			const futureMilestones = milestones.filter((m) => {
				if (!m.startDate) return false;
				return new Date(m.startDate) >= now;
			});
			let defaultMilestone = '';
			if (futureMilestones.length > 0) {
				futureMilestones.sort(
					(a, b) =>
						new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
				);
				defaultMilestone = futureMilestones[0].id;
			} else {
				const sorted = [...milestones].sort(
					(a, b) =>
						new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
				);
				if (sorted.length > 0) defaultMilestone = sorted[0].id;
			}
			setMilestone(defaultMilestone);
		} else {
			setMilestone('NO_MILESTONE');
		}
	}, [milestones]);

	// Fetch submissions khi milestone thay đổi
	useEffect(() => {
		if (milestone) {
			fetchByMilestone(milestone);
		}
	}, [fetchByMilestone, milestone]);

	// Lấy group trực tiếp từ submissions trả về từ API
	const groupsInSemester =
		milestone === 'NO_MILESTONE'
			? []
			: submissions.map((s) => ({
					id: s.group.id,
					code: s.group.code,
					name: s.group.name,
					title: s.thesis?.englishName || '',
					supervisors: s.thesis?.supervisors.map((sup) => sup.fullName),
					reviewers: s.reviewLecturers.map((rev) => rev.fullName),
					submissionId: s.id,
					phase: String(s.milestone),
				}));

	// Search theo group name/code
	const filteredGroups = groupsInSemester.filter((group) => {
		const term = search.toLowerCase();
		return (
			group.name.toLowerCase().includes(term) || //NOSONAR
			group.code.toLowerCase().includes(term)
		);
	});

	// Hàm lấy reviewer hiện tại từ groupId + milestone
	function getReviewersForGroup(groupId: string, milestone: string): string[] {
		const submission = filteredGroups.find(
			(g) => g.id === groupId && g.phase === milestone,
		);
		if (!submission) return [];

		return mockReviews
			.filter((r) => r.submissionId === submission.id)
			.map((r) => {
				const lecturer = mockLecturers.find((l) => l.id === r.lecturerId);
				return lecturer?.fullName;
			})
			.filter(Boolean) as string[];
	}

	function handleRefresh() {
		if (milestone) {
			fetchByMilestone(milestone, true);
		}
	}

	// Reload only a single submission by id
	const reloadSubmissionById = async (submissionId: string) => {
		if (!submissionId) return;
		// fetchByMilestone will reload all, so we need a custom fetch if you want only one
		// For now, just reload all for the milestone, but you can optimize with a custom fetch if available
		if (milestone) {
			await fetchByMilestone(milestone, true);
		}
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
				onAssignAllDrafts={async () => {
					setUpdating(true);
					const drafts = getDraftReviewerAssignmentsList();
					if (!drafts.length) {
						setUpdating(false);
						return;
					}
					try {
						await reviewService.assignBulkReviewers({
							assignments: drafts.map((draft) => ({
								submissionId: draft.submissionId,
								lecturerIds: draft.reviewerIds,
							})),
						});
						clearAllDraftReviewerDrafts();
					} catch (e) {
						console.error('Failed to assign all draft reviewers:', e);
					}
					setUpdating(false);
				}}
				draftCount={getDraftReviewerAssignmentsList().length}
				updating={updating}
			/>

			<DraftReviewerAssignmentsList />

			<GroupTable
				groups={filteredGroups}
				onAssign={(group: GroupTableProps) => {
					// Find the full group object from submissions to match FullMockGroup type
					const submission = submissions.find((s) => s.group.id === group.id);
					if (submission) {
						const submissionGroup = submission.group;
						setSelectedGroup({
							...submissionGroup,
							title: submission.thesis?.englishName || '',
							phase: String(submission.milestone),
							supervisors:
								submission.thesis?.supervisors?.map((sup) => sup.fullName) ||
								[],
							reviewers: submission.reviewLecturers.map((rev) => rev.fullName),
							submissionId: submission.id,
						});
					}
				}}
				loading={loadingSubmissions}
				noMilestone={milestone === 'NO_MILESTONE'}
			/>

			<AssignReviewerModal
				open={!!selectedGroup}
				group={selectedGroup}
				initialValues={
					selectedGroup
						? getReviewersForGroup(selectedGroup.id, selectedGroup.phase ?? '')
						: []
				}
				onCancel={() => setSelectedGroup(null)}
				onAssign={() => setSelectedGroup(null)}
				onReloadSubmission={reloadSubmissionById}
				onSaveDraft={(selectedReviewers) => {
					if (!selectedGroup) return;
					const submission = filteredGroups.find(
						(g) => g.id === selectedGroup.id && g.phase === milestone,
					);
					if (!submission) return;
					const reviewerNames = selectedReviewers.map(
						(id) => mockLecturers.find((l) => l.id === id)?.fullName || id,
					);
					addDraftReviewerAssignment({
						submissionId: submission.id,
						thesisTitle: selectedGroup.title,
						groupName: selectedGroup.name,
						reviewerIds: selectedReviewers,
						reviewerNames,
					});
					setSelectedGroup(null);
				}}
			/>
		</Space>
	);
}
