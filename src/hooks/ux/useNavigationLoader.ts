'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useNavigationContext } from '@/components/common/NavigationLoader';

export interface NavigationLoaderState {
	isNavigating: boolean;
	targetPath: string | null;
	navigateWithLoading: (path: string) => void;
}

/**
 * Hook to manage navigation loading states
 * Provides smooth loading transitions between pages
 * Works both with and without NavigationLoader context
 */
export function useNavigationLoader(): NavigationLoaderState {
	const router = useRouter();
	const pathname = usePathname();
	const context = useNavigationContext();

	// Fallback state when not within NavigationLoader context
	const [fallbackNavigating, setFallbackNavigating] = useState(false);
	const [fallbackTargetPath, setFallbackTargetPath] = useState<string | null>(
		null,
	);

	// Use context if available, otherwise use fallback state
	const isNavigating = context?.isNavigating ?? fallbackNavigating;
	const targetPath = context?.targetPath ?? fallbackTargetPath;
	const startNavigation = context?.startNavigation;

	// Reset fallback state when pathname changes
	useEffect(() => {
		if (!context && fallbackNavigating && fallbackTargetPath === pathname) {
			setFallbackNavigating(false);
			setFallbackTargetPath(null);
		}
	}, [pathname, fallbackNavigating, fallbackTargetPath, context]);
	// Enhanced navigation function with immediate loading state
	const navigateWithLoading = useCallback(
		(path: string) => {
			if (path === pathname) {
				return; // Don't navigate to current path
			}

			if (startNavigation) {
				// Use context if available
				startNavigation(path);
			} else {
				// Fallback mode without context
				setFallbackNavigating(true);
				setFallbackTargetPath(path);
			}

			// Immediate navigation for better responsiveness
			// The loading state is already set above
			router.push(path);
		},
		[router, pathname, startNavigation],
	);
	return {
		isNavigating,
		targetPath,
		navigateWithLoading,
	};
}
