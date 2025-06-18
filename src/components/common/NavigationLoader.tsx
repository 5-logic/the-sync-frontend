'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

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

	const startNavigation = (targetPath: string) => {
		if (targetPath !== pathname && !isNavigating) {
			setIsNavigating(true);
			setTargetPath(targetPath);
			completedRef.current = false;
		}
	};

	const completeNavigation = () => {
		if (!completedRef.current) {
			completedRef.current = true;
			setIsNavigating(false);
			setTargetPath(null);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = undefined;
			}
		}
	}; // Enhanced navigation completion detection
	useEffect(() => {
		if (isNavigating && targetPath === pathname) {
			const detectPageReady = async () => {
				// Strategy 1: Fast React completion check (prioritized)
				const reactReadyPromise = new Promise<void>((resolve) => {
					// Use immediate RAF for faster response
					requestAnimationFrame(() => {
						requestAnimationFrame(() => resolve());
					});
				});

				// Strategy 2: DOM content check
				const contentReadyPromise = new Promise<void>((resolve) => {
					let attempts = 0;
					const maxAttempts = 10; // Reduced for faster response

					const checkContent = () => {
						attempts++;

						// Check for main content containers
						const contentSelectors = [
							'.ant-layout-content',
							'[role="main"]',
							'main',
							'.main-content',
							'.page-content',
						];

						let hasValidContent = false;

						for (const selector of contentSelectors) {
							const element = document.querySelector(selector);
							if (element) {
								// Check if element has meaningful content
								const hasChildren = element.children.length > 0;
								const hasText = (element.textContent?.trim().length ?? 0) > 10;
								const hasMinHeight =
									element.getBoundingClientRect().height > 100;

								if (hasChildren || hasText || hasMinHeight) {
									hasValidContent = true;
									break;
								}
							}
						}

						if (hasValidContent || attempts >= maxAttempts) {
							resolve();
						} else {
							setTimeout(checkContent, 15); // Faster polling
						}
					};

					checkContent();
				});

				// Strategy 3: Document ready state
				const documentReadyPromise = new Promise<void>((resolve) => {
					if (document.readyState === 'complete') {
						resolve();
					} else {
						const handler = () => {
							if (document.readyState === 'complete') {
								document.removeEventListener('readystatechange', handler);
								resolve();
							}
						};
						document.addEventListener('readystatechange', handler);

						// Quick timeout for this strategy
						setTimeout(() => {
							document.removeEventListener('readystatechange', handler);
							resolve();
						}, 150);
					}
				});

				try {
					// Wait for the fastest strategy to complete
					await Promise.race([
						reactReadyPromise,
						contentReadyPromise,
						documentReadyPromise,
						// Fallback after short delay
						new Promise<void>((resolve) => setTimeout(resolve, 100)),
					]);

					// Minimal buffer for smooth UI transition
					await new Promise((resolve) => setTimeout(resolve, 25));

					completeNavigation();
				} catch (error) {
					console.warn('Navigation detection error:', error);
					// Quick emergency fallback
					setTimeout(completeNavigation, 50);
				}
			};

			detectPageReady();
		}
	}, [pathname, isNavigating, targetPath]);

	// Safety timeout - reduced for better responsiveness
	useEffect(() => {
		if (isNavigating) {
			timeoutRef.current = setTimeout(() => {
				console.warn('Navigation timeout - completing forcefully');
				completeNavigation();
			}, 2000); // Reduced from 3000ms

			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
					timeoutRef.current = undefined;
				}
			};
		}
	}, [isNavigating]);
	const contextValue: NavigationContextType = {
		isNavigating,
		targetPath,
		startNavigation,
		completeNavigation,
	};
	return (
		<NavigationContext.Provider value={contextValue}>
			{children}
		</NavigationContext.Provider>
	);
}
