'use client';

import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { type SupervisorAssignmentData } from '@/hooks/lecturer/useAssignSupervisor';

interface Props {
	readonly data: SupervisorAssignmentData[];
	readonly columns: ColumnsType<SupervisorAssignmentData>;
	readonly rowKey?: keyof SupervisorAssignmentData;
	readonly onChange?: TableProps<SupervisorAssignmentData>['onChange'];
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
