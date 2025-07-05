'use client';

import { Space } from 'antd';
import { useState } from 'react';

import AssignReviewerModal from '@/components/features/lecturer/AssignLecturerReview/AssignReviewerModal';
import GroupTable from '@/components/features/lecturer/AssignLecturerReview/GroupTable';
import SearchFilterBar from '@/components/features/lecturer/AssignLecturerReview/SearchFilterBar';
import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import mockGroups, { FullMockGroup, createFullMockGroup } from '@/data/group';
import { mockLecturers } from '@/data/lecturers';
import { mockReviews } from '@/data/review';
import { mockSubmissions } from '@/data/submission';

export default function AssignLecturerReview() {
	const [selectedGroup, setSelectedGroup] = useState<FullMockGroup | null>(
		null,
	);
	const [search, setSearch] = useState('');
	const [semester, setSemester] = useState('');
	const [milestone, setMilestone] = useState('Review 1');

	// Tạo danh sách nhóm theo semester, gán phase = milestone hiện tại
	const groupsInSemester: FullMockGroup[] = mockGroups
		.filter((g) => semester === '' || g.semesterId === semester)
		.map((g) => createFullMockGroup(g.id, milestone));

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
		const submission = mockSubmissions.find(
			(s) => s.groupId === groupId && s.milestone === milestone,
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
			/>

			<GroupTable
				groups={filteredGroups}
				onAssign={(group) => setSelectedGroup(group)}
			/>

			<AssignReviewerModal
				open={!!selectedGroup}
				group={selectedGroup}
				initialValues={
					selectedGroup
						? getReviewersForGroup(selectedGroup.id, selectedGroup.phase ?? '')
						: []
				}
				lecturerOptions={mockLecturers.map((l) => l.fullName)}
				onCancel={() => setSelectedGroup(null)}
				onSubmit={(selectedReviewers) => {
					// handle update reviewer logic
					console.log('Assigned reviewers:', selectedReviewers);
					setSelectedGroup(null);
				}}
			/>
		</Space>
	);
}
