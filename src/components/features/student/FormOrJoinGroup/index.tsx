'use client';

import { Card, Col, Row, Space } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import { RequestsButton } from '@/components/common/RequestsManagement';
import AISuggestions from '@/components/features/student/FormOrJoinGroup/JoinGroup/AISuggestions';
import GroupListSection from '@/components/features/student/FormOrJoinGroup/JoinGroup/GroupBrowsing/GroupListSection';
import JoinGroupForm from '@/components/features/student/FormOrJoinGroup/JoinGroup/JoinGroupForm';
import { type SuggestGroupsData } from '@/lib/services/ai.service';
import { type Group } from '@/lib/services/groups.service';
import { useRequestsStore } from '@/store';
import { useGroupsStore } from '@/store/useGroupsStore';

const CARD_STYLES = {
	borderRadius: 8,
} as const;

interface GroupUI {
	readonly id: string;
	readonly name: string;
	readonly leader: string; // Changed from description to leader
	readonly domain: string;
	readonly members: number;
}

// Helper function to map API groups to UI format (for All Available Groups)
const mapApiGroupsToUI = (apiGroups: Group[]): GroupUI[] =>
	apiGroups.map((group) => ({
		id: group.id,
		name: group.name,
		leader: group.leader?.student?.user?.fullName || 'No leader assigned', // Map leader name
		domain: group.projectDirection || 'General',
		members: group.memberCount || 0, // Use memberCount from API
	}));

export default function FormOrJoinGroup() {
	const { groups: apiGroups, loading, error, fetchGroups } = useGroupsStore();
	const { requests, fetchStudentRequests } = useRequestsStore();
	// Remove tab functionality - always show Join Group
	// const [tabKey, setTabKey] = useState<string>(TAB_KEYS.JOIN);
	const [search, setSearch] = useState<string>('');
	const [category, setCategory] = useState<string | undefined>(undefined);
	const [aiSuggestions, setAiSuggestions] = useState<SuggestGroupsData | null>(
		null,
	);
	const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);

	// All Available Groups (using API data)
	const allApiGroups = useMemo(() => mapApiGroupsToUI(apiGroups), [apiGroups]);

	// Fetch groups and requests on component mount
	useEffect(() => {
		fetchGroups();
		// Also fetch requests to make sure badge is up to date
		fetchStudentRequests(true);
	}, [fetchGroups, fetchStudentRequests]);

	// Remove tab switching logic - no longer needed
	// useEffect(() => {
	// 	const tab = searchParams.get('tab');
	// 	if (tab === TAB_KEYS.CREATE) {
	// 		setTabKey(TAB_KEYS.CREATE);
	// 	}
	// }, [searchParams]);

	const filteredApiGroups = useMemo(() => {
		if (!search && !category) {
			return allApiGroups;
		}

		const searchLower = search.toLowerCase();
		return allApiGroups.filter((group) => {
			const matchesSearch =
				!search ||
				group.name.toLowerCase().includes(searchLower) ||
				group.leader.toLowerCase().includes(searchLower);
			const matchesCategory = !category || group.domain === category;
			return matchesSearch && matchesCategory;
		});
	}, [search, category, allApiGroups]);

	const handleSearchChange = useCallback((newSearch: string) => {
		setSearch(newSearch);
	}, []);

	const handleCategoryChange = useCallback(
		(newCategory: string | undefined) => {
			setCategory(newCategory);
		},
		[],
	);

	// Callback to refresh requests when a join request is sent
	const handleRequestSent = useCallback(() => {
		fetchStudentRequests(true); // Force refresh
	}, [fetchStudentRequests]);

	// Handle AI suggestions received
	const handleAISuggestionsReceived = useCallback((data: SuggestGroupsData) => {
		setAiSuggestions(data);
		setAiSuggestionsLoading(false);
	}, []);

	// Helper function to render All Available Groups section
	const renderAllAvailableGroups = () => {
		return (
			<GroupListSection
				title="All Available Groups"
				groups={filteredApiGroups}
				showFilter
				search={search}
				onSearchChange={handleSearchChange}
				category={category}
				onCategoryChange={handleCategoryChange}
				pageSize={6}
				enablePagination={true}
				onRequestSent={handleRequestSent}
				existingRequests={requests}
				loading={loading}
				error={error}
				onRefresh={() => {
					// Force refresh groups data
					fetchGroups();
				}}
			/>
		);
	};

	// Configuration for shared RequestsButton (student mode)
	const requestsConfig = {
		mode: 'student' as const,
		title: 'My Requests',
		fetchRequests: fetchStudentRequests,
	};

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			{/* Header Section */}
			<Row align="middle" justify="space-between" wrap gutter={[0, 16]}>
				<Col xs={24} sm={18} md={18} lg={20}>
					<Header
						title="Join a Group"
						description="Find a group that matches your interests and collaborate with others."
					/>
				</Col>
				<Col xs={24} sm={6} md={6} lg={4}>
					<div
						style={{
							textAlign: 'right',
							display: 'flex',
							justifyContent: 'flex-end',
							alignItems: 'center',
							height: '100%',
						}}
						className="flex justify-end sm:justify-end xs:justify-center xs:mt-2"
					>
						<RequestsButton config={requestsConfig} requests={requests}>
							My Requests
						</RequestsButton>
					</div>
				</Col>
			</Row>

			<Card style={CARD_STYLES}>
				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					{/* Remove tabs - always show Join Group content */}
					<JoinGroupForm onSuggestionsReceived={handleAISuggestionsReceived} />
					{/* AI Suggestions */}
					<AISuggestions
						suggestions={aiSuggestions}
						loading={aiSuggestionsLoading}
						onRequestSent={handleRequestSent}
						existingRequests={requests}
					/>
					{/* All Available Groups uses API data with loading/error states */}
					{renderAllAvailableGroups()}
				</Space>
			</Card>
		</Space>
	);
}
