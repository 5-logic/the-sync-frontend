import React from 'react';

interface MobileBackdropProps {
	isVisible: boolean;
	onClose: () => void;
}

export const MobileBackdrop: React.FC<MobileBackdropProps> = ({
	isVisible,
	onClose,
}) => {
	if (!isVisible) return null;
	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.45)',
				zIndex: 999,
				transition: 'opacity 0.2s',
			}}
			onClick={onClose}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					onClose();
				}
			}}
			aria-label="Close modal"
		/>
	);
};
