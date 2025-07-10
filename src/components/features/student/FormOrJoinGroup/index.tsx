'use client';

import { Alert, Card, Col, Row, Space } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import CreateGroupForm from '@/components/features/student/FormOrJoinGroup/CreateGroupForm';
import FormOrJoinTabs from '@/components/features/student/FormOrJoinGroup/FormOrJoinTabs';
import GroupListSection from '@/components/features/student/FormOrJoinGroup/GroupListSection';
import InviteRequestButton from '@/components/features/student/FormOrJoinGroup/InviteRequestButton';
import JoinGroupForm from '@/components/features/student/FormOrJoinGroup/JoinGroupForm';
import { type ExtendedGroup, extendedGroups } from '@/data/group';
import { mockTheses } from '@/data/thesis';
import { Thesis } from '@/schemas/thesis';

const SUGGESTED_GROUPS_COUNT = 3;
const TAB_KEYS = {
	JOIN: 'join',
	CREATE: 'create',
} as const;

const ALERT_STYLES = {
	borderRadius: 8,
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

const mapGroups = (
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

const allGroups: readonly GroupUI[] = mapGroups(extendedGroups, mockTheses);
const suggestedGroups: readonly GroupUI[] = allGroups.slice(
	0,
	SUGGESTED_GROUPS_COUNT,
);

export default function FormOrJoinGroup() {
	const searchParams = useSearchParams();
	const [tabKey, setTabKey] = useState<string>(TAB_KEYS.JOIN);
	const [search, setSearch] = useState<string>('');
	const [category, setCategory] = useState<string | undefined>(undefined);

	useEffect(() => {
		const tab = searchParams.get('tab');
		if (tab === TAB_KEYS.CREATE) {
			setTabKey(TAB_KEYS.CREATE);
		}
	}, [searchParams]);

	const filteredGroups = useMemo(() => {
		if (!search && !category) {
			return [...allGroups];
		}

		const searchLower = search.toLowerCase();
		return allGroups.filter((group) => {
			const matchesSearch =
				!search ||
				group.name.toLowerCase().includes(searchLower) ||
				group.description.toLowerCase().includes(searchLower);
			const matchesCategory = !category || group.domain === category;
			return matchesSearch && matchesCategory;
		});
	}, [search, category]);

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
					<Header
						title="Form or Join a Group"
						description="Find a group that matches your interests or create a new one to
							collaborate with others."
					/>
				</Col>
				<Col xs={24} sm={6} md={6} lg={4}>
					<InviteRequestButton />
				</Col>
			</Row>

			<Alert
				message="You are already part of a group. Visit Group Dashboard to view details."
				type="info"
				showIcon
				style={ALERT_STYLES}
			/>

			<Card style={CARD_STYLES}>
				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					<FormOrJoinTabs tabKey={tabKey} setTabKey={setTabKey} />

					{tabKey === TAB_KEYS.JOIN && (
						<>
							<JoinGroupForm />
							<GroupListSection
								title="Suggested Groups by AI"
								groups={[...suggestedGroups]} // Create mutable copy
								enablePagination={false}
							/>
							<GroupListSection
								title="All Available Groups"
								groups={filteredGroups}
								showFilter
								search={search}
								onSearchChange={handleSearchChange}
								category={category}
								onCategoryChange={handleCategoryChange}
								pageSize={6}
								enablePagination={true}
							/>
						</>
					)}

					{tabKey === TAB_KEYS.CREATE && <CreateGroupForm />}
				</Space>
			</Card>
		</Space>
	);
}
