import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { Group } from '@/lib/services/groups.service';

interface CustomGroupTableProps {
	readonly data: Group[];
	readonly columns: ColumnsType<Group>;
}

export default function CustomGroupTable({
	data,
	columns,
}: CustomGroupTableProps) {
	return (
		<Table
			dataSource={data}
			columns={columns}
			rowKey="id"
			pagination={TablePagination}
		/>
	);
}
