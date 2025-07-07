import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import TablePagination from '@/components/common/TablePagination/TablePagination';
import JoinActions from '@/components/features/student/GroupDashboard/GroupRequestsDialog/JoinActions';
import RequestStatusTag from '@/components/features/student/GroupDashboard/GroupRequestsDialog/RequestStatusTag';
import StudentInfo from '@/components/features/student/GroupDashboard/GroupRequestsDialog/StudentInfo';
import { type GroupRequest } from '@/lib/services/requests.service';
import { formatDate } from '@/lib/utils/dateFormat';

interface JoinRequestsTableProps {
	readonly dataSource: GroupRequest[];
	readonly loading: boolean;
	readonly getPopconfirmProps: (
		requestId: string,
		status: 'Approved' | 'Rejected',
		requestType: 'Invite' | 'Join',
		studentName: string,
	) => {
		title: string;
		description: string;
		okText: string;
		cancelText: string;
		okType: 'danger' | 'primary';
		onConfirm: () => void;
	};
}

export default function JoinRequestsTable({
	dataSource,
	loading,
	getPopconfirmProps,
}: JoinRequestsTableProps) {
	const columns: ColumnsType<GroupRequest> = [
		{
			title: 'Student',
			key: 'student',
			render: (_, record) => <StudentInfo student={record.student} />,
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => <RequestStatusTag status={status} />,
		},
		{
			title: 'Requested At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (date: string) => formatDate(date),
		},
		{
			title: 'Action',
			key: 'action',
			align: 'center',
			render: (_, record) => (
				<JoinActions
					requestId={record.id}
					studentName={record.student.user.fullName}
					getPopconfirmProps={getPopconfirmProps}
				/>
			),
		},
	];

	return (
		<Table
			dataSource={dataSource}
			columns={columns}
			rowKey="id"
			loading={loading}
			pagination={TablePagination}
			locale={{
				emptyText: 'No join requests found',
			}}
		/>
	);
}
