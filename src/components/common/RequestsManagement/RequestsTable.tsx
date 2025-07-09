import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import {
	type ActionProps,
	type RequestsMode,
} from '@/components/common/RequestsManagement/types';
import TablePagination from '@/components/common/TablePagination/TablePagination';
import { type GroupRequest } from '@/lib/services/requests.service';
import { formatDate } from '@/lib/utils/dateFormat';

import RequestStatusTag from './RequestStatusTag';
import RequestsActions from './RequestsActions';
import StudentInfo from './StudentInfo';

interface GroupInfo {
	id: string;
	code: string;
	name: string;
}

interface GroupInfoDisplayProps {
	readonly group: GroupInfo;
}

function GroupInfoDisplay({ group }: GroupInfoDisplayProps) {
	return (
		<div>
			<div style={{ fontWeight: 500 }}>{group.name}</div>
			<div style={{ fontSize: '12px', color: '#666' }}>#{group.code}</div>
		</div>
	);
}

interface RequestsTableProps {
	readonly dataSource: GroupRequest[];
	readonly loading: boolean;
	readonly requestType: 'invite' | 'join';
	readonly mode: RequestsMode;
	readonly getActionProps: (
		requestId: string,
		requestType: 'Invite' | 'Join',
		targetName: string,
	) => ActionProps;
}

export default function RequestsTable({
	dataSource,
	loading,
	requestType,
	mode,
	getActionProps,
}: RequestsTableProps) {
	const isInviteType = requestType === 'invite';
	const isStudentMode = mode === 'student';

	const columns: ColumnsType<GroupRequest> = [
		{
			title: isStudentMode ? 'Group' : 'Student',
			key: isStudentMode ? 'group' : 'student',
			render: (_, record) =>
				isStudentMode ? (
					<GroupInfoDisplay group={record.group} />
				) : (
					<StudentInfo student={record.student} />
				),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => <RequestStatusTag status={status} />,
		},
		{
			title: isInviteType
				? isStudentMode
					? 'Invited At'
					: 'Sent At'
				: isStudentMode
					? 'Requested At'
					: 'Requested At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (date: string) => formatDate(date),
		},
		{
			title: 'Action',
			key: 'action',
			align: 'center',
			render: (_, record) => {
				const targetName = isStudentMode
					? record.group.name
					: record.student.user.fullName;

				return (
					<RequestsActions
						requestId={record.id}
						requestType={requestType}
						targetName={targetName}
						mode={mode}
						getActionProps={getActionProps}
					/>
				);
			},
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
					? 'No invitations found'
					: 'No join requests found',
			}}
		/>
	);
}
