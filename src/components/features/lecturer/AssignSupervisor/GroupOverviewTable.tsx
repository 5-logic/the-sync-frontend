'use client';

import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { memo } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { type SupervisorAssignmentData } from '@/store/useAssignSupervisorStore';

interface Props {
	readonly data: SupervisorAssignmentData[];
	readonly columns: ColumnsType<SupervisorAssignmentData>;
	readonly loading?: boolean;
	readonly rowKey?: keyof SupervisorAssignmentData;
	readonly onChange?: TableProps<SupervisorAssignmentData>['onChange'];
	readonly hideStatusColumn?: boolean; // New prop to hide the status column
}

/**
 * Optimized Table component for displaying supervisor assignment data
 * Uses React.memo to prevent unnecessary re-renders
 * Supports conditional column hiding for flexible display
 */
const GroupOverviewTable = memo<Props>(
	({
		data,
		columns,
		loading = false,
		rowKey = 'id',
		onChange,
		hideStatusColumn = false,
	}) => {
		// Filter out the status column if hideStatusColumn is true
		const filteredColumns = hideStatusColumn
			? columns.filter((col) => col.key !== 'status')
			: columns;

		return (
			<Table
				rowKey={rowKey as string}
				columns={filteredColumns}
				dataSource={data}
				loading={loading}
				pagination={TablePagination}
				scroll={{ x: 'max-content' }}
				onChange={onChange}
				size="middle"
			/>
		);
	},
);

GroupOverviewTable.displayName = 'GroupOverviewTable';

export default GroupOverviewTable;
