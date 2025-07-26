import { UserAddOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

import { RequestsButton } from '@/components/common/RequestsManagement';
import { useSessionData } from '@/hooks/auth/useAuth';
import { GroupDashboard } from '@/schemas/group';
import { useRequestsStore } from '@/store';

const { Title, Paragraph } = Typography;

interface GroupDashboardHeaderProps {
	readonly group: GroupDashboard;
}

export default function GroupDashboardHeader({
	group,
}: GroupDashboardHeaderProps) {
	const { session } = useSessionData();
	const { requests, fetchGroupRequests } = useRequestsStore();

	// Check if current user is the leader
	const isCurrentUserLeader = session?.user?.id === group.leader.userId;

	// Check if semester allows modifications (only show button when Preparing)
	const canShowRequestButton = group.semester.status === 'Preparing';

	// Only show requests button if user is leader AND semester is preparing
	const shouldShowRequestsButton = isCurrentUserLeader && canShowRequestButton;

	// Configuration for shared RequestsButton (group leader mode)
	const requestsConfig = {
		mode: 'group-leader' as const,
		title: 'Group Requests',
		fetchRequests: (forceRefresh?: boolean) =>
			fetchGroupRequests(group.id, forceRefresh),
		groupId: group.id,
	};

	return (
		<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div>
				<Title
					level={2}
					className="text-xl md:text-2xl font-bold text-gray-700 mb-0"
				>
					Group Dashboard
				</Title>
				<Paragraph className="text-gray-500 mb-0 mt-1">
					View your group information, members, and thesis progress
				</Paragraph>
			</div>
			{shouldShowRequestsButton && (
				<RequestsButton config={requestsConfig} requests={requests}>
					<UserAddOutlined />
					Request Invite/Join Group
				</RequestsButton>
			)}
		</div>
	);
}
