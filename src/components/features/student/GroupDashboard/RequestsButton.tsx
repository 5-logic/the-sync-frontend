import { Badge, Button } from 'antd';
import { useEffect, useState } from 'react';

import GroupRequestsDialog from '@/components/features/student/GroupDashboard/GroupRequestsDialog';
import { useSessionData } from '@/hooks/auth/useAuth';
import { GroupDashboard } from '@/schemas/group';
import { useRequestsStore } from '@/store';

interface RequestsButtonProps {
	readonly group: GroupDashboard;
	readonly children: React.ReactNode;
}

export default function RequestsButton({
	group,
	children,
}: RequestsButtonProps) {
	const [dialogVisible, setDialogVisible] = useState(false);
	const { session } = useSessionData();
	const { requests, fetchGroupRequests } = useRequestsStore();

	// Check if current user is the leader
	const isCurrentUserLeader = session?.user?.id === group.leader.userId;

	// Fetch requests count for badge
	useEffect(() => {
		if (isCurrentUserLeader) {
			fetchGroupRequests(group.id);
		}
	}, [group.id, isCurrentUserLeader, fetchGroupRequests]);

	// Count pending requests
	const pendingRequestsCount = requests.filter(
		(req) => req.status === 'Pending',
	).length;

	const handleClick = () => {
		if (isCurrentUserLeader) {
			setDialogVisible(true);
		}
	};

	return (
		<>
			<Badge
				count={isCurrentUserLeader ? pendingRequestsCount : 0}
				size="small"
			>
				<Button
					type="default"
					onClick={handleClick}
					disabled={!isCurrentUserLeader}
					style={{
						borderRadius: 6,
						height: 32,
						fontSize: 14,
						padding: '4px 15px',
						whiteSpace: 'nowrap',
						border: '1px solid #d9d9d9',
						backgroundColor: '#fff',
						color: 'rgba(0, 0, 0, 0.88)',
						fontWeight: 400,
						display: 'flex',
						alignItems: 'center',
						gap: '6px',
					}}
				>
					{children}
				</Button>
			</Badge>

			<GroupRequestsDialog
				visible={dialogVisible}
				onCancel={() => setDialogVisible(false)}
				group={group}
			/>
		</>
	);
}
