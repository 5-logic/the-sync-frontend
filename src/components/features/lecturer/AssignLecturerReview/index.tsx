'use client';

import { useState } from 'react';

import AssignReviewer from '@/components/features/lecturer/AssignLecturerReview/AssignReviewer';
import GroupTable from '@/components/features/lecturer/AssignLecturerReview/GroupTable';
import SearchFilterBar from '@/components/features/lecturer/AssignLecturerReview/SearchFilterBar';
import { FullMockGroup, allMockGroups } from '@/data/group';

export default function AssignLecturerReview() {
	const [selectedGroup, setSelectedGroup] = useState<FullMockGroup | null>(
		null,
	);

	return (
		<div className="p-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold">Assign Reviewer</h1>
				<p className="text-gray-500 text-sm">
					Review and assign reviewers to project groups for each milestone.
				</p>
			</div>

			<SearchFilterBar />

			<GroupTable
				groups={allMockGroups}
				onAssign={(group) => setSelectedGroup(group)}
			/>

			<AssignReviewer
				group={selectedGroup}
				onClose={() => setSelectedGroup(null)}
			/>
		</div>
	);
}
