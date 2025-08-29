'use client';

import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useMemo, useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import {
	SearchAndFilterControls,
	createAppliedDateColumn,
	createStatusColumn,
	getThesisApplicationTableConfig,
} from '@/components/common/ThesisApplicationTable';
import { useNavigationLoader } from '@/hooks/ux';
import thesisApplicationService, {
	ThesisApplication,
} from '@/lib/services/thesis-application.service';
import { handleApiError } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';

interface Props {
	data: ThesisApplication[];
	loading?: boolean;
	onRefresh: () => void;
}

export default function ThesisApplicationTable({
	data,
	loading,
	onRefresh,
}: Readonly<Props>) {
	const { navigateWithLoading } = useNavigationLoader();
	const [cancelingId, setCancelingId] = useState<string | null>(null);

	// Filter states
	const [searchText, setSearchText] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('');

	// Filter data based on search and status
	const filteredData = useMemo(() => {
		return data.filter((item) => {
			const matchesSearch =
				item.thesis.englishName
					.toLowerCase()
					.includes(searchText.toLowerCase()) ||
				item.thesis.abbreviation
					.toLowerCase()
					.includes(searchText.toLowerCase());

			const matchesStatus = !statusFilter || item.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [data, searchText, statusFilter]);

	// Handle view thesis detail
	const handleView = useCallback(
		(thesisId: string) => {
			navigateWithLoading(`/student/list-thesis/${thesisId}`);
		},
		[navigateWithLoading],
	);

	// Handle cancel application
	const handleCancel = useCallback(
		async (application: ThesisApplication) => {
			try {
				setCancelingId(application.thesisId);

				await thesisApplicationService.cancelThesisApplication(
					application.groupId,
					application.thesisId,
				);

				showNotification.success(
					'Application Canceled',
					'Your thesis application has been canceled successfully!',
				);

				// Refresh data
				onRefresh();
			} catch (error) {
				console.error('Error canceling application:', error);

				const apiError = handleApiError(
					error,
					'Failed to cancel application. Please try again.',
				);

				showNotification.error('Cancel Failed', apiError.message);
			} finally {
				setCancelingId(null);
			}
		},
		[onRefresh],
	);

	// Handle cancel application with modal confirm
	const handleCancelWithConfirm = useCallback(
		(application: ThesisApplication) => {
			ConfirmationModal.show({
				title: 'Cancel Application',
				message: 'Are you sure you want to cancel this thesis application?',
				details: application.thesis.englishName,
				note: 'This action cannot be undone.',
				noteType: 'warning',
				okText: 'Yes, Cancel',
				cancelText: 'No',
				okType: 'danger',
				loading: cancelingId === application.thesisId,
				onOk: () => handleCancel(application),
			});
		},
		[handleCancel, cancelingId],
	);

	// Render actions column
	const renderActionsColumn = useCallback(
		(record: ThesisApplication) => {
			const isCanceling = cancelingId === record.thesisId;

			return (
				<div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
					{/* View Detail Button */}
					<Tooltip title="View Thesis Detail">
						<Button
							icon={<EyeOutlined />}
							size="small"
							onClick={() => handleView(record.thesisId)}
						/>
					</Tooltip>

					{/* Cancel Application Button - Only show for Pending status */}
					{record.status === 'Pending' && (
						<Tooltip title="Cancel Application">
							<Button
								icon={<DeleteOutlined />}
								danger
								size="small"
								loading={isCanceling}
								disabled={isCanceling}
								onClick={() => handleCancelWithConfirm(record)}
							/>
						</Tooltip>
					)}
				</div>
			);
		},
		[handleView, handleCancelWithConfirm, cancelingId],
	);

	// Define table columns
	const columns: ColumnsType<ThesisApplication> = useMemo(
		() => [
			{
				title: 'English Name',
				dataIndex: ['thesis', 'englishName'],
				key: 'englishName',
				width: '40%',
				ellipsis: {
					showTitle: false,
				},
				render: (text: string) => (
					<Tooltip title={text} placement="topLeft">
						<div
							style={{
								display: '-webkit-box',
								WebkitLineClamp: 2,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								lineHeight: '1.5',
								maxHeight: '3em',
								wordBreak: 'break-word',
								whiteSpace: 'normal',
							}}
						>
							{text}
						</div>
					</Tooltip>
				),
			},
			{
				title: 'Abbreviation',
				dataIndex: ['thesis', 'abbreviation'],
				key: 'abbreviation',
				width: '15%',
				align: 'center' as const,
				render: (text: string) => (
					<Tag color="blue" style={{ fontWeight: 'bold' }}>
						{text}
					</Tag>
				),
			},
			createStatusColumn('12%'),
			createAppliedDateColumn('15%'),
			{
				title: 'Actions',
				key: 'actions',
				width: '18%',
				align: 'center' as const,
				render: (_, record) => renderActionsColumn(record),
			},
		],
		[renderActionsColumn],
	);

	return (
		<div>
			{/* Search and Filter Controls */}
			<SearchAndFilterControls
				searchText={searchText}
				onSearchChange={setSearchText}
				statusFilter={statusFilter}
				onStatusFilterChange={setStatusFilter}
				onRefresh={onRefresh}
				loading={loading}
				searchPlaceholder="Search by thesis name or abbreviation..."
			/>

			{/* Table */}
			<Table
				columns={columns}
				dataSource={filteredData}
				rowKey={(record) => `${record.groupId}-${record.thesisId}`}
				loading={loading}
				{...getThesisApplicationTableConfig('applications')}
			/>
		</div>
	);
}
