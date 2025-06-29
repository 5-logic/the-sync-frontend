'use client';

import { Card, Col, Row, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';

import mockGroups from '@/data/group';
import { mockTheses } from '@/data/thesis';

import ThesisFilterBar from './ThesisFilterBar';
import ThesisTable from './ThesisTable';

interface Filters {
	englishName?: string;
	domain?: string;
	group?: string;
	semester?: string;
}

export default function AssignListPublicThesisPage() {
	const { Title, Paragraph } = Typography;

	const [filters, setFilters] = useState<Filters>({
		englishName: undefined,
		domain: undefined,
		group: undefined,
		semester: undefined,
	});

	// Tạo groupMap: { groupId: groupName }
	const groupMap = useMemo(() => {
		const map: Record<string, string> = {};
		mockGroups.forEach((g) => {
			map[g.id] = g.name;
		});
		return map;
	}, []);

	// Lấy danh sách domain duy nhất
	const domainOptions = useMemo(() => {
		const domains = mockTheses
			.map((t) => t.domain)
			.filter((d): d is string => typeof d === 'string' && !!d); // thêm !!d để bỏ undefined, null, ''
		return Array.from(new Set(domains));
	}, []);

	// Lấy danh sách nhóm để select
	const groupOptions = useMemo(() => {
		return mockGroups.map((g) => ({
			id: g.id,
			name: g.name,
		}));
	}, []);

	// Enrich thesis: thêm group { id, name } từ groupId
	const enrichedTheses = useMemo(() => {
		return mockTheses.map((thesis) => {
			const groupId = thesis.group?.id || thesis.groupId;
			const groupName = groupId ? groupMap[groupId] : undefined;

			return {
				...thesis,
				group:
					groupId && groupName
						? {
								id: groupId,
								name: groupName,
								members: thesis.group?.members || [],
							}
						: undefined,
			};
		});
	}, [groupMap]);

	const filteredTheses = useMemo(() => {
		return enrichedTheses.filter((thesis) => {
			const englishNameMatch =
				!filters.englishName ||
				thesis.englishName
					?.toLowerCase()
					.includes(filters.englishName.toLowerCase());

			const domainMatch = !filters.domain || thesis.domain === filters.domain;
			const groupMatch = !filters.group || thesis.group?.id === filters.group;
			const semesterMatch =
				!filters.semester || thesis.semester === filters.semester;

			return englishNameMatch && domainMatch && groupMatch && semesterMatch;
		});
	}, [filters, enrichedTheses]);

	const handleFilterChange = (newFilters: Partial<Filters>) => {
		setFilters((prev) => ({
			...prev,
			...newFilters,
		}));
	};

	return (
		<Space
			direction="vertical"
			size="large"
			style={{ padding: 24, width: '100%' }}
		>
			<Space direction="vertical" size={4} style={{ width: '100%' }}>
				<Title level={2} style={{ margin: 0 }}>
					Assign List Public Thesis
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					Manage the list of published thesis topics available for student
					selection.
				</Paragraph>
			</Space>

			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Card>
						<ThesisFilterBar
							domains={domainOptions}
							groups={groupOptions}
							currentFilters={filters}
							onFilterChange={handleFilterChange}
						/>
						<ThesisTable theses={filteredTheses} />
					</Card>
				</Col>
			</Row>
		</Space>
	);
}
