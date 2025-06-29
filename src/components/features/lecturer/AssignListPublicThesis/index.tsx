'use client';

import { Card, Col, Row, Typography } from 'antd';
import { useMemo, useState } from 'react';

import { mockTheses } from '@/data/thesis';

import ThesisFilterBar from './ThesisFilterBar';
import ThesisTable from './ThesisTable';

export default function AssignListPublicThesisPage() {
	const { Title, Paragraph } = Typography;
	const [filters, setFilters] = useState({
		keyword: '',
		domain: '',
		group: '',
		semester: '',
	});

	const domainOptions = useMemo(() => {
		const domains = mockTheses
			.map((t) => t.domain)
			.filter((d): d is string => typeof d === 'string');
		return Array.from(new Set(domains));
	}, []);

	const groupOptions = useMemo(() => {
		const groups = mockTheses
			.map((t) => t.group?.id)
			.filter((id): id is string => !!id);
		return Array.from(new Set(groups));
	}, []);

	const filteredTheses = useMemo(() => {
		return mockTheses.filter((thesis) => {
			const keywordMatch =
				!filters.keyword ||
				thesis.englishName
					.toLowerCase()
					.includes(filters.keyword.toLowerCase()) ||
				thesis.vietnameseName
					.toLowerCase()
					.includes(filters.keyword.toLowerCase());

			const domainMatch = !filters.domain || thesis.domain === filters.domain;
			const groupMatch = !filters.group || thesis.group?.id === filters.group;

			return keywordMatch && domainMatch && groupMatch;
		});
	}, [filters]);

	return (
		<div className="p-6">
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Assign List Public Thesis
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 24 }}>
					Manage the list of published thesis topics available for student
					selection.
				</Paragraph>
			</div>

			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Card>
						<ThesisFilterBar
							domains={domainOptions}
							groupIds={groupOptions}
							onFilterChange={(newFilters) =>
								setFilters((prev) => ({ ...prev, ...newFilters }))
							}
						/>
						<ThesisTable theses={filteredTheses} />
					</Card>
				</Col>
			</Row>
		</div>
	);
}
