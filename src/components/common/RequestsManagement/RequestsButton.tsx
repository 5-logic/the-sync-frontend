import { Badge, Button } from 'antd';
import { useEffect, useState } from 'react';

import RequestsDialog from '@/components/common/RequestsManagement/RequestsDialog';
import { type RequestsButtonProps } from '@/components/common/RequestsManagement/types';

export default function RequestsButton({
	config,
	children,
	requests,
}: Readonly<RequestsButtonProps>) {
	const [dialogVisible, setDialogVisible] = useState(false);

	// Fetch requests on mount
	useEffect(() => {
		config.fetchRequests();
		// ESLint is disabled here because including store functions in dependencies
		// would cause infinite re-renders as Zustand functions get new references
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [config.groupId]);

	// Count pending requests
	const pendingRequestsCount = requests.filter(
		(req) => req.status === 'Pending',
	).length;

	const handleClick = () => {
		setDialogVisible(true);
	};

	const handleRequestsUpdate = () => {
		// Refresh requests to update badge count
		config.fetchRequests(true);
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

			<RequestsDialog
				visible={dialogVisible}
				onCancel={() => setDialogVisible(false)}
				config={config}
				onRequestsUpdate={handleRequestsUpdate}
			/>
		</>
	);
}
