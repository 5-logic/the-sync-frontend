'use client';

import { Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { Student } from '@/schemas/student';

interface Props {
	data: ReadonlyArray<Student>;
	onSelectionChange?: (selectedRowKeys: string[]) => void;
	selectedRowKeys?: string[];
	showOnlyUngrouped?: boolean;
	majorNamesMap?: Record<string, string>;
	loading?: boolean;
}

export default function StudentTable({
	data,
	onSelectionChange,
	selectedRowKeys,
	showOnlyUngrouped = true,
	majorNamesMap = {},
	loading = false,
}: Readonly<Props>) {
	const filteredData = showOnlyUngrouped
		? data.filter((student) => student.isActive) // Filter active students for ungrouped
		: data;

	const columns: ColumnsType<Student> = [
		{
			title: 'Name',
			dataIndex: 'fullName',
		},
		{
			title: 'Email',
			dataIndex: 'email',
		},
		{
			title: 'Phone Number',
			dataIndex: 'phoneNumber',
		},
		{
			title: 'Major',
			dataIndex: 'majorId',
			render: (majorId: string) => {
				const majorName = majorNamesMap[majorId];
				if (majorName) {
					return majorName;
				}
				// Fallback: if major name not found, show majorId
				return majorId || 'N/A';
			},
		},
	];

	return (
		<Spin spinning={loading} tip="Loading students...">
			<Table
				rowKey="id"
				columns={columns}
				dataSource={filteredData}
				rowSelection={
					onSelectionChange
						? {
								type: 'radio',
								selectedRowKeys,
								onChange: (selectedKeys) =>
									onSelectionChange(selectedKeys as string[]),
							}
						: undefined
				}
				pagination={TablePagination}
				scroll={{ x: 'max-content' }}
			/>
		</Spin>
	);
}
