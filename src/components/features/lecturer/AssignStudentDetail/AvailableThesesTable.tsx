'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { getSemesterTagColor } from '@/lib/utils/colorUtils';
import { Thesis } from '@/schemas/thesis';

interface ThesisWithSemester extends Thesis {
	semester?: {
		id: string;
		name: string;
		code: string;
	};
}

interface Props {
	readonly data: ThesisWithSemester[];
	readonly loading?: boolean;
	readonly selectedRowKeys?: React.Key[];
	readonly onSelectionChange?: (
		selectedKeys: React.Key[],
		selectedRows: ThesisWithSemester[],
	) => void;
	readonly onViewDetail?: (thesis: ThesisWithSemester) => void;
	readonly semesterNamesMap?: Record<string, string>;
	readonly disableSelection?: boolean;
}

export default function AvailableThesesTable({
	data,
	loading = false,
	selectedRowKeys = [],
	onSelectionChange,
	onViewDetail,
	semesterNamesMap = {},
	disableSelection = false,
}: Props) {
	const [navigatingId, setNavigatingId] = useState<string | null>(null);

	const handleViewDetail = async (thesis: ThesisWithSemester) => {
		setNavigatingId(thesis.id);
		try {
			onViewDetail?.(thesis);
		} finally {
			setNavigatingId(null);
		}
	};

	const columns: ColumnsType<ThesisWithSemester> = [
		{
			title: 'English Name',
			dataIndex: 'englishName',
			key: 'englishName',
			width: '50%',
			render: (text) => (
				<div
					style={{
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						lineHeight: '1.4',
						maxHeight: '2.8em',
						wordWrap: 'break-word',
					}}
					title={text}
				>
					{text}
				</div>
			),
		},
		{
			title: 'Abbreviation',
			dataIndex: 'abbreviation',
			key: 'abbreviation',
			width: '20%',
		},
		{
			title: 'Semester',
			key: 'semester',
			width: '15%',
			align: 'center',
			render: (_, record) => {
				// Check if semester object exists first, then fall back to semesterId
				let semesterName = null;
				if (record.semester?.name) {
					semesterName = record.semester.name;
				} else if (record.semesterId && semesterNamesMap[record.semesterId]) {
					semesterName = semesterNamesMap[record.semesterId];
				}

				if (semesterName) {
					return (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								height: '100%',
							}}
						>
							<Tag
								color={getSemesterTagColor(semesterName)}
								title={semesterName}
							>
								{semesterName}
							</Tag>
						</div>
					);
				}
				return '-';
			},
		},
		{
			title: 'Action',
			key: 'action',
			width: '10%',
			align: 'center',
			render: (_, record) => (
				<Tooltip title="View Details">
					<Button
						type="text"
						icon={<EyeOutlined />}
						size="small"
						loading={navigatingId === record.id}
						onClick={() => handleViewDetail(record)}
					/>
				</Tooltip>
			),
		},
	];

	const rowSelection: TableRowSelection<ThesisWithSemester> = {
		type: 'radio', // Single selection for thesis
		selectedRowKeys,
		onChange: (selectedRowKeys, selectedRows) => {
			if (!disableSelection) {
				onSelectionChange?.(selectedRowKeys, selectedRows);
			}
		},
		getCheckboxProps: (record) => ({
			disabled: record.status !== 'Approved' || disableSelection, // Disable all if selection is disabled
		}),
		// Remove columnWidth to let Antd handle it automatically like StudentTable
	};

	return (
		<Table
			columns={columns}
			dataSource={data}
			rowKey="id"
			loading={loading}
			pagination={TablePagination}
			scroll={{ x: 600 }}
			rowSelection={rowSelection}
			size="middle"
		/>
	);
}
