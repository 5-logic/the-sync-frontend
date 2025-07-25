'use client';

import { Card, Col, Row, Space, Steps, Typography } from 'antd';
import { useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import ProgressOverviewCard from '@/components/common/ProgressOverview/ProgressOverviewCard';
import GroupSearchTable from '@/components/features/lecturer/GroupProgess/GroupSearchTable';
import MilestoneDetailCard from '@/components/features/lecturer/GroupProgess/MilestoneDetailCard';
import { FullMockGroup, allMockGroups, mockReviewGroups } from '@/data/group';

const { Text } = Typography;
const { Step } = Steps;

export default function GroupProgressPage() {
	const [selectedGroup, setSelectedGroup] = useState<FullMockGroup | undefined>(
		undefined,
	);
	const [selectedPhase, setSelectedPhase] = useState<string>('Review 1');
	const [searchText, setSearchText] = useState<string>('');

	const availablePhases = Object.keys(mockReviewGroups);

	const groupList = useMemo(() => {
		const uniqueGroups: Record<string, FullMockGroup> = {};
		allMockGroups.forEach((group) => {
			uniqueGroups[group.id] ??= group;
		});

		return Object.values(uniqueGroups).filter((group) => {
			const keyword = (searchText ?? '').toLowerCase();
			const name = group.name ?? '';
			const title = group.title ?? '';

			const nameMatch = name.toLowerCase().includes(keyword);
			const titleMatch = title.toLowerCase().includes(keyword);
			return nameMatch || titleMatch;
		});
	}, [searchText]);

	function handleSelect(group: FullMockGroup) {
		setSelectedGroup(group);
		setSelectedPhase(availablePhases[0]);
	}

	return (
		<div
			style={{
				padding: '0 8px 16px 0',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Space
				direction="vertical"
				size="large"
				style={{ width: '100%', flex: 1 }}
			>
				<Header
					title="Group Progress"
					description="The instructor monitors the groups progress, closely following important milestones to evaluate the group's performance."
				/>

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

							<Steps
								current={availablePhases.indexOf(selectedPhase)}
								style={{ marginTop: 16 }}
							>
								{availablePhases.map((phase) => (
									<Step
										key={phase}
										title={phase}
										onClick={() => {
											const match = mockReviewGroups[phase].find(
												(g) => g.id === selectedGroup.id,
											);
											if (match) {
												setSelectedGroup(match);
												setSelectedPhase(phase);
											}
										}}
									/>
								))}
							</Steps>
						</Card>

						<Row gutter={16} style={{ flex: 1 }}>
							<Col xs={24} md={16}>
								<MilestoneDetailCard
									group={selectedGroup}
									phase={selectedPhase}
								/>
							</Col>
							<Col xs={24} md={8}>
								{/* Không cần truyền group nữa */}
								<ProgressOverviewCard />
							</Col>
						</Row>
					</>
				)}
			</Space>
		</div>
	);
}
