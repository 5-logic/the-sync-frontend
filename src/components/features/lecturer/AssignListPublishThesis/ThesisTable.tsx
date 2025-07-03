'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Switch, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { useEffect, useState } from 'react';

import { ThesisConfirmationModals } from '@/components/common/ConfirmModal';
import { TablePagination } from '@/components/common/TablePagination';
import { showNotification } from '@/lib/utils/notification';
import { ThesisWithLecturer } from '@/store/usePublishThesesStore';

interface Props {
	readonly theses: ThesisWithLecturer[];
	readonly onSelectionChange?: (selectedIds: string[]) => void;
	readonly onTogglePublish?: (thesisId: string) => Promise<boolean>;
}

export default function ThesisTable({
	theses,
	onSelectionChange,
	onTogglePublish,
}: Props) {
	const [data, setData] = useState<ThesisWithLecturer[]>([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [toggleLoading, setToggleLoading] = useState<Set<string>>(new Set());

	useEffect(() => {
		setData(theses);
	}, [theses]);

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
					} else {
						showNotification.error(
							'Update Failed',
							'Failed to toggle publish status',
						);
					}
				} catch {
					showNotification.error(
						'Update Error',
						'An error occurred while updating publish status',
					);
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

	const renderViewButton = () => (
		<Tooltip title="View Detail">
			<Button type="text" icon={<EyeOutlined />} onClick={() => {}} />
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
			width: '30%',
			render: (text: string) => renderThesisName(text),
		},
		{
			title: 'Vietnamese Name',
			dataIndex: 'vietnameseName',
			key: 'vietnameseName',
			width: '30%',
			render: (text: string) => renderThesisName(text),
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
			render: () => renderViewButton(),
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
			rowSelection={rowSelection}
			pagination={TablePagination}
			scroll={{ x: '100%' }}
		/>
	);
}
