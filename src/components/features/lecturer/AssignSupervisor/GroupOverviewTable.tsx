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
			pagination={TablePagination}
			scroll={{ x: 'max-content' }}
			onChange={onChange}
		/>
	);
}
