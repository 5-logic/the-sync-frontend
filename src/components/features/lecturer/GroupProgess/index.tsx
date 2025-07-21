'use client';

import { Alert, Card, Col, Row, Space, Steps, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import { PageLoading } from '@/components/common/loading';
import GroupSearchTable from '@/components/features/lecturer/GroupProgess/GroupSearchTable';
import MilestoneDetailCard from '@/components/features/lecturer/GroupProgess/MilestoneDetailCard';
import ProgressOverviewCard from '@/components/features/lecturer/GroupProgess/ProgressOverviewCard';
import { useGroupProgress } from '@/hooks/lecturer/useGroupProgress';
import { Group } from '@/lib/services/groups.service';
import { useGroupsStore } from '@/store/useGroupsStore';

const { Text } = Typography;
const { Step } = Steps;

// Mock phases for now - can be moved to API later
const AVAILABLE_PHASES = ['Review 1', 'Review 2', 'Review 3', 'Final Review'];

export default function GroupProgressPage() {
	const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
		undefined,
	);
	const [selectedPhase, setSelectedPhase] = useState<string>(
		AVAILABLE_PHASES[0],
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
		setSelectedPhase(AVAILABLE_PHASES[0]);
		fetchGroupDetail(group.id);
	}

	// Handle refresh
	function handleRefresh() {
		fetchGroups(true);
		if (selectedGroup) {
			fetchGroupDetail(selectedGroup.id);
		}
	}

	// Handle phase change
	function handlePhaseChange(phase: string) {
		setSelectedPhase(phase);
		// TODO: In the future, fetch phase-specific data here
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
							loading={detailLoading}
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
								current={AVAILABLE_PHASES.indexOf(selectedPhase)}
								style={{ marginTop: 16 }}
							>
								{AVAILABLE_PHASES.map((phase) => (
									<Step
										key={phase}
										title={phase}
										onClick={() => handlePhaseChange(phase)}
										style={{ cursor: 'pointer' }}
									/>
								))}
							</Steps>
						</Card>

						<Row gutter={16} style={{ flex: 1 }}>
							<Col xs={24} md={16}>
								<MilestoneDetailCard
									group={selectedGroupDetail || selectedGroup}
									phase={selectedPhase}
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
