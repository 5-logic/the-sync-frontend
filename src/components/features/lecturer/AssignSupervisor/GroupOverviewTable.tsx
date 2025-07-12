'use client';

import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { ExtendedGroup } from '@/data/group';

interface Props {
	readonly data: ExtendedGroup[];
	readonly columns: ColumnsType<ExtendedGroup>;
	readonly rowKey?: keyof ExtendedGroup;
	readonly onChange?: TableProps<ExtendedGroup>['onChange'];
	readonly hideStatusColumn?: boolean; // New prop to hide the status column
}

export default function GroupOverviewTable({
	data,
	columns,
	rowKey = 'id',
	onChange,
	hideStatusColumn = false, // Default to false
}: Props) {
	// Filter out the status column if hideStatusColumn is true
	const filteredColumns = hideStatusColumn
		? columns.filter((col) => col.key !== 'status')
		: columns;

	return (
		<Table
			rowKey={rowKey as string}
			columns={filteredColumns}
			dataSource={data}
			pagination={TablePagination}
			scroll={{ x: 'max-content' }}
			onChange={onChange}
		/>
	);
}
