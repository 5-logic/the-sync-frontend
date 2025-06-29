'use client';

import { Card, Col, Row, Space, Typography, Button, message } from 'antd';
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

	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [theses, setTheses] = useState(mockTheses);

	const filteredTheses = useMemo(() => {
		return theses
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
	}, [filters, theses]);

	const handlePublishSelected = () => {
		if (selectedIds.length === 0) return;

		const updated = theses.map((thesis) =>
			selectedIds.includes(thesis.id)
				? { ...thesis, isPublish: true }
				: thesis,
		);
		setTheses(updated);
		message.success(`Published ${selectedIds.length} thesis(es)`);
		setSelectedIds([]); // Clear selection
	};

	return (
		<Space
			direction="vertical"
			size="large"
			style={{ padding: 24, width: '100%' }}
		>
			{/* Title + Button Row */}
			<Row justify="space-between" align="middle">
				<Col>
					<Title level={2} style={{ marginBottom: 4 }}>
						Assign List Public Thesis
					</Title>
					<Paragraph type="secondary" style={{ marginBottom: 0 }}>
						Manage the list of published thesis topics available for student selection.
					</Paragraph>
				</Col>
				<Col>
					<Button
						type="primary"
						onClick={handlePublishSelected}
						disabled={selectedIds.length === 0}
					>
						Publish Selected
					</Button>
				</Col>
			</Row>

			{/* Filters + Table */}
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Card>
						<ThesisFilterBar
							currentFilters={filters}
							onFilterChange={(newFilters) =>
								setFilters((prev) => ({ ...prev, ...newFilters }))
							}
						/>

						<ThesisTable
							theses={filteredTheses}
							onSelectionChange={setSelectedIds}
						/>
					</Card>
				</Col>
			</Row>
		</Space>
	);
}
