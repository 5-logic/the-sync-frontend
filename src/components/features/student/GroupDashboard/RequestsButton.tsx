import { Badge, Button } from 'antd';
import { useEffect, useState } from 'react';

import GroupRequestsDialog from '@/components/features/student/GroupDashboard/GroupRequestsDialog';
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
	const { requests, fetchGroupRequests } = useRequestsStore();

	// Fetch requests count for badge
	useEffect(() => {
		fetchGroupRequests(group.id);
		// ESLint is disabled here because including store functions in dependencies
		// would cause infinite re-renders as Zustand functions get new references
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [group.id]);

	// Count pending requests
	const pendingRequestsCount = requests.filter(
		(req) => req.status === 'Pending',
	).length;

	console.log('RequestsButton render:', {
		totalRequests: requests.length,
		pendingRequestsCount,
		groupId: group.id,
	});

	const handleClick = () => {
		setDialogVisible(true);
	};

	return (
		<>
			<Badge count={pendingRequestsCount} size="small">
				<Button
					type="default"
					onClick={handleClick}
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
