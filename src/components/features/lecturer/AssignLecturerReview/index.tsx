'use client';

import { useState } from 'react';

import { FullMockGroup, allMockGroups } from '@/data/group';

import AssignReviewerDrawer from './AssignReviewerDetail';
import GroupTable from './GroupTable';
import SearchFilterBar from './SearchFilterBar';

export default function AssignReviewerPage() {
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

			<AssignReviewerDrawer
				group={selectedGroup}
				onClose={() => setSelectedGroup(null)}
			/>
		</div>
	);
}
