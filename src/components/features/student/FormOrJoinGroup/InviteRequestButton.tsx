'use client';

import { Button, Grid } from 'antd';

const { useBreakpoint } = Grid;

const BUTTON_TEXT = 'Request Join / Invite';
const BUTTON_STYLES = {
	borderRadius: 6,
	height: 32,
	fontSize: 14,
	padding: '4px 15px',
	whiteSpace: 'nowrap' as const,
	border: '1px solid #d9d9d9',
	backgroundColor: '#fff',
	color: 'rgba(0, 0, 0, 0.88)',
	fontWeight: 400,
};

const CONTAINER_STYLES = {
	base: {
		textAlign: 'right' as const,
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		height: '100%',
	},
	mobile: {
		marginTop: 16,
	},
	desktop: {
		marginTop: 0,
	},
};

export default function InviteRequestButton() {
	const screens = useBreakpoint();
	const isResponsiveMobile = !screens.md;

	const handleInviteRequest = () => {
		console.log('Request Join / Invite clicked');
	};

	const containerStyle = {
		...CONTAINER_STYLES.base,
		...(isResponsiveMobile
			? CONTAINER_STYLES.mobile
			: CONTAINER_STYLES.desktop),
	};

	return (
		<div style={containerStyle}>
			<Button
				type="default"
				onClick={handleInviteRequest}
				style={BUTTON_STYLES}
				title={BUTTON_TEXT}
				aria-label={BUTTON_TEXT}
			>
				{BUTTON_TEXT}
			</Button>
		</div>
	);
}
