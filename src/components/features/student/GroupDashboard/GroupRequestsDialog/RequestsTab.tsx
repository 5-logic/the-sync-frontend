import InviteRequestsTable from '@/components/features/student/GroupDashboard/GroupRequestsDialog/InviteRequestsTable';
import JoinRequestsTable from '@/components/features/student/GroupDashboard/GroupRequestsDialog/JoinRequestsTable';
import RequestsSearchControls from '@/components/features/student/GroupDashboard/GroupRequestsDialog/RequestsSearchControls';
import type { GroupRequest } from '@/lib/services/requests.service';

interface RequestsTabProps {
	readonly requestType: 'invite' | 'join';
	readonly dataSource: GroupRequest[];
	readonly loading: boolean;
	readonly searchText: string;
	readonly statusFilter: string | undefined;
	readonly onSearchChange: (value: string) => void;
	readonly onStatusFilterChange: (value: string | undefined) => void;
	readonly onRefresh: () => void;
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

export default function RequestsTab({
	requestType,
	dataSource,
	loading,
	searchText,
	statusFilter,
	onSearchChange,
	onStatusFilterChange,
	onRefresh,
	getPopconfirmProps,
}: RequestsTabProps) {
	return (
		<div>
			<RequestsSearchControls
				searchText={searchText}
				statusFilter={statusFilter}
				loading={loading}
				onSearchChange={onSearchChange}
				onStatusFilterChange={onStatusFilterChange}
				onRefresh={onRefresh}
			/>

			{requestType === 'invite' ? (
				<InviteRequestsTable
					dataSource={dataSource}
					loading={loading}
					getPopconfirmProps={getPopconfirmProps}
				/>
			) : (
				<JoinRequestsTable
					dataSource={dataSource}
					loading={loading}
					getPopconfirmProps={getPopconfirmProps}
				/>
			)}
		</div>
	);
}
