'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Switch, Table, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { useEffect, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { ThesisWithLecturer } from '@/hooks/thesis/usePublishTheses';

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

		setToggleLoading((prev) => new Set(prev).add(id));

		try {
			const success = await onTogglePublish(id);

			if (success) {
				message.success(
					`Thesis ${newValue ? 'published' : 'unpublished'} successfully`,
				);
			} else {
				message.error('Failed to toggle publish status');
			}
		} catch {
			message.error('An error occurred while updating publish status');
		} finally {
			setToggleLoading((prev) => {
				const newSet = new Set(prev);
				newSet.delete(id);
				return newSet;
			});
		}
	};

	const handleRowSelectionChange = (newSelectedKeys: React.Key[]) => {
		setSelectedRowKeys(newSelectedKeys);
		onSelectionChange?.(newSelectedKeys.map(String));
	};

	const renderSwitch = (record: ThesisWithLecturer) => (
		<Switch
			checked={record.isPublish}
			checkedChildren="Published"
			unCheckedChildren="Unpublished"
			loading={toggleLoading.has(record.id)}
			onChange={(checked) => handleTogglePublish(record.id, checked)}
		/>
	);

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
			render: (_, record) => record.lecturerName || 'Unknown',
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
			disabled: record.isPublish, // Disable selection if already published
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
