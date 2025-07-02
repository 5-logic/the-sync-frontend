'use client';

import { Space } from 'antd';
import { useState } from 'react';

import AssignReviewer from '@/components/features/lecturer/AssignLecturerReview/AssignReviewer';
import GroupTable from '@/components/features/lecturer/AssignLecturerReview/GroupTable';
import SearchFilterBar from '@/components/features/lecturer/AssignLecturerReview/SearchFilterBar';
import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import mockGroups, { FullMockGroup, createFullMockGroup } from '@/data/group';

export default function AssignLecturerReview() {
	const [selectedGroup, setSelectedGroup] = useState<FullMockGroup | null>(
		null,
	);
	const [search, setSearch] = useState('');
	const [semester, setSemester] = useState('');
	const [milestone, setMilestone] = useState('Review 1');

	// ✅ Tạo danh sách nhóm theo semester, gán phase = milestone hiện tại
	const groupsInSemester: FullMockGroup[] = mockGroups
		.filter((g) => semester === '' || g.semesterId === semester)
		.map((g) => createFullMockGroup(g.id, milestone));

	// ✅ Search theo group name/code
	const filteredGroups = groupsInSemester.filter((group) => {
		const term = search.toLowerCase();
		return (
			group.name.toLowerCase().includes(term) ||
			group.code.toLowerCase().includes(term)
		);
	});

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

			<AssignReviewer
				group={selectedGroup}
				onClose={() => setSelectedGroup(null)}
			/>
		</Space>
	);
}
