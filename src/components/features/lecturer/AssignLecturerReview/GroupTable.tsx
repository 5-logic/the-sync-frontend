'use client';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { Lecturer } from '@/lib/services/review.service';

export interface GroupTableProps {
	id: string;
	code: string;
	name: string;
	title: string;
	supervisors: Lecturer[];
	reviewers: Lecturer[];
	submissionId?: string;
	phase?: string;
}

interface Props {
	groups: GroupTableProps[];
	columns: ColumnsType<GroupTableProps>;
	loading?: boolean;
	noMilestone?: boolean;
}

export default function GroupTable({
	groups,
	columns,
	loading,
	noMilestone,
}: Readonly<Props>) {
	return (
		<Table<GroupTableProps>
			rowKey="id"
			dataSource={groups}
			columns={columns}
			pagination={TablePagination}
			loading={loading}
			scroll={{ x: 'max-content' }}
			locale={noMilestone ? { emptyText: 'No Data (No Milestone)' } : undefined}
		/>
	);
}
