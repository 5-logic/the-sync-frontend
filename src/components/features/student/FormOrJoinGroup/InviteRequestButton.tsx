'use client';

import { Button, Grid } from 'antd';

const { useBreakpoint } = Grid;

export default function InviteRequestButton() {
	const screens = useBreakpoint();

	const isResponsiveMobile = !screens.md;

	const handleInviteRequest = () => {
		console.log('Request Join / Invite clicked');
	};

	const getButtonText = () => {
		return 'Request Join / Invite';
	};

	return (
		<div
			style={{
				textAlign: 'right',
				marginTop: isResponsiveMobile ? 16 : 0,
				display: 'flex',
				justifyContent: 'flex-end',
				alignItems: 'center',
				height: '100%',
			}}
		>
			<Button
				type="default"
				onClick={handleInviteRequest}
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
				}}
				title="Request Join / Invite"
			>
				{getButtonText()}
			</Button>
		</div>
	);
}
