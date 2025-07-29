'use client';

import { Alert, Space } from 'antd';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Header } from '@/components/common/Header';
import GroupDetailCard from '@/components/features/lecturer/GroupProgess/GroupDetailCard';
import GroupSearchTable from '@/components/features/lecturer/GroupProgess/GroupSearchTable';
import MilestoneDetailCard from '@/components/features/lecturer/GroupProgess/MilestoneDetailCard';
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
	const [milestoneChanging, setMilestoneChanging] = useState<boolean>(false);
	const currentUserIdRef = useRef<string | null>(null);

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
		if (
			currentUserIdRef.current !== null &&
			currentUserIdRef.current !== newUserId
		) {
			// Clear all cached data để tránh data leakage giữa users
			clearGroups();
			setSelectedGroup(undefined);
			setSelectedSemester(null);

			// Clear store cache nếu có
			refreshCache();
		}

		// Update current user ID
		currentUserIdRef.current = newUserId;
	}, [session?.user?.id, clearGroups, refreshCache]);

	// Smart fetch groups và milestones khi semester changes - fetch mỗi lần thay đổi
	useEffect(() => {
		// Chỉ fetch khi đã có user ID (đã login) để tránh fetch với wrong user context
		if (!currentUserIdRef.current) return;

		if (selectedSemester) {
			// Fetch groups và milestones cho semester mới
			fetchGroupsBySemester(selectedSemester);
			fetchMilestones(selectedSemester);
		} else {
			// Clear groups khi không có semester được chọn
			clearGroups();
		}
	}, [selectedSemester, fetchGroupsBySemester, clearGroups, fetchMilestones]);

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
		},
		[milestones, selectMilestone],
	);

	// Memoized refresh handler với smart logic và user context validation
	const handleRefresh = useCallback(() => {
		// Chỉ refresh nếu có user context để tránh fetch với wrong user
		if (!currentUserIdRef.current) {
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

		// Clear cache để đảm bảo data fresh
		refreshCache();
	}, [selectedSemester, fetchGroupsBySemester, fetchMilestones, refreshCache]);

	// Memoized milestone change handler
	const handleMilestoneChange = useCallback(
		(milestone: Milestone) => {
			setMilestoneChanging(true);
			selectMilestone(milestone);
			// Reset milestone changing state after a short delay
			setTimeout(() => setMilestoneChanging(false), 300);
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
					<Space direction="vertical" size="large" style={{ width: '100%' }}>
						{/* Group Details Section */}
						<GroupDetailCard
							group={selectedGroup}
							loading={false}
							milestones={milestones}
							milestonesLoading={milestonesLoading}
						/>

						{/* Milestone Progress Section */}
						<MilestoneDetailCard
							group={selectedGroup}
							milestone={selectedMilestone}
							milestones={milestones}
							onMilestoneChange={handleMilestoneChange}
							loading={milestonesLoading}
							milestoneLoading={milestoneChanging}
						/>
					</Space>
				)}
			</Space>
		</div>
	);
}
