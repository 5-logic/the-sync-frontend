'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Switch, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ThesisConfirmationModals } from '@/components/common/ConfirmModal';
import { TablePagination } from '@/components/common/TablePagination';
import { getSemesterTagColor } from '@/lib/utils/colorUtils';
import { showNotification } from '@/lib/utils/notification';
import { ThesisWithLecturer } from '@/store/usePublishThesesStore';

interface Props {
	readonly theses: ThesisWithLecturer[];
	readonly loading?: boolean;
	readonly selectedKeys?: React.Key[];
	readonly onSelectionChange?: (selectedIds: string[]) => void;
	readonly onTogglePublish?: (thesisId: string) => Promise<boolean>;
}

export default function ThesisTable({
	theses,
	loading = false,
	selectedKeys,
	onSelectionChange,
	onTogglePublish,
}: Props) {
	const router = useRouter();
	const [data, setData] = useState<ThesisWithLecturer[]>([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [toggleLoading, setToggleLoading] = useState<Set<string>>(new Set());
	const [navigatingId, setNavigatingId] = useState<string | null>(null);

	useEffect(() => {
		setData(theses);
	}, [theses]);

	// Separate effect to handle auto-deselection of disabled items
	useEffect(() => {
		if (selectedRowKeys.length > 0 && theses.length > 0) {
			const validSelectedKeys = selectedRowKeys.filter((key) => {
				const thesis = theses.find((t) => t.id === key);
				return thesis && !thesis.isPublish && !thesis.groupId;
			});

			if (validSelectedKeys.length !== selectedRowKeys.length) {
				setSelectedRowKeys(validSelectedKeys);
				onSelectionChange?.(validSelectedKeys.map(String));
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [theses]); // Intentionally only depend on theses to avoid infinite loops

	// Sync selectedRowKeys with parent component's selectedKeys
	useEffect(() => {
		if (selectedKeys !== undefined) {
			setSelectedRowKeys(selectedKeys);
		}
	}, [selectedKeys]);

	const handleTogglePublish = async (id: string, newValue: boolean) => {
		if (!onTogglePublish) {
			// Fallback to local state update if no API handler provided
			const updated = data.map((item) =>
				item.id === id ? { ...item, isPublish: newValue } : item,
			);
			setData(updated);
			return;
		}

		// Find the thesis to get its name for the confirmation dialog
		const thesis = data.find((item) => item.id === id);
		if (!thesis) return;

		// Check if trying to unpublish a thesis that has been assigned to a group
		const isUnpublishing = thesis.isPublish && !newValue;
		if (isUnpublishing && thesis.groupId) {
			showNotification.warning(
				'Cannot Unpublish',
				'This thesis cannot be unpublished because it has been assigned to a student group.',
			);
			return;
		}

		// Show confirmation dialog
		ThesisConfirmationModals.publish(
			thesis.englishName,
			thesis.isPublish, // current publish status
			async () => {
				setToggleLoading((prev) => new Set(prev).add(id));

				try {
					const success = await onTogglePublish(id);

					if (success) {
						const statusText = newValue ? 'published' : 'unpublished';
						showNotification.success(
							'Publish Status Updated',
							`Thesis ${statusText} successfully`,
						);

						// Auto-deselect the item if it becomes disabled after toggle
						// (when published or has group assigned)
						if (newValue || thesis.groupId) {
							const newSelectedKeys = selectedRowKeys.filter(
								(key) => key !== id,
							);
							setSelectedRowKeys(newSelectedKeys);
							onSelectionChange?.(newSelectedKeys.map(String));
						}
					}
					// Error handling is now done in the store with backend error messages
				} catch {
					// Additional error handling if needed
					// Store already handles the error notifications
				} finally {
					setToggleLoading((prev) => {
						const newSet = new Set(prev);
						newSet.delete(id);
						return newSet;
					});
				}
			},
		);
	};

	const handleRowSelectionChange = (newSelectedKeys: React.Key[]) => {
		setSelectedRowKeys(newSelectedKeys);
		onSelectionChange?.(newSelectedKeys.map(String));
	};

	const renderSwitch = (record: ThesisWithLecturer) => {
		// Check if thesis has been assigned to a group
		const hasGroupAssigned = Boolean(record.groupId);
		const canUnpublish = !hasGroupAssigned;

		const switchElement = (
			<Switch
				checked={record.isPublish}
				checkedChildren="Published"
				unCheckedChildren="Unpublished"
				loading={toggleLoading.has(record.id)}
				onChange={(checked) => handleTogglePublish(record.id, checked)}
			/>
		);

		// Show warning tooltip if thesis is published but cannot be unpublished
		if (record.isPublish && !canUnpublish) {
			return (
				<Tooltip title="Cannot unpublish: This thesis has been assigned to a student group">
					{switchElement}
				</Tooltip>
			);
		}

		return switchElement;
	};

	const renderViewButton = (record: ThesisWithLecturer) => (
		<Tooltip title="View Detail">
			<Button
				type="text"
				icon={<EyeOutlined />}
				loading={navigatingId === record.id}
				onClick={async () => {
					setNavigatingId(record.id);
					try {
						await router.push(
							`/lecturer/assign-list-publish-thesis/${record.id}`,
						);
					} finally {
						// Reset loading state after navigation
						setTimeout(() => setNavigatingId(null), 100);
					}
				}}
			/>
		</Tooltip>
	);

	const renderThesisName = (text: string) => (
		<Tooltip title={text} placement="topLeft">
			<div
				style={{
					display: '-webkit-box',
					WebkitLineClamp: 2,
					WebkitBoxOrient: 'vertical',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					lineHeight: '1.4',
					maxHeight: '2.8em',
				}}
			>
				{text}
			</div>
		</Tooltip>
	);

	const columns: ColumnsType<ThesisWithLecturer> = [
		{
			title: 'English Name',
			dataIndex: 'englishName',
			key: 'englishName',
			width: '40%',
			render: (text: string) => renderThesisName(text),
		},
		{
			title: 'Semester',
			key: 'semester',
			render: (_, record) => {
				const semesterName = record.semesterName || 'Unknown';
				const color = getSemesterTagColor(semesterName);

				return <Tag color={color}>{semesterName}</Tag>;
			},
			width: '15%',
		},
		{
			title: 'Lecturer',
			key: 'lecturer',
			render: (_, record) => {
				const trimmedName = (record.lecturerName ?? '').trim();
				return trimmedName !== '' ? trimmedName : 'Unknown';
			},
			width: '15%',
		},
		{
			title: 'Public Access',
			key: 'publicAccess',
			render: (_, record) => renderSwitch(record),
			width: '15%',
			align: 'center',
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_, record) => renderViewButton(record),
			width: '10%',
			align: 'center',
		},
	];

	const rowSelection: TableRowSelection<ThesisWithLecturer> = {
		selectedRowKeys,
		onChange: handleRowSelectionChange,
		getCheckboxProps: (record) => ({
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			disabled: record.isPublish || Boolean(record.groupId), // Disable if published OR has group assigned
		}),
		columnWidth: 50,
	};

	return (
		<Table
			rowKey="id"
			columns={columns}
			dataSource={data}
			loading={loading}
			rowSelection={rowSelection}
			pagination={TablePagination}
			scroll={{ x: '100%' }}
		/>
	);
}
