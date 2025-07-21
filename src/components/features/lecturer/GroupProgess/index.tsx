'use client';

import { Alert, Card, Col, Row, Space, Steps, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import { PageLoading } from '@/components/common/loading';
import GroupSearchTable from '@/components/features/lecturer/GroupProgess/GroupSearchTable';
import MilestoneDetailCard from '@/components/features/lecturer/GroupProgess/MilestoneDetailCard';
import ProgressOverviewCard from '@/components/features/lecturer/GroupProgess/ProgressOverviewCard';
import { useGroupProgress } from '@/hooks/lecturer/useGroupProgress';
import { useMilestones } from '@/hooks/lecturer/useMilestones';
import { Group } from '@/lib/services/groups.service';
import { Milestone } from '@/schemas/milestone';
import { useGroupsStore } from '@/store/useGroupsStore';

const { Text } = Typography;
const { Step } = Steps;

export default function GroupProgressPage() {
	const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
		undefined,
	);
	const [searchText, setSearchText] = useState<string>('');

	// Groups store for listing
	const {
		groups,
		loading: groupsLoading,
		error: groupsError,
		fetchGroups,
	} = useGroupsStore();

	// Group progress hook for detail
	const {
		selectedGroupDetail,
		loading: detailLoading,
		error: detailError,
		fetchGroupDetail,
		clearSelectedGroup,
	} = useGroupProgress();

	// Milestones hook for steps
	const {
		milestones,
		selectedMilestone,
		loading: milestonesLoading,
		error: milestonesError,
		fetchMilestones,
		selectMilestone,
	} = useMilestones();

	// Filter groups based on search
	const filteredGroups = useMemo(() => {
		if (!searchText.trim()) return groups;

		const keyword = searchText.toLowerCase();
		return groups.filter((group) => {
			const name = group.name?.toLowerCase() || '';
			const projectDirection = group.projectDirection?.toLowerCase() || '';
			const code = group.code?.toLowerCase() || '';

			return (
				name.includes(keyword) ||
				projectDirection.includes(keyword) ||
				code.includes(keyword)
			);
		});
	}, [groups, searchText]);

	// Fetch groups on mount
	useEffect(() => {
		fetchGroups();
	}, [fetchGroups]);

	// Handle group selection
	function handleGroupSelect(group: Group) {
		setSelectedGroup(group);
		// Reset to first milestone when selecting a new group
		if (milestones.length > 0) {
			selectMilestone(milestones[0]);
		}
		fetchGroupDetail(group.id);
	}

	// Handle refresh
	function handleRefresh() {
		fetchGroups(true);
		fetchMilestones();
		if (selectedGroup) {
			fetchGroupDetail(selectedGroup.id);
		}
	}

	// Handle milestone change
	function handleMilestoneChange(milestone: Milestone) {
		selectMilestone(milestone);
	}

	// Loading state
	if (groupsLoading && groups.length === 0) {
		return <PageLoading tip="Loading groups..." />;
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
					description="Monitor group progress and track important milestones to evaluate group performance."
				/>

				{groupsError && (
					<Alert
						message="Error Loading Groups"
						description={groupsError}
						type="error"
						showIcon
						closable
					/>
				)}

				{milestonesError && (
					<Alert
						message="Error Loading Milestones"
						description={milestonesError}
						type="error"
						showIcon
						closable
					/>
				)}

				<GroupSearchTable
					data={filteredGroups}
					searchText={searchText}
					onSearchChange={setSearchText}
					selectedGroup={selectedGroup}
					onGroupSelect={handleGroupSelect}
					loading={groupsLoading}
					onRefresh={handleRefresh}
				/>

				{selectedGroup && (
					<>
						{detailError && (
							<Alert
								message="Error Loading Group Detail"
								description={detailError}
								type="error"
								showIcon
								closable
								onClose={clearSelectedGroup}
							/>
						)}

						<Card
							loading={detailLoading || milestonesLoading}
							title={
								selectedGroupDetail
									? `Group Name: ${selectedGroupDetail.name} | ${selectedGroupDetail.thesis?.vietnameseName || selectedGroupDetail.thesis?.englishName || 'No Thesis'}`
									: `Group Name: ${selectedGroup.name} | Loading...`
							}
						>
							{selectedGroupDetail && (
								<Text type="secondary">
									Supervised by:{' '}
									{selectedGroupDetail.supervisors.length > 0
										? selectedGroupDetail.supervisors.join(', ')
										: 'No supervisors assigned'}
								</Text>
							)}

							<Steps
								current={milestones.findIndex(
									(m) => m.id === selectedMilestone?.id,
								)}
								style={{ marginTop: 16 }}
							>
								{milestones.map((milestone) => (
									<Step
										key={milestone.id}
										title={milestone.name}
										onClick={() => handleMilestoneChange(milestone)}
										style={{ cursor: 'pointer' }}
									/>
								))}
							</Steps>
						</Card>

						<Row gutter={16} style={{ flex: 1 }}>
							<Col xs={24} md={16}>
								<MilestoneDetailCard
									group={selectedGroupDetail || selectedGroup}
									milestone={selectedMilestone}
								/>
							</Col>
							<Col xs={24} md={8}>
								<ProgressOverviewCard />
							</Col>
						</Row>
					</>
				)}
			</Space>
		</div>
	);
}
