'use client';

import { Alert, Space } from 'antd';
import { useSession } from 'next-auth/react';
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
	const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	// Get current user session to track user changes
	const { data: session } = useSession();

	// Store hooks for cached data
	const { fetchLecturers } = useLecturerStore();
	const { fetchSemesters } = useSemesterStore();

	// Supervised groups hook với smart caching
	const {
		groups,
		loading: groupsLoading,
		error: groupsError,
		fetchGroupsBySemester,
		clearGroups,
		refreshCache,
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

	// Fetch cached data khi component mount - chỉ fetch 1 lần
	useEffect(() => {
		fetchLecturers();
		fetchSemesters();
	}, [fetchLecturers, fetchSemesters]);

	// Detect user change và clear cache khi cần thiết
	useEffect(() => {
		const newUserId = session?.user?.id || null;

		// Nếu user thay đổi (bao gồm login/logout), clear tất cả cache
		if (currentUserId !== null && currentUserId !== newUserId) {
			// Clear all cached data để tránh data leakage giữa users
			clearGroups();
			setSelectedGroup(undefined);
			setSelectedSemester(null);

			// Clear store cache nếu có
			refreshCache();
		}

		// Update current user ID
		setCurrentUserId(newUserId);
	}, [session?.user?.id, currentUserId, clearGroups, refreshCache]);

	// Smart fetch groups và milestones khi semester changes - fetch mỗi lần thay đổi
	useEffect(() => {
		// Chỉ fetch khi đã có user ID (đã login) để tránh fetch với wrong user context
		if (!currentUserId) return;

		if (selectedSemester) {
			// Fetch groups và milestones cho semester mới
			fetchGroupsBySemester(selectedSemester);
			fetchMilestones(selectedSemester);
		} else {
			// Clear groups khi không có semester được chọn
			if (groups.length > 0) {
				clearGroups();
			}
		}
	}, [
		selectedSemester,
		currentUserId,
		fetchGroupsBySemester,
		clearGroups,
		fetchMilestones,
		groups.length,
	]);

	// Memoized filtered groups để tránh unnecessary re-computation
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

	// Memoized handlers để prevent unnecessary re-renders
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

	// Memoized refresh handler với smart logic và user context validation
	const handleRefresh = useCallback(() => {
		// Chỉ refresh nếu có user context để tránh fetch với wrong user
		if (!currentUserId) {
			console.warn('Cannot refresh without valid user context');
			return;
		}

		// Refresh data cho current semester
		if (selectedSemester) {
			fetchGroupsBySemester(selectedSemester);
			fetchMilestones(selectedSemester);
		} else {
			fetchMilestones(); // Fetch default milestones
		}
		if (selectedGroup) {
			fetchGroupDetail(selectedGroup.id);
		}

		// Clear cache để đảm bảo data fresh
		refreshCache();
	}, [
		currentUserId,
		selectedSemester,
		fetchGroupsBySemester,
		fetchMilestones,
		selectedGroup,
		fetchGroupDetail,
		refreshCache,
	]);

	// Memoized milestone change handler
	const handleMilestoneChange = useCallback(
		(milestone: Milestone) => {
			selectMilestone(milestone);
		},
		[selectMilestone],
	);

	// Memoized search change handler với debounce effect
	const handleSearchChange = useCallback((value: string) => {
		setSearchText(value);
	}, []);

	// Memoized semester change với state reset và cache check
	const handleSemesterChange = useCallback(
		(semesterId: string | null) => {
			// Chỉ thay đổi nếu semester thực sự khác để tránh reload không cần thiết
			if (semesterId !== selectedSemester) {
				setSelectedSemester(semesterId);
				// Clear selected group khi đổi semester để tránh stale data
				setSelectedGroup(undefined);
			}
		},
		[selectedSemester],
	);

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
								milestones={milestones}
								milestonesLoading={milestonesLoading}
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
