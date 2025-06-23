'use client';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { ExtendedGroup } from '@/data/group';

interface Props {
	readonly data: ExtendedGroup[];
	readonly columns: ColumnsType<ExtendedGroup>;
	readonly showPagination?: boolean;
	readonly rowKey?: keyof ExtendedGroup;
}

export default function GroupOverviewTable({
	data,
	columns,
	rowKey = 'id',
}: Props) {
	return (
		<Table
			rowKey={rowKey as string}
			columns={columns}
			dataSource={data}
			pagination={TablePagination}
			scroll={{ x: 'max-content' }}
		/>
	);
}
