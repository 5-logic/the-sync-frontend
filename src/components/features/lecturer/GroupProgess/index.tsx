'use client';

import { Alert, Space } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import GroupDetailCard from '@/components/features/lecturer/GroupProgess/GroupDetailCard';
import GroupSearchTable from '@/components/features/lecturer/GroupProgess/GroupSearchTable';
import MilestoneDetailCard from '@/components/features/lecturer/GroupProgess/MilestoneDetailCard';
import { useGroupProgress } from '@/hooks/lecturer/useGroupProgress';
import { useMilestones } from '@/hooks/lecturer/useMilestones';
import { useSupervisedGroups } from '@/hooks/lecturer/useSupervisedGroups';
import { SupervisedGroup } from '@/lib/services/groups.service';
import { Milestone } from '@/schemas/milestone';
import { useLecturerStore, useSemesterStore } from '@/store';

export default function GroupProgressPage() {
	const [selectedGroup, setSelectedGroup] = useState<
		SupervisedGroup | undefined
	>(undefined);
	const [searchText, setSearchText] = useState<string>('');

	// Initialize selectedSemester from sessionStorage
	const [selectedSemester, setSelectedSemester] = useState<string | null>(
		() => {
			if (typeof window !== 'undefined') {
				return sessionStorage.getItem('groupProgress_selectedSemester');
			}
			return null;
		},
	);

	// Store hooks for cached data similar to ThesisManagement
	const { fetchLecturers } = useLecturerStore();
	const { fetchSemesters } = useSemesterStore();

	// Supervised groups hook with enhanced caching
	const {
		groups,
		loading: groupsLoading,
		error: groupsError,
		fetchGroupsBySemester,
		clearGroups,
		isInitialLoad,
		isRefreshing,
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

	// Fetch cached data when component mounts (similar to ThesisManagement)
	useEffect(() => {
		fetchLecturers();
		fetchSemesters();
		fetchMilestones();
	}, [fetchLecturers, fetchSemesters, fetchMilestones]);

	// Auto-load data for persisted semester
	useEffect(() => {
		if (selectedSemester) {
			fetchGroupsBySemester(selectedSemester);
		}
	}, [selectedSemester, fetchGroupsBySemester]);

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

	// Memoized handlers to prevent unnecessary re-renders
	const handleGroupSelect = useCallback(
		(group: SupervisedGroup) => {
			setSelectedGroup(group);
			// Reset to first milestone when selecting a new group
			if (milestones.length > 0) {
				selectMilestone(milestones[0]);
			}
			fetchGroupDetail(group.id);
		},
		[milestones, selectMilestone, fetchGroupDetail],
	);

	const handleRefresh = useCallback(() => {
		if (selectedSemester) {
			fetchGroupsBySemester(selectedSemester, true); // Force refresh
		}
		fetchMilestones();
		if (selectedGroup) {
			fetchGroupDetail(selectedGroup.id);
		}
	}, [
		selectedSemester,
		fetchGroupsBySemester,
		fetchMilestones,
		selectedGroup,
		fetchGroupDetail,
	]);

	const handleMilestoneChange = useCallback(
		(milestone: Milestone) => {
			selectMilestone(milestone);
		},
		[selectMilestone],
	);

	const handleSearchChange = useCallback((value: string) => {
		setSearchText(value);
	}, []);

	const handleSemesterChange = useCallback((semesterId: string | null) => {
		setSelectedSemester(semesterId);
		// Persist to sessionStorage
		if (typeof window !== 'undefined') {
			if (semesterId) {
				sessionStorage.setItem('groupProgress_selectedSemester', semesterId);
			} else {
				sessionStorage.removeItem('groupProgress_selectedSemester');
			}
		}
	}, []);

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
						onSearchChange={handleSearchChange}
						selectedGroup={selectedGroup}
						onGroupSelect={handleGroupSelect}
						loading={groupsLoading}
						onRefresh={handleRefresh}
						selectedSemester={selectedSemester}
						onSemesterChange={handleSemesterChange}
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

						<Space direction="vertical" size="large" style={{ width: '100%' }}>
							{/* Group Details Section */}
							<GroupDetailCard
								group={selectedGroupDetail || selectedGroup}
								loading={detailLoading}
							/>

							{/* Milestone Progress Section */}
							<MilestoneDetailCard
								group={selectedGroupDetail || selectedGroup}
								milestone={selectedMilestone}
								milestones={milestones}
								onMilestoneChange={handleMilestoneChange}
								loading={detailLoading || milestonesLoading}
							/>
						</Space>
					</>
				)}
			</Space>
		</div>
	);
}
