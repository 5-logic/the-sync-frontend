'use client';

import { Alert, Button, Card, Col, Row, Space, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { ThesisConfirmationModals } from '@/components/common/ConfirmModal';
import { Header } from '@/components/common/Header';
import ThesisFilterBar from '@/components/features/lecturer/AssignListPublishThesis/ThesisFilterBar';
import ThesisTable from '@/components/features/lecturer/AssignListPublishThesis/ThesisTable';
import { showNotification } from '@/lib/utils/notification';
import { usePublishThesesStore } from '@/store';

export default function AssignListPublishThesisPage() {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [bulkPublishLoading, setBulkPublishLoading] = useState(false);

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

		// Get selected theses for confirmation dialog
		const selectedTheses = filteredTheses.filter((thesis) =>
			selectedIds.includes(thesis.id),
		);

		// Count how many will actually be published (not already published, no groupId)
		const thesesToPublish = selectedTheses.filter(
			(thesis) => !thesis.isPublish && !thesis.groupId,
		);

		if (thesesToPublish.length === 0) {
			showNotification.warning(
				'No Theses to Publish',
				'All selected theses are already published or assigned to groups.',
			);
			return;
		}

		// Show confirmation dialog
		ThesisConfirmationModals.bulkPublish(
			thesesToPublish.length,
			selectedIds.length,
			async () => {
				setBulkPublishLoading(true);

				try {
					const success = await publishMultiple(selectedIds);

					if (success) {
						showNotification.success(
							'Bulk Publish Successful',
							`Published ${thesesToPublish.length} thesis(es) successfully`,
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
				} finally {
					setBulkPublishLoading(false);
				}
			},
		);
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
					<Header
						title="Assign List Publish Thesis"
						description="Manage the list of published thesis topics available for student
						selection. Only approved theses are shown here."
						badgeText="Moderator Only"
					/>
				</Col>
				<Col>
					<Button
						type="primary"
						onClick={handlePublishSelected}
						disabled={selectedIds.length === 0 || bulkPublishLoading}
						loading={bulkPublishLoading}
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
								selectedKeys={selectedIds}
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
