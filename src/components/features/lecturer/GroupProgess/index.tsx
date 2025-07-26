'use client';

import { Alert, Col, Row, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import GroupSearchTable from '@/components/features/lecturer/GroupProgess/GroupSearchTable';
import MilestoneDetailCard from '@/components/features/lecturer/GroupProgess/MilestoneDetailCard';
import { useGroupProgress } from '@/hooks/lecturer/useGroupProgress';
import { useMilestones } from '@/hooks/lecturer/useMilestones';
import { useSupervisedGroups } from '@/hooks/lecturer/useSupervisedGroups';
import { SupervisedGroup } from '@/lib/services/groups.service';
import { Milestone } from '@/schemas/milestone';

export default function GroupProgressPage() {
	const [selectedGroup, setSelectedGroup] = useState<
		SupervisedGroup | undefined
	>(undefined);
	const [searchText, setSearchText] = useState<string>('');
	const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

	// Supervised groups hook for new API
	const {
		groups,
		loading: groupsLoading,
		error: groupsError,
		fetchGroupsBySemester,
		clearGroups,
	} = useSupervisedGroups();

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
			const englishName = group.thesis?.englishName?.toLowerCase() || '';

			return (
				name.includes(keyword) ||
				projectDirection.includes(keyword) ||
				code.includes(keyword) ||
				englishName.includes(keyword)
			);
		});
	}, [groups, searchText]);

	// Fetch groups when semester changes
	useEffect(() => {
		if (selectedSemester) {
			fetchGroupsBySemester(selectedSemester);
		} else {
			clearGroups();
		}
	}, [selectedSemester, fetchGroupsBySemester, clearGroups]);

	// Handle group selection
	function handleGroupSelect(group: SupervisedGroup) {
		setSelectedGroup(group);
		// Reset to first milestone when selecting a new group
		if (milestones.length > 0) {
			selectMilestone(milestones[0]);
		}
		fetchGroupDetail(group.id);
	}

	// Handle refresh
	function handleRefresh() {
		if (selectedSemester) {
			fetchGroupsBySemester(selectedSemester);
		}
		fetchMilestones();
		if (selectedGroup) {
			fetchGroupDetail(selectedGroup.id);
		}
	}

	// Handle milestone change
	function handleMilestoneChange(milestone: Milestone) {
		selectMilestone(milestone);
	}

	// Loading state - Show skeleton for initial load, spin for refreshes
	const isInitialLoad =
		groupsLoading && groups.length === 0 && !!selectedSemester;
	const isRefreshing = groupsLoading && groups.length > 0;

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

				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<GroupSearchTable
						data={filteredGroups}
						searchText={searchText}
						onSearchChange={setSearchText}
						selectedGroup={selectedGroup}
						onGroupSelect={handleGroupSelect}
						loading={groupsLoading}
						onRefresh={handleRefresh}
						selectedSemester={selectedSemester}
						onSemesterChange={setSelectedSemester}
						showSemesterFilter={true}
						isInitialLoad={isInitialLoad}
						isRefreshing={isRefreshing}
					/>
				</Space>

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

						<Row gutter={16} style={{ flex: 1 }}>
							<Col xs={24}>
								<MilestoneDetailCard
									group={selectedGroupDetail || selectedGroup}
									milestone={selectedMilestone}
									milestones={milestones}
									onMilestoneChange={handleMilestoneChange}
									loading={detailLoading || milestonesLoading}
								/>
							</Col>
						</Row>
					</>
				)}
			</Space>
		</div>
	);
}
