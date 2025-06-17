import { useEffect } from 'react';

import { useAppStore } from '@/store/useAppStore';

/**
 * Custom hook để xử lý responsive layout logic
 * - Detect mobile screen size
 * - Auto collapse sidebar on mobile
 * - Lock body scroll when sidebar open on mobile
 */
export const useResponsiveLayout = () => {
	const { sidebarCollapsed, setSidebarCollapsed, isMobile, setIsMobile } =
		useAppStore();

	// Detect mobile screen size
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, [setIsMobile]);

	// Auto collapse sidebar on mobile when first loading
	useEffect(() => {
		if (isMobile) {
			setSidebarCollapsed(true);
		}
	}, [isMobile, setSidebarCollapsed]);

	// Lock body scroll when sidebar is open on mobile
	useEffect(() => {
		if (isMobile && !sidebarCollapsed) {
			// Disable body scroll when sidebar is open on mobile
			document.body.style.overflow = 'hidden';
			document.body.style.position = 'fixed';
			document.body.style.width = '100%';
		} else {
			// Restore body scroll
			document.body.style.overflow = '';
			document.body.style.position = '';
			document.body.style.width = '';
		}

		// Cleanup on unmount
		return () => {
			document.body.style.overflow = '';
			document.body.style.position = '';
			document.body.style.width = '';
		};
	}, [isMobile, sidebarCollapsed]);

	return {
		isMobile,
		sidebarCollapsed,
		setSidebarCollapsed,
	};
};
