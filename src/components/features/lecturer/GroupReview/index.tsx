'use client';

import { Card, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';

import GroupSearchTable from '@/components/features/lecturer/GroupProgess/GroupSearchTable';
import ReviewChecklistTable from '@/components/features/lecturer/GroupReview/ReviewChecklistTable';
import ReviewHeader from '@/components/features/lecturer/GroupReview/ReviewHeader';
import { FullMockGroup, allMockGroups } from '@/data/group';

const { Title, Text } = Typography;

export default function GroupReviewPage() {
	const [selectedGroup, setSelectedGroup] = useState<FullMockGroup | undefined>(
		undefined,
	);
	const [searchText, setSearchText] = useState<string>('');

	// ✅ Cập nhật đủ 5 giai đoạn
	const availablePhases = [
		'Phase 1',
		'Phase 2',
		'Phase 3',
		'Phase 4',
		'Phase 5',
	];
	const [selectedPhase, setSelectedPhase] = useState<string>(
		availablePhases[0],
	);

	// ✅ Map Phase hiển thị sang tên thực
	const phaseMap: Record<string, string> = {
		'Phase 1': 'Submit Thesis',
		'Phase 2': 'Review 1',
		'Phase 3': 'Review 2',
		'Phase 4': 'Review 3',
		'Phase 5': 'Final Report',
	};

	// ✅ Mô phỏng danh sách nhóm ở mỗi phase
	const mockReviewGroups: Record<string, FullMockGroup[]> = {
		'Phase 1': allMockGroups,
		'Phase 2': allMockGroups,
		'Phase 3': allMockGroups,
		'Phase 4': allMockGroups,
		'Phase 5': allMockGroups,
	};

	const groupList = useMemo(() => {
		const uniqueGroups: Record<string, FullMockGroup> = {};
		allMockGroups.forEach((group) => {
			uniqueGroups[group.id] ??= group;
		});

		return Object.values(uniqueGroups).filter((group) => {
			const keyword = searchText.toLowerCase();
			const name = group.name ?? '';
			const title = group.title ?? '';
			return (
				name.toLowerCase().includes(keyword) ||
				title.toLowerCase().includes(keyword)
			);
		});
	}, [searchText]);

	function handleSelect(group: FullMockGroup) {
		setSelectedGroup(group);
	}

	return (
		<div className="p-6 space-y-6">
			<Title level={2}>Group Review</Title>

			<GroupSearchTable
				data={groupList}
				searchText={searchText}
				onSearchChange={setSearchText}
				selectedGroup={selectedGroup}
				onGroupSelect={handleSelect}
			/>

			{selectedGroup && (
				<>
					<Card
						title={`Group Name: ${selectedGroup.name} | ${selectedGroup.title}`}
					>
						<Text type="secondary">
							Supervised by: {selectedGroup.supervisors.join(', ')}
						</Text>
					</Card>

					<Space direction="vertical" size="large" style={{ width: '100%' }}>
						<ReviewHeader
							currentStep={availablePhases.indexOf(selectedPhase)}
							onStepChange={(index) => {
								const phase = availablePhases[index];
								setSelectedPhase(phase);

								const match = mockReviewGroups[phase]?.find(
									(g) => g.id === selectedGroup.id,
								);
								if (match) {
									setSelectedGroup(match);
								}
							}}
						/>

						{/* ✅ Truyền đúng phase tương ứng checklist */}
						<ReviewChecklistTable phase={phaseMap[selectedPhase]} />
					</Space>
				</>
			)}
		</div>
	);
}
