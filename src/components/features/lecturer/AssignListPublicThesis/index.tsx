'use client';

import { Card, Col, Row, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';

import { mockTheses } from '@/data/thesis';

import ThesisFilterBar from './ThesisFilterBar';
import ThesisTable from './ThesisTable';

const { Title, Paragraph } = Typography;

export default function AssignListPublicThesisPage() {
	const [filters, setFilters] = useState({
		englishName: undefined as string | undefined,
		isPublish: undefined as boolean | undefined,
	});

	const filteredTheses = useMemo(() => {
		return mockTheses
			.filter((t) => t.status === 'Approved')
			.filter((thesis) => {
				const keyword = filters.englishName?.toLowerCase();

				const nameMatch =
					!keyword ||
					thesis.englishName?.toLowerCase().includes(keyword) ||
					thesis.vietnameseName?.toLowerCase().includes(keyword);

				const publishMatch =
					filters.isPublish === undefined ||
					thesis.isPublish === filters.isPublish;

				return nameMatch && publishMatch;
			});
	}, [filters]);

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
							currentFilters={filters}
							onFilterChange={(newFilters) =>
								setFilters((prev) => ({ ...prev, ...newFilters }))
							}
						/>

						<ThesisTable theses={filteredTheses} />
					</Card>
				</Col>
			</Row>
		</Space>
	);
}
