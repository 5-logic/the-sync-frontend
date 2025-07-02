'use client';

import { Alert, Card, Col, Row, Space, Typography } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import CreateGroupForm from '@/components/features/student/FormOrJoinGroup/CreateGroupForm';
import FormOrJoinTabs from '@/components/features/student/FormOrJoinGroup/FormOrJoinTabs';
import GroupListSection from '@/components/features/student/FormOrJoinGroup/GroupListSection';
import InviteRequestButton from '@/components/features/student/FormOrJoinGroup/InviteRequestButton';
import JoinGroupForm from '@/components/features/student/FormOrJoinGroup/JoinGroupForm';
import mockGroups from '@/data/group';
import { mockTheses } from '@/data/thesis';
import { Group } from '@/schemas/group';
import { Thesis } from '@/schemas/thesis';

const { Title, Paragraph } = Typography;

// Constants
const SUGGESTED_GROUPS_COUNT = 3;
const MAX_RANDOM_MEMBERS = 5;

// Types
type GroupUI = {
	id: string;
	name: string;
	description: string;
	domain: string;
	members: number;
};

// Helper functions
const mapGroups = (groups: Group[], theses: Thesis[]): GroupUI[] =>
	groups.map((group) => {
		const thesis = theses.find((t) => t.id === group.thesisId);
		return {
			id: group.id,
			name: thesis?.englishName || group.name,
			description: thesis?.description || '',
			domain: thesis?.domain || 'Unknown',
			members: Math.floor(Math.random() * MAX_RANDOM_MEMBERS) + 1,
		};
	});

// Data preparation
const allGroups: GroupUI[] = mapGroups(mockGroups, mockTheses);
const suggestedGroups: GroupUI[] = allGroups.slice(0, SUGGESTED_GROUPS_COUNT);

export default function FormOrJoinGroup() {
	const searchParams = useSearchParams();
	const [tabKey, setTabKey] = useState<string>('join');
	const [search, setSearch] = useState<string>('');
	const [category, setCategory] = useState<string | undefined>(undefined);

	// Initialize tab from URL params
	useEffect(() => {
		const tab = searchParams.get('tab');
		if (tab === 'create') {
			setTabKey('create');
		}
	}, [searchParams]);

	// Memoized filtered groups for performance
	const filteredGroups = useMemo(() => {
		if (!search && !category) return allGroups;

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

	// Event handlers
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

			{/* Alert Section */}
			<Alert
				message="You are already part of a group. Visit Group Dashboard to view details."
				type="info"
				showIcon
				style={{
					borderRadius: 8,
				}}
			/>

			{/* Main Content */}
			<Card style={{ borderRadius: 8 }}>
				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					<FormOrJoinTabs tabKey={tabKey} setTabKey={setTabKey} />

					{tabKey === 'join' && (
						<>
							<JoinGroupForm />
							<GroupListSection
								title="Suggested Groups by AI"
								groups={suggestedGroups}
							/>
							<GroupListSection
								title="All Available Groups"
								groups={filteredGroups}
								showFilter
								search={search}
								onSearchChange={handleSearchChange}
								category={category}
								onCategoryChange={handleCategoryChange}
							/>
						</>
					)}

					{tabKey === 'create' && <CreateGroupForm />}
				</Space>
			</Card>
		</Space>
	);
}
