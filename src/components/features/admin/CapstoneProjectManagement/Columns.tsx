import { Select, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

import { highlightText } from '@/components/features/admin/CapstoneProjectManagement/HighlightText';
import { RowSpanCell } from '@/components/features/admin/CapstoneProjectManagement/RowSpanCell';
import { GroupTableData } from '@/components/features/admin/CapstoneProjectManagement/useGroupTableData';

// Dùng chung cho cả bảng GroupResults và GroupManagement
export const getColumns = (
	searchText: string,
	options?: {
		showAbbreviationSupervisor?: boolean;
		showStatus?: boolean;
		getDisplayStatus?: (originalStatus: string, studentId: string) => string;
		statusUpdates?: Record<string, string>;
		handleStatusChange?: (studentId: string, newStatus: string) => void;
	},
): ColumnsType<GroupTableData> => {
	const {
		showAbbreviationSupervisor = false,
		showStatus = false,
		getDisplayStatus = () => '',
		statusUpdates = {},
		handleStatusChange = () => {},
	} = options || {};

	const baseColumns: ColumnsType<GroupTableData> = [
		{
			title: 'No.',
			key: 'no',
			align: 'center',
			render: (_, __, index) => index + 1,
		},
		{
			title: 'Student ID',
			dataIndex: 'studentId',
			key: 'studentId',
			align: 'center',
			render: (text) => highlightText(text, searchText),
		},
		{
			title: 'Full Name',
			dataIndex: 'name',
			key: 'name',
			align: 'center',
			render: (text) => highlightText(text, searchText),
		},
		{
			title: 'Major',
			dataIndex: 'major',
			key: 'major',
			align: 'center',
			render: (text, record) =>
				RowSpanCell(highlightText(text, searchText), record.rowSpanMajor),
		},
		{
			title: 'Thesis Title',
			dataIndex: 'thesisName',
			key: 'thesisName',
			align: 'center',
			render: (text, record) =>
				RowSpanCell(highlightText(text, searchText), record.rowSpanGroup),
		},
	];

	if (showAbbreviationSupervisor) {
		baseColumns.push(
			{
				title: 'Abbreviation',
				dataIndex: 'abbreviation',
				key: 'abbreviation',
				align: 'center',
				render: (abbreviation, record) =>
					RowSpanCell(
						<Tag color="blue">{highlightText(abbreviation!, searchText)}</Tag>,
						record.rowSpanGroup,
					),
			},
			{
				title: 'Supervisor',
				dataIndex: 'supervisor',
				key: 'supervisor',
				align: 'center',
				render: (supervisor, record) =>
					RowSpanCell(
						supervisor ? (
							<div style={{ textAlign: 'left' }}>
								{supervisor
									.split(', ')
									.map((sup: React.Key | null | undefined) => (
										<div key={sup}>
											{highlightText(sup ? String(sup) : '', searchText)}
										</div>
									))}
							</div>
						) : (
							<span style={{ color: '#999' }}>-</span>
						),
						record.rowSpanGroup,
					),
			},
		);
	}

	baseColumns.push({
		title: 'Semester',
		dataIndex: 'semester',
		key: 'semester',
		align: 'center',
		render: (text, record) =>
			RowSpanCell(highlightText(text, searchText), record.rowSpanSemester),
	});

	if (showStatus) {
		baseColumns.push({
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			align: 'center',
			render: (status, record) => {
				const currentStatus = getDisplayStatus(status!, record.studentId);
				const isModified = statusUpdates[record.studentId] !== undefined;
				return (
					<Select
						value={currentStatus}
						onChange={(value) => handleStatusChange(record.studentId, value)}
						style={{
							width: 100,
							border: isModified ? '2px solid #faad14' : undefined,
						}}
						size="small"
					>
						<Select.Option value="Pass">
							<span style={{ color: '#52c41a' }}>Pass</span>
						</Select.Option>
						<Select.Option value="Failed">
							<span style={{ color: '#ff4d4f' }}>Failed</span>
						</Select.Option>
					</Select>
				);
			},
		});
	}

	return baseColumns;
};
