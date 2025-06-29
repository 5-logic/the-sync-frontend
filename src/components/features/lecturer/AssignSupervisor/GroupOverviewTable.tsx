'use client';

import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { ExtendedGroup } from '@/data/group';

interface Props {
	data: ExtendedGroup[];
	columns: ColumnsType<ExtendedGroup>;
	rowKey?: keyof ExtendedGroup;
	onChange?: TableProps<ExtendedGroup>['onChange'];
}

export default function GroupOverviewTable({
	data,
	columns,
	rowKey = 'id',
	onChange,
}: Props) {
	return (
		<Table
			rowKey={rowKey as string}
			columns={columns}
			dataSource={data}
			pagination={TablePagination} // ✅ dùng cấu hình chung của hệ thống
			scroll={{ x: 'max-content' }}
			onChange={onChange}
		/>
	);
}
