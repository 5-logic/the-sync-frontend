import { create } from 'zustand';

import groupService, { type Group } from '@/lib/services/groups.service';
import { cacheUtils } from '@/store/helpers/cacheHelpers';

// Initialize cache for groups
cacheUtils.initCache<Group[]>('groups', {
	ttl: 5 * 60 * 1000, // 5 minutes
	maxSize: 1000, // Support up to 1000 groups in cache
	enableLocalStorage: false, // Don't store in localStorage
});

interface GroupsState {
	groups: Group[];
	loading: boolean;
	error: string | null;
	fetchGroups: (force?: boolean) => Promise<void>;
	refetch: () => Promise<void>;
	clearGroups: () => void;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
	groups: [],
	loading: false,
	error: null,

	fetchGroups: async (force = false) => {
		const { loading } = get();

		// Prevent multiple simultaneous fetches unless forced
		if (loading && !force) return;

		const cachedGroups = cacheUtils.get<Group[]>('groups', 'all');
		if (!force && cachedGroups) {
			// Use cached data
			set({ groups: cachedGroups });
			return;
		}

		try {
			set({ loading: true, error: null });

			const response = await groupService.findAll();

			if (response.success) {
				set({ groups: response.data, error: null });
				cacheUtils.set('groups', 'all', response.data);
			} else {
				set({ error: response.error || 'Failed to fetch groups' });
			}
		} catch (error) {
			console.error('Error fetching groups:', error);
			set({
				error:
					error instanceof Error
						? error.message
						: 'An unexpected error occurred',
			});
		} finally {
			set({ loading: false });
		}
	},

	refetch: async () => {
		await get().fetchGroups(true);
	},

	clearGroups: () => {
		set({ groups: [], error: null });
	},
}));
