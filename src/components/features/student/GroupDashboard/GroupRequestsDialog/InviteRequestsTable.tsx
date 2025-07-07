import RequestsTable from '@/components/features/student/GroupDashboard/GroupRequestsDialog/RequestsTable';
import { type GroupRequest } from '@/lib/services/requests.service';

interface InviteRequestsTableProps {
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

export default function InviteRequestsTable({
	dataSource,
	loading,
	getPopconfirmProps,
}: InviteRequestsTableProps) {
	return (
		<RequestsTable
			dataSource={dataSource}
			loading={loading}
			requestType="invite"
			getPopconfirmProps={getPopconfirmProps}
		/>
	);
}
