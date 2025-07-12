'use client';

import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { type SupervisorAssignmentData } from '@/hooks/lecturer/useAssignSupervisor';

interface Props {
	readonly data: SupervisorAssignmentData[];
	readonly columns: ColumnsType<SupervisorAssignmentData>;
	readonly loading?: boolean;
	readonly rowKey?: keyof SupervisorAssignmentData;
	readonly onChange?: TableProps<SupervisorAssignmentData>['onChange'];
}
export default function GroupOverviewTable({
	data,
	columns,
	loading = false,
	rowKey = 'id',
	onChange,
}: Props) {
	return (
		<Table
			rowKey={rowKey as string}
			columns={columns}
			dataSource={data}
			loading={loading}
			pagination={TablePagination}
			scroll={{ x: 'max-content' }}
			onChange={onChange}
		/>
	);
}
