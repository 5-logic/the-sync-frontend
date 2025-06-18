import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
	// Sidebar state
	sidebarCollapsed: boolean;
	setSidebarCollapsed: (collapsed: boolean) => void;
	toggleSidebar: () => void;

	// Mobile state
	isMobile: boolean;
	setIsMobile: (isMobile: boolean) => void;
}

export const useAppStore = create<AppState>()(
	devtools(
		(set) => ({
			// Sidebar state
			sidebarCollapsed: false,
			setSidebarCollapsed: (collapsed) =>
				set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),
			toggleSidebar: () =>
				set(
					(state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
					false,
					'toggleSidebar',
				),

			// Mobile state
			isMobile: false,
			setIsMobile: (isMobile) => set({ isMobile }, false, 'setIsMobile'),
		}),
		{
			name: 'app-store',
		},
	),
);
