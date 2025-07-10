'use client';

import { Card, Divider, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import GroupSearchTable from '@/components/features/lecturer/GroupProgess/GroupSearchTable';
import ReviewChecklistTable from '@/components/features/lecturer/GroupReview/ReviewChecklistTable';
import ReviewHeader from '@/components/features/lecturer/GroupReview/ReviewHeader';
import { FullMockGroup, allMockGroups } from '@/data/group';

const { Text } = Typography;

export default function GroupReviewPage() {
	const [selectedGroup, setSelectedGroup] = useState<FullMockGroup>();
	const [searchText, setSearchText] = useState('');

	const availablePhases = [
		'Phase 1',
		'Phase 2',
		'Phase 3',
		'Phase 4',
		'Phase 5',
	];

	const phaseMap: Record<string, string> = {
		'Phase 1': 'Submit Thesis',
		'Phase 2': 'Review 1',
		'Phase 3': 'Review 2',
		'Phase 4': 'Review 3',
		'Phase 5': 'Final Report',
	};

	const [selectedPhase, setSelectedPhase] = useState(availablePhases[0]);

	// Filter group list based on search text
	const groupList = useMemo(() => {
		const uniqueGroups: Record<string, FullMockGroup> = {};
		allMockGroups.forEach((group) => {
			uniqueGroups[group.id] ??= group;
		});

		const keyword = searchText.toLowerCase();
		return Object.values(uniqueGroups).filter(
			(group) =>
				group.name.toLowerCase().includes(keyword) || //NOSONAR
				group.title.toLowerCase().includes(keyword),
		);
	}, [searchText]);

	const handleSelect = (group: FullMockGroup) => {
		setSelectedGroup(group);
	};

	const handlePhaseChange = (index: number) => {
		const newPhase = availablePhases[index];
		setSelectedPhase(newPhase);
	};

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Group Review"
				description="This section allows instructors to review each groups progress through
					different phases of their thesis development using a structured
					checklist for evaluation."
			/>

			<GroupSearchTable
				data={groupList}
				searchText={searchText}
				onSearchChange={setSearchText}
				selectedGroup={selectedGroup}
				onGroupSelect={handleSelect}
			/>

			{selectedGroup && (
				<Card
					title={`Group Name: ${selectedGroup.name} | ${selectedGroup.title}`}
				>
					<Text type="secondary">
						Supervised by: {selectedGroup.supervisors.join(', ')}
					</Text>

					<Divider style={{ margin: '16px 0' }} />

					<Space direction="vertical" size="large" style={{ width: '100%' }}>
						<ReviewHeader
							currentStep={availablePhases.indexOf(selectedPhase)}
							onStepChange={handlePhaseChange}
						/>

						<ReviewChecklistTable phase={phaseMap[selectedPhase]} />
					</Space>
				</Card>
			)}
		</Space>
	);
}
