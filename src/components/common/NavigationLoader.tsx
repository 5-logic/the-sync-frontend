'use client';

import { usePathname } from 'next/navigation';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

interface NavigationContextType {
	isNavigating: boolean;
	targetPath: string | null;
	startNavigation: (targetPath: string) => void;
	completeNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigationContext = () => {
	const context = useContext(NavigationContext);
	return context; // Return null if not within provider instead of throwing
};

interface NavigationLoaderProps {
	readonly children: React.ReactNode;
}

/**
 * Enhanced Navigation Loader Component
 * Provides immediate feedback and smart completion detection for better UX
 */
export default function NavigationLoader({ children }: NavigationLoaderProps) {
	const pathname = usePathname();
	const [isNavigating, setIsNavigating] = useState(false);
	const [targetPath, setTargetPath] = useState<string | null>(null);
	const timeoutRef = useRef<NodeJS.Timeout>();
	const completedRef = useRef(false);
	const startNavigation = useCallback(
		(targetPath: string) => {
			if (targetPath !== pathname && !isNavigating) {
				setIsNavigating(true);
				setTargetPath(targetPath);
				completedRef.current = false;
			}
		},
		[pathname, isNavigating],
	);
	const completeNavigation = useCallback(() => {
		if (!completedRef.current) {
			completedRef.current = true;
			setIsNavigating(false);
			setTargetPath(null);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = undefined;
			}
		}
	}, []); // Helper function to check if content is meaningful and ready
	const hasGoodContent = useCallback((contentElement: Element): boolean => {
		const content = contentElement.innerHTML;
		const hasUIElements =
			content.includes('ant-') || // Ant Design components
			content.includes('class=') || // Has styled elements
			content.includes('button') || // Interactive elements
			content.includes('form') || // Form elements
			content.includes('table') || // Data display
			content.includes('card') || // Card components
			content.includes('menu') || // Navigation
			content.includes('list') || // List components
			content.includes('input') || // Input fields
			content.includes('div'); // Basic HTML elements

		const hasQueryableElements = Boolean(
			contentElement.querySelector('button') || // Has buttons
				contentElement.querySelector('form') || // Has forms
				contentElement.querySelector('table') || // Has tables
				contentElement.querySelector('input') || // Has inputs
				contentElement.querySelector('.ant-') || // Ant Design elements
				contentElement.querySelector('[class*="ant-"]') || // Any Ant Design class
				contentElement.querySelector('[class]'), // Any element with class
		);

		return (
			content.length > 200 && // Has substantial content
			contentElement.children.length > 0 && // Has child elements
			(hasUIElements || hasQueryableElements) // Check for common UI indicators
		);
	}, []);

	// Helper function to create content checking strategy
	const createContentCheckStrategy = useCallback((): Promise<void> => {
		return new Promise<void>((resolve) => {
			let attempts = 0;
			const maxAttempts = 15; // Reduced attempts

			const checkContent = () => {
				attempts++;

				// Simple content presence check
				const contentElement =
					document.querySelector('.ant-layout-content') ||
					document.querySelector('[role="main"]') ||
					document.querySelector('main');

				if (contentElement && hasGoodContent(contentElement)) {
					// Quick stability check
					setTimeout(() => {
						if (contentElement.innerHTML.length > 200) {
							resolve();
						} else if (attempts < maxAttempts) {
							setTimeout(checkContent, 80);
						} else {
							resolve();
						}
					}, 30);
					return;
				}

				if (attempts >= maxAttempts) {
					resolve();
				} else {
					setTimeout(checkContent, 80);
				}
			};

			checkContent();
		});
	}, [hasGoodContent]);

	// Helper function to detect when page is ready
	const detectPageReady = useCallback(async () => {
		// Simplified detection with multiple strategies
		const strategies = [
			// Strategy 1: Quick content check
			createContentCheckStrategy(),
			// Strategy 2: Fast fallback
			new Promise<void>((resolve) => setTimeout(resolve, 1500)),
		];

		try {
			// Use the fastest strategy
			await Promise.race(strategies);

			// Small delay for smooth transition
			await new Promise((resolve) => setTimeout(resolve, 50));

			completeNavigation();
		} catch (error) {
			console.warn('Navigation detection error:', error);
			setTimeout(completeNavigation, 50);
		}
	}, [createContentCheckStrategy, completeNavigation]);

	// Enhanced navigation completion detection - simplified and more reliable
	useEffect(() => {
		if (isNavigating && targetPath === pathname) {
			detectPageReady();
		}
	}, [pathname, isNavigating, targetPath, detectPageReady]); // Safety timeout - reduced for better responsiveness
	useEffect(() => {
		if (isNavigating) {
			timeoutRef.current = setTimeout(() => {
				completeNavigation();
			}, 2500); // Reduced to 2.5 seconds

			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
					timeoutRef.current = undefined;
				}
			};
		}
	}, [isNavigating, completeNavigation]);

	const contextValue: NavigationContextType = useMemo(
		() => ({
			isNavigating,
			targetPath,
			startNavigation,
			completeNavigation,
		}),
		[isNavigating, targetPath, startNavigation, completeNavigation],
	);

	return (
		<NavigationContext.Provider value={contextValue}>
			{children}
		</NavigationContext.Provider>
	);
}
