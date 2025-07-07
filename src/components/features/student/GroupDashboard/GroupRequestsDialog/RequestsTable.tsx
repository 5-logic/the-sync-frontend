import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import TablePagination from '@/components/common/TablePagination/TablePagination';
import InviteActions from '@/components/features/student/GroupDashboard/GroupRequestsDialog/InviteActions';
import JoinActions from '@/components/features/student/GroupDashboard/GroupRequestsDialog/JoinActions';
import RequestStatusTag from '@/components/features/student/GroupDashboard/GroupRequestsDialog/RequestStatusTag';
import StudentInfo from '@/components/features/student/GroupDashboard/GroupRequestsDialog/StudentInfo';
import { type GroupRequest } from '@/lib/services/requests.service';
import { formatDate } from '@/lib/utils/dateFormat';

interface RequestsTableProps {
	readonly dataSource: GroupRequest[];
	readonly loading: boolean;
	readonly requestType: 'invite' | 'join';
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

export default function RequestsTable({
	dataSource,
	loading,
	requestType,
	getPopconfirmProps,
}: RequestsTableProps) {
	const isInviteType = requestType === 'invite';

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
			title: isInviteType ? 'Sent At' : 'Requested At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (date: string) => formatDate(date),
		},
		{
			title: 'Action',
			key: 'action',
			align: 'center',
			render: (_, record) =>
				isInviteType ? (
					<InviteActions
						requestId={record.id}
						studentName={record.student.user.fullName}
						getPopconfirmProps={getPopconfirmProps}
					/>
				) : (
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
				emptyText: isInviteType
					? 'No invite requests found'
					: 'No join requests found',
			}}
		/>
	);
}
