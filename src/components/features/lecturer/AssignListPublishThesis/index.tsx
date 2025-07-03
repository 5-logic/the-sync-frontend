'use client';

import {
	Alert,
	Button,
	Card,
	Col,
	Row,
	Space,
	Spin,
	Typography,
	message,
} from 'antd';
import { useMemo, useState } from 'react';

import ThesisFilterBar from '@/components/features/lecturer/AssignListPublishThesis/ThesisFilterBar';
import ThesisTable from '@/components/features/lecturer/AssignListPublishThesis/ThesisTable';
import { usePublishTheses } from '@/hooks/thesis';
import { isTextMatch } from '@/lib/utils';

const { Title, Paragraph } = Typography;

export default function AssignListPublishThesisPage() {
	const [filters, setFilters] = useState({
		englishName: undefined as string | undefined,
		isPublish: undefined as boolean | undefined,
		domain: undefined as string | undefined,
	});

	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	// Use the new hook to fetch real data
	const {
		theses,
		loading,
		refreshing,
		error,
		refetch,
		publishMultiple,
		togglePublishStatus,
	} = usePublishTheses();

	// ✅ Extract unique domain list for dropdown
	const domainOptions = useMemo(() => {
		const domains = theses.map((t) => t.domain).filter(Boolean);
		return Array.from(new Set(domains)).filter(
			(d): d is string => typeof d === 'string',
		);
	}, [theses]);

	// ✅ Filter logic with Vietnamese text normalization
	const filteredTheses = useMemo(() => {
		return theses.filter((thesis) => {
			const keyword = filters.englishName ?? '';

			// Use utility function for text matching
			const nameMatch = isTextMatch(keyword, [
				thesis.englishName,
				thesis.vietnameseName,
				thesis.lecturerName,
			]);

			const publishMatch =
				filters.isPublish === undefined
					? true
					: thesis.isPublish === filters.isPublish;

			const domainMatch =
				filters.domain === undefined ? true : thesis.domain === filters.domain;

			return nameMatch && publishMatch && domainMatch;
		});
	}, [filters, theses]);

	const handlePublishSelected = async () => {
		if (selectedIds.length === 0) return;

		try {
			const success = await publishMultiple(selectedIds);

			if (success) {
				message.success(
					`Published ${selectedIds.length} thesis(es) successfully`,
				);
				setSelectedIds([]);
			} else {
				message.error('Failed to publish some theses. Please try again.');
			}
		} catch {
			message.error('An error occurred while publishing theses.');
		}
	};

	// Loading state
	if (loading) {
		return (
			<div style={{ textAlign: 'center', padding: '50px' }}>
				<Spin size="large" />
				<div style={{ marginTop: 16 }}>Loading thesis data...</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Alert
					message="Error Loading Data"
					description={error}
					type="error"
					showIcon
					action={
						<Button size="small" onClick={refetch}>
							Retry
						</Button>
					}
				/>
			</Space>
		);
	}

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Row justify="space-between" align="middle">
				<Col>
					<Title level={2} style={{ marginBottom: 4 }}>
						Assign List Publish Thesis
					</Title>
					<Paragraph type="secondary" style={{ marginBottom: 0 }}>
						Manage the list of published thesis topics available for student
						selection. Only approved theses are shown here.
					</Paragraph>
				</Col>
				<Col>
					<Button
						type="primary"
						onClick={handlePublishSelected}
						disabled={selectedIds.length === 0}
					>
						Publish Selected ({selectedIds.length})
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
							onRefresh={refetch}
							loading={refreshing}
						/>

						<Spin spinning={refreshing} tip="Refreshing data...">
							<ThesisTable
								theses={filteredTheses}
								onSelectionChange={setSelectedIds}
								onTogglePublish={togglePublishStatus}
							/>
						</Spin>
					</Card>
				</Col>
			</Row>
		</Space>
	);
}
