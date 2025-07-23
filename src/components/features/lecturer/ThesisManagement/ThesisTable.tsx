'use client';

import {
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	LoadingOutlined,
	MoreOutlined,
	SendOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Table, Tag, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ThesisConfirmationModals } from '@/components/common/ConfirmModal';
import { TablePagination } from '@/components/common/TablePagination';
import { useSessionData } from '@/hooks/auth/useAuth';
import { useNavigationLoader } from '@/hooks/ux';
import {
	BUTTON_STATES,
	STATUS_COLORS,
	THESIS_STATUS,
	ThesisStatus,
	UI_CONSTANTS,
} from '@/lib/constants/thesis';
import { aiDuplicateService } from '@/lib/services/ai-duplicate.service';
import { formatDate } from '@/lib/utils/dateFormat';
import { showNotification } from '@/lib/utils/notification';
import {
	THESIS_ERROR_CONFIGS,
	THESIS_SUCCESS_CONFIGS,
	handleThesisError,
	handleThesisSuccess,
} from '@/lib/utils/thesis-handlers';
import { Thesis } from '@/schemas/thesis';
import { useLecturerStore, useThesisStore } from '@/store';

interface Props {
	data: Thesis[];
	loading?: boolean;
}

export default function ThesisTable({ data, loading }: Readonly<Props>) {
	const { deleteThesis, submitThesis } = useThesisStore();
	const { getLecturerById, fetchLecturers } = useLecturerStore();
	const { session } = useSessionData();
	const { isNavigating, targetPath, navigateWithLoading } =
		useNavigationLoader();

	// Loading state for register submit buttons
	const [submitLoadingThesisId, setSubmitLoadingThesisId] = useState<
		string | null
	>(null);

	// Fetch lecturers for Owner column display
	useEffect(() => {
		fetchLecturers();
	}, [fetchLecturers]);

	// Memoized handlers to prevent unnecessary re-renders
	const handleEdit = useCallback(
		(thesisId: string) => {
			const editPath = `/lecturer/thesis-management/${thesisId}/edit-thesis`;
			navigateWithLoading(editPath);
		},
		[navigateWithLoading],
	);

	const handleView = useCallback(
		(thesisId: string) => {
			const viewPath = `/lecturer/thesis-management/${thesisId}`;
			navigateWithLoading(viewPath);
		},
		[navigateWithLoading],
	);

	const handleDelete = useCallback(
		(thesis: Thesis) => {
			ThesisConfirmationModals.delete(thesis.englishName, async () => {
				try {
					const success = await deleteThesis(thesis.id);
					if (success) {
						handleThesisSuccess(THESIS_SUCCESS_CONFIGS.DELETE);
					}
				} catch (error) {
					handleThesisError(error, THESIS_ERROR_CONFIGS.DELETE);
				}
			});
		},
		[deleteThesis],
	);

	const handleRegisterSubmit = useCallback(
		async (thesis: Thesis) => {
			// Set loading state for this specific thesis
			setSubmitLoadingThesisId(thesis.id);

			try {
				// Check for duplicates first
				const duplicateResponse = await aiDuplicateService.checkDuplicate(
					thesis.id,
				);
				if (
					duplicateResponse.success &&
					duplicateResponse.data &&
					duplicateResponse.data.length > 0
				) {
					// Found duplicates - block submission
					const duplicateCount = duplicateResponse.data.length;
					showNotification.error(
						'Cannot Submit Thesis',
						`Found ${duplicateCount} similar thesis${duplicateCount > 1 ? 'es' : ''}. Please review and resolve the similarities before submitting.`,
					);
					return; // Exit early, don't submit
				}
			} catch (duplicateError) {
				console.error('Duplicate check failed:', duplicateError);
				showNotification.error(
					'Duplicate Check Failed',
					'Unable to check for duplicate theses. Please try again.',
				);
				return; // Exit early on error
			}

			// No duplicates found, proceed with confirmation modal
			ThesisConfirmationModals.submit(thesis.englishName, async () => {
				try {
					const success = await submitThesis(thesis.id);
					if (success) {
						handleThesisSuccess(THESIS_SUCCESS_CONFIGS.SUBMIT);
					}
				} catch (error) {
					handleThesisError(error, THESIS_ERROR_CONFIGS.SUBMIT);
				}
			});
		},
		[submitThesis],
	);

	// Type-safe color mapping for status
	const getStatusColor = useCallback((status: string): string => {
		return STATUS_COLORS[status as ThesisStatus] ?? 'default';
	}, []);

	// Create dropdown menu items for each thesis with status rules
	const getDropdownItems = useCallback(
		(record: Thesis): MenuProps['items'] => {
			// SECURITY: Check thesis ownership
			const isThesisOwner = record.lecturerId === session?.user?.id;
			const canEditOrDelete =
				isThesisOwner &&
				(record.status === THESIS_STATUS.NEW ||
					record.status === THESIS_STATUS.REJECTED);

			// Check if this specific record is being navigated to
			const editPath = `/lecturer/thesis-management/${record.id}/edit-thesis`;
			const viewPath = `/lecturer/thesis-management/${record.id}`;
			const isEditLoading = isNavigating && targetPath === editPath;
			const isViewLoading = isNavigating && targetPath === viewPath;

			return [
				{
					key: 'view',
					label: 'View Details',
					icon: isViewLoading ? <LoadingOutlined spin /> : <EyeOutlined />,
					onClick: () => handleView(record.id),
					disabled: isNavigating && !isViewLoading,
				},
				{
					key: 'edit',
					label: 'Edit Thesis',
					icon: isEditLoading ? <LoadingOutlined spin /> : <EditOutlined />,
					disabled: !canEditOrDelete || (isNavigating && !isEditLoading),
					onClick: () => canEditOrDelete && handleEdit(record.id),
				},
				{
					type: 'divider',
				},
				{
					key: 'delete',
					label: 'Delete',
					icon: <DeleteOutlined />,
					danger: true,
					disabled: !canEditOrDelete || isNavigating,
					onClick: () => canEditOrDelete && handleDelete(record),
				},
			];
		},
		[
			session?.user?.id,
			isNavigating,
			targetPath,
			handleView,
			handleEdit,
			handleDelete,
		],
	);

	// Extract register submit click handler to reduce nesting
	const handleRegisterSubmitClick = useCallback(
		async (record: Thesis, isDisabled: boolean) => {
			if (!isDisabled) {
				try {
					await handleRegisterSubmit(record);
				} catch {
					// Error is already handled in handleRegisterSubmit
				} finally {
					// Always clear loading state
					setSubmitLoadingThesisId(null);
				}
			}
		},
		[handleRegisterSubmit],
	);

	// Extract register submit button props logic
	const getRegisterSubmitProps = useCallback(
		(record: Thesis, isThesisOwner: boolean) => {
			if (!isThesisOwner) {
				return {
					disabled: true,
					title: BUTTON_STATES.NOT_YOUR_THESIS,
					type: 'default' as const,
				};
			}

			switch (record.status) {
				case THESIS_STATUS.NEW:
					return {
						disabled: false,
						title: BUTTON_STATES.REGISTER_SUBMIT,
						type: 'primary' as const,
					};
				case THESIS_STATUS.REJECTED:
					return {
						disabled: false,
						title: 'Resubmit for Review',
						type: 'primary' as const,
					};
				case THESIS_STATUS.PENDING:
					return {
						disabled: true,
						title: BUTTON_STATES.ALREADY_SUBMITTED,
						type: 'default' as const,
					};
				default:
					return {
						disabled: true,
						title: BUTTON_STATES.CANNOT_SUBMIT,
						type: 'default' as const,
					};
			}
		},
		[],
	);

	// Extract actions render logic to reduce nesting
	const renderActionsColumn = useCallback(
		(record: Thesis) => {
			// SECURITY: Check thesis ownership
			const isThesisOwner = record.lecturerId === session?.user?.id;
			const submitProps = getRegisterSubmitProps(record, isThesisOwner);
			const isSubmitLoading = submitLoadingThesisId === record.id;

			return (
				<div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
					{/* Register Submit Button - Always visible with different states */}
					<Tooltip title={submitProps.title}>
						<Button
							icon={<SendOutlined />}
							type={submitProps.type}
							size="small"
							disabled={submitProps.disabled || isSubmitLoading}
							loading={isSubmitLoading}
							onClick={() =>
								handleRegisterSubmitClick(record, submitProps.disabled)
							}
						/>
					</Tooltip>

					{/* Dropdown Menu for Edit/View/Delete */}
					<Dropdown
						menu={{ items: getDropdownItems(record) }}
						trigger={['click']}
						placement="bottomRight"
					>
						<Button icon={<MoreOutlined />} type="text" size="small" />
					</Dropdown>
				</div>
			);
		},
		[
			session?.user?.id,
			getRegisterSubmitProps,
			handleRegisterSubmitClick,
			getDropdownItems,
			submitLoadingThesisId,
		],
	);

	// Memoize columns to prevent unnecessary re-renders
	const columns: ColumnsType<Props['data'][number]> = useMemo(
		() => [
			{
				title: 'Title',
				dataIndex: 'englishName',
				key: 'title',
				width: UI_CONSTANTS.TABLE_WIDTHS.TITLE,
				sorter: (a, b) => a.englishName.localeCompare(b.englishName),
				ellipsis: {
					showTitle: false,
				},
				render: (text: string) => (
					<Tooltip title={text} placement="topLeft">
						<div
							style={{
								display: '-webkit-box',
								WebkitLineClamp: UI_CONSTANTS.TEXT_DISPLAY.MAX_LINES,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								lineHeight: UI_CONSTANTS.TEXT_DISPLAY.LINE_HEIGHT,
								maxHeight: UI_CONSTANTS.TEXT_DISPLAY.MAX_HEIGHT,
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
				title: 'Owner',
				dataIndex: 'lecturerId',
				key: 'owner',
				width: UI_CONSTANTS.TABLE_WIDTHS.OWNER,
				ellipsis: {
					showTitle: false,
				},
				render: (lecturerId: string) => {
					const lecturer = getLecturerById(lecturerId);
					const displayName = lecturer?.fullName ?? 'Unknown';

					return (
						<Tooltip title={displayName} placement="topLeft">
							<div
								style={{
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}
							>
								{displayName}
							</div>
						</Tooltip>
					);
				},
			},
			{
				title: 'Domain',
				dataIndex: 'domain',
				key: 'domain',
				width: UI_CONSTANTS.TABLE_WIDTHS.DOMAIN,
				ellipsis: {
					showTitle: false,
				},
				render: (domain: string | null | undefined) => {
					if (!domain) {
						return (
							<Tooltip title="No Domain specified">
								<Tag color="default">No Domain</Tag>
							</Tooltip>
						);
					}

					return (
						<Tooltip title={domain} placement="topLeft">
							<Tag
								color="blue"
								style={{
									maxWidth: '100%',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									display: 'inline-block',
								}}
							>
								{domain}
							</Tag>
						</Tooltip>
					);
				},
			},
			{
				title: 'Status',
				dataIndex: 'status',
				key: 'status',
				width: UI_CONSTANTS.TABLE_WIDTHS.STATUS,
				render: (status: string) => (
					<Tag color={getStatusColor(status)}>{status}</Tag>
				),
			},
			{
				title: 'Submitted date',
				dataIndex: 'createdAt',
				key: 'summitDate',
				width: UI_CONSTANTS.TABLE_WIDTHS.DATE,
				sorter: (a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
				render: (date: Date) => formatDate(date),
			},
			{
				title: 'Actions',
				key: 'actions',
				width: UI_CONSTANTS.TABLE_WIDTHS.ACTIONS,
				align: 'center' as const,
				render: (_, record) => renderActionsColumn(record),
			},
		],
		[getLecturerById, getStatusColor, renderActionsColumn],
	);

	return (
		<Table
			columns={columns}
			dataSource={data}
			rowKey="id"
			pagination={TablePagination}
			loading={loading}
			size="middle"
			tableLayout="fixed"
		/>
	);
}
