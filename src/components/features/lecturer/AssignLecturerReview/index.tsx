'use client';

import { Space } from 'antd';
import { useState } from 'react';

import AssignReviewer from '@/components/features/lecturer/AssignLecturerReview/AssignReviewer';
import GroupTable from '@/components/features/lecturer/AssignLecturerReview/GroupTable';
import SearchFilterBar from '@/components/features/lecturer/AssignLecturerReview/SearchFilterBar';
import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import { FullMockGroup, allMockGroups } from '@/data/group';

export default function AssignLecturerReview() {
	const [selectedGroup, setSelectedGroup] = useState<FullMockGroup | null>(
		null,
	);

	const [search, setSearch] = useState('');
	const [semester, setSemester] = useState('20251');
	const [milestone, setMilestone] = useState('Review 1');

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
				groups={allMockGroups}
				onAssign={(group) => setSelectedGroup(group)}
			/>

			<AssignReviewer
				group={selectedGroup}
				onClose={() => setSelectedGroup(null)}
			/>
		</Space>
	);
}
