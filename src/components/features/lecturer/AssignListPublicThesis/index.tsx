'use client';

import { Button, Card, Col, Row, Space, Typography, message } from 'antd';
import { useMemo, useState } from 'react';

import ThesisFilterBar from '@/components/features/lecturer/AssignListPublicThesis/ThesisFilterBar';
import ThesisTable from '@/components/features/lecturer/AssignListPublicThesis/ThesisTable';
import { mockTheses } from '@/data/thesis';

const { Title, Paragraph } = Typography;

export default function AssignListPublicThesisPage() {
	const [filters, setFilters] = useState({
		englishName: undefined as string | undefined,
		isPublish: undefined as boolean | undefined,
		domain: undefined as string | undefined,
	});

	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [theses, setTheses] = useState(mockTheses);

	// ✅ Extract unique domain list for dropdown
	const domainOptions = useMemo(() => {
		const domains = theses.map((t) => t.domain);
		return Array.from(new Set(domains)).filter(
			(d): d is string => typeof d === 'string',
		);
	}, [theses]);

	// ✅ Filter logic
	const filteredTheses = useMemo(() => {
		return theses
			.filter((t) => t.status === 'Approved')
			.filter((thesis) => {
				const keyword = filters.englishName?.toLowerCase() ?? '';
				const englishName = thesis.englishName?.toLowerCase() ?? '';
				const vietnameseName = thesis.vietnameseName?.toLowerCase() ?? '';
				const nameMatch =
					keyword === ''
						? true
						: [englishName, vietnameseName].some((name) =>
								name.includes(keyword),
							);

				const publishMatch =
					filters.isPublish === undefined
						? true
						: thesis.isPublish === filters.isPublish;

				const domainMatch =
					filters.domain === undefined
						? true
						: thesis.domain === filters.domain;

				return nameMatch && publishMatch && domainMatch;
			});
	}, [filters, theses]);

	const handlePublishSelected = () => {
		if (selectedIds.length === 0) return;

		const updated = theses.map((thesis) =>
			selectedIds.includes(thesis.id) ? { ...thesis, isPublish: true } : thesis,
		);
		setTheses(updated);
		message.success(`Published ${selectedIds.length} thesis(es)`);
		setSelectedIds([]);
	};

	return (
		<Space
			direction="vertical"
			size="large"
			style={{ padding: 24, width: '100%' }}
		>
			<Row justify="space-between" align="middle">
				<Col>
					<Title level={2} style={{ marginBottom: 4 }}>
						Assign List Public Thesis
					</Title>
					<Paragraph type="secondary" style={{ marginBottom: 0 }}>
						Manage the list of published thesis topics available for student
						selection.
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

			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Card>
						<ThesisFilterBar
							currentFilters={filters}
							onFilterChange={(newFilters) =>
								setFilters((prev) => ({ ...prev, ...newFilters }))
							}
							domainOptions={domainOptions}
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
