import { Select, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

import { highlightText } from '@/components/features/admin/CapstoneProjectManagement/HighlightText';
import { RowSpanCell } from '@/components/features/admin/CapstoneProjectManagement/RowSpanCell';
import { type GroupTableData } from '@/store';

// Dùng chung cho cả bảng GroupResults và GroupManagement
export const getColumns = (
	searchText: string,
	options?: {
		showAbbreviationSupervisor?: boolean;
		showStatus?: boolean;
		showSemester?: boolean; // Add option to show/hide semester column
		getDisplayStatus?: (originalStatus: string, studentId: string) => string;
		statusUpdates?: Record<string, string>;
		handleStatusChange?: (studentId: string, newStatus: string) => void;
	},
): ColumnsType<GroupTableData> => {
	const {
		showAbbreviationSupervisor = false,
		showStatus = false,
		showSemester = true, // Default to true for backward compatibility
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
			render: (text) => (
				<div style={{ textAlign: 'left' }}>
					{highlightText(text, searchText)}
				</div>
			),
		},
		{
			title: 'Major',
			dataIndex: 'major',
			key: 'major',
			align: 'center',
			render: (text) => RowSpanCell(highlightText(text, searchText)),
			onCell: (record) => ({ rowSpan: record.rowSpanMajor }),
		},
		{
			title: 'Thesis Title',
			dataIndex: 'thesisName',
			key: 'thesisName',
			align: 'center',
			width: 300,
			render: (text) =>
				RowSpanCell(
					text && text !== 'Not assigned' ? (
						highlightText(text, searchText)
					) : (
						<span style={{ color: '#999' }}>-</span>
					),
				),
			onCell: (record) => ({ rowSpan: record.rowSpanGroup }),
		},
	];

	if (showAbbreviationSupervisor) {
		baseColumns.push(
			{
				title: 'Abbreviation',
				dataIndex: 'abbreviation',
				key: 'abbreviation',
				align: 'center',
				render: (abbreviation) =>
					RowSpanCell(
						<Tag color="blue">{highlightText(abbreviation, searchText)}</Tag>,
					),
				onCell: (record) => ({ rowSpan: record.rowSpanGroup }),
			},
			{
				title: 'Supervisor',
				dataIndex: 'supervisor',
				key: 'supervisor',
				align: 'center',
				render: (supervisor) =>
					RowSpanCell(
						supervisor ? (
							<div style={{ textAlign: 'center' }}>
								{supervisor.split(', ').map((sup: string) => (
									<div key={sup.trim()}>
										{highlightText(sup.trim(), searchText)}
									</div>
								))}
							</div>
						) : (
							<span style={{ color: '#999' }}>-</span>
						),
					),
				onCell: (record) => ({ rowSpan: record.rowSpanGroup }),
			},
		);
	}

	if (showSemester) {
		baseColumns.push({
			title: 'Semester',
			dataIndex: 'semester',
			key: 'semester',
			align: 'center',
			render: (text) => RowSpanCell(highlightText(text, searchText)),
			onCell: (record) => ({ rowSpan: record.rowSpanSemester }),
		});
	}

	if (showStatus) {
		baseColumns.push({
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			align: 'center',
			render: (status, record) => {
				const currentStatus = getDisplayStatus(status, record.studentId);
				const isModified = statusUpdates[record.studentId] !== undefined;

				// Show default status if no status is set initially
				const displayStatus = currentStatus || '';

				return (
					<Select
						value={displayStatus}
						onChange={(value) => handleStatusChange(record.studentId, value)}
						style={{
							width: 100,
							border: isModified ? '2px solid #faad14' : undefined,
						}}
						size="small"
						placeholder="Select"
					>
						<Select.Option value="Passed">
							<span style={{ color: '#52c41a' }}>Passed</span>
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
