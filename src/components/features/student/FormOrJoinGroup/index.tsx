'use client';

import { Card, Col, Row, Space, Typography } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import CreateGroupForm from '@/components/features/student/FormOrJoinGroup/CreateGroupForm';
import FormOrJoinTabs from '@/components/features/student/FormOrJoinGroup/FormOrJoinTabs';
import GroupListSection from '@/components/features/student/FormOrJoinGroup/GroupListSection';
import InviteRequestButton from '@/components/features/student/FormOrJoinGroup/InviteRequestButton';
import JoinGroupForm from '@/components/features/student/FormOrJoinGroup/JoinGroupForm';
import { type ExtendedGroup, extendedGroups } from '@/data/group';
import { mockTheses } from '@/data/thesis';
import { type Group } from '@/lib/services/groups.service';
import { Thesis } from '@/schemas/thesis';
import { useGroupsStore } from '@/store/useGroupsStore';

const { Title, Paragraph } = Typography;

const SUGGESTED_GROUPS_COUNT = 3;
const TAB_KEYS = {
	JOIN: 'join',
	CREATE: 'create',
} as const;

const CARD_STYLES = {
	borderRadius: 8,
} as const;

interface GroupUI {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly domain: string;
	readonly members: number;
}

// Helper function to map API groups to UI format (for All Available Groups)
const mapApiGroupsToUI = (apiGroups: Group[]): GroupUI[] =>
	apiGroups.map((group) => ({
		id: group.id,
		name: group.name,
		description: group.projectDirection || 'No description available',
		domain: group.projectDirection || 'General',
		members: 0, // Will be updated when we have member data from API
	}));

// Helper function to map mock data (for Suggested Groups by AI)
const mapMockGroupsToUI = (
	groups: readonly ExtendedGroup[],
	theses: readonly Thesis[],
): GroupUI[] =>
	groups.map((group) => {
		const thesis = theses.find((t) => t.id === group.thesisId);
		return {
			id: group.id,
			name: thesis?.englishName ?? group.thesisTitle ?? group.name,
			description: thesis?.description ?? '',
			domain: thesis?.domain ?? 'Unknown',
			members: group.members ?? 0,
		};
	});

export default function FormOrJoinGroup() {
	const searchParams = useSearchParams();
	const { groups: apiGroups, loading, error, fetchGroups } = useGroupsStore();
	const [tabKey, setTabKey] = useState<string>(TAB_KEYS.JOIN);
	const [search, setSearch] = useState<string>('');
	const [category, setCategory] = useState<string | undefined>(undefined);

	// Suggested Groups (using mock data for AI suggestions)
	const suggestedGroups = useMemo(() => {
		const mockGroups = mapMockGroupsToUI(extendedGroups, mockTheses);
		return mockGroups.slice(0, SUGGESTED_GROUPS_COUNT);
	}, []);

	// All Available Groups (using API data)
	const allApiGroups = useMemo(() => mapApiGroupsToUI(apiGroups), [apiGroups]);

	// Fetch groups on component mount
	useEffect(() => {
		fetchGroups();
	}, [fetchGroups]);

	useEffect(() => {
		const tab = searchParams.get('tab');
		if (tab === TAB_KEYS.CREATE) {
			setTabKey(TAB_KEYS.CREATE);
		}
	}, [searchParams]);

	const filteredApiGroups = useMemo(() => {
		if (!search && !category) {
			return allApiGroups;
		}

		const searchLower = search.toLowerCase();
		return allApiGroups.filter((group) => {
			const matchesSearch =
				!search ||
				group.name.toLowerCase().includes(searchLower) ||
				group.description.toLowerCase().includes(searchLower);
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

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			{/* Header Section */}
			<Row align="middle" justify="space-between" wrap>
				<Col xs={24} sm={18} md={18} lg={20}>
					<Space direction="vertical" size="small">
						<Title level={2} style={{ marginBottom: 0 }}>
							Form or Join a Group
						</Title>
						<Paragraph type="secondary" style={{ marginBottom: 0 }}>
							Find a group that matches your interests or create a new one to
							collaborate with others.
						</Paragraph>
					</Space>
				</Col>
				<Col xs={24} sm={6} md={6} lg={4}>
					<InviteRequestButton />
				</Col>
			</Row>

			<Card style={CARD_STYLES}>
				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					<FormOrJoinTabs tabKey={tabKey} setTabKey={setTabKey} />

					{tabKey === TAB_KEYS.JOIN && (
						<>
							<JoinGroupForm />
							{/* Suggested Groups always shows mock data */}
							<GroupListSection
								title="Suggested Groups by AI"
								groups={suggestedGroups}
								enablePagination={false}
							/>
							{/* All Available Groups uses API data with loading/error states */}
							{loading ? (
								<div>Loading groups...</div>
							) : error ? (
								<div>Error loading groups: {error}</div>
							) : (
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
								/>
							)}
						</>
					)}

					{tabKey === TAB_KEYS.CREATE && <CreateGroupForm />}
				</Space>
			</Card>
		</Space>
	);
}
