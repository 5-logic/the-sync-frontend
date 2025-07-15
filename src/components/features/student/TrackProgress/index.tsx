'use client';

import { useState } from 'react';

import ProgressOverviewCard from '@/components/features/lecturer/GroupProgess/ProgressOverviewCard';
import { FullMockGroup } from '@/data/group';

import MilestoneDetailCard from './MilestoneDetailCard';
import MilestoneStep from './MilestoneStep';

export default function ProjectProgressPage() {
	const [selectedGroup] = useState<FullMockGroup | undefined>(undefined);

	return (
		<div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
			<div className="lg:col-span-2">
				<MilestoneStep />
				<MilestoneDetailCard />
			</div>
			<div>
				{selectedGroup && <ProgressOverviewCard group={selectedGroup} />}
			</div>
		</div>
	);
}
