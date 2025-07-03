'use client';

import { Alert, Button, Card, Col, Row, Space, Spin, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import ThesisFilterBar from '@/components/features/lecturer/AssignListPublishThesis/ThesisFilterBar';
import ThesisTable from '@/components/features/lecturer/AssignListPublishThesis/ThesisTable';
import { showNotification } from '@/lib/utils/notification';
import { usePublishThesesStore } from '@/store';

const { Title, Paragraph } = Typography;

export default function AssignListPublishThesisPage() {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	// Use the new store for data management
	const {
		filteredTheses,
		loading,
		refreshing,
		lastError,
		filters,
		setFilters,
		fetchItems,
		refetch,
		togglePublishStatus,
		publishMultiple,
		getDomainOptions,
		clearError,
	} = usePublishThesesStore();

	// Fetch data when component mounts
	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

	// Initialize filters on mount
	useEffect(() => {
		setFilters({
			searchText: '',
			isPublish: undefined,
			domain: undefined,
		});
	}, [setFilters]);

	// ✅ Extract unique domain list for dropdown
	const domainOptions = useMemo(() => {
		return getDomainOptions();
	}, [getDomainOptions]);

	const handleFilterChange = (newFilters: Partial<typeof filters>) => {
		setFilters(newFilters);
	};

	const handlePublishSelected = async () => {
		if (selectedIds.length === 0) return;

		try {
			const success = await publishMultiple(selectedIds);

			if (success) {
				showNotification.success(
					'Bulk Publish Successful',
					`Published ${selectedIds.length} thesis(es) successfully`,
				);
				setSelectedIds([]);
			} else {
				showNotification.error(
					'Bulk Publish Failed',
					'Failed to publish some theses. Please try again.',
				);
			}
		} catch {
			showNotification.error(
				'Bulk Publish Error',
				'An error occurred while publishing theses.',
			);
		}
	};

	// Error state
	if (lastError) {
		return (
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Alert
					message="Error Loading Data"
					description={lastError.message}
					type="error"
					showIcon
					action={
						<Button size="small" onClick={refetch}>
							Retry
						</Button>
					}
					closable
					onClose={clearError}
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
					<Spin
						spinning={Boolean(loading) || Boolean(refreshing)}
						tip={loading ? 'Loading thesis data...' : 'Refreshing data...'}
					>
						<Card>
							<ThesisFilterBar
								currentFilters={filters}
								onFilterChange={handleFilterChange}
								domainOptions={domainOptions}
								onRefresh={refetch}
								loading={refreshing}
							/>

							<ThesisTable
								theses={filteredTheses}
								onSelectionChange={setSelectedIds}
								onTogglePublish={togglePublishStatus}
							/>
						</Card>
					</Spin>
				</Col>
			</Row>
		</Space>
	);
}
