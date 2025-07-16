import { create } from 'zustand';

import groupService from '@/lib/services/groups.service';
import { GroupService as Group } from '@/schemas/group';

interface GroupsState {
	groups: Group[];
	loading: boolean;
	error: string | null;
	fetchGroups: () => Promise<void>;
	refetch: () => Promise<void>;
	clearGroups: () => void;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
	groups: [],
	loading: false,
	error: null,

	fetchGroups: async () => {
		const { loading } = get();

		// Prevent multiple simultaneous fetches
		if (loading) return;

		try {
			set({ loading: true, error: null });

			const response = await groupService.findAll();

			if (response.success) {
				set({ groups: response.data, error: null });
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

	clearGroups: () => {
		set({ groups: [], error: null });
	},

	refetch: async () => {
		// Force refresh by clearing and fetching again
		const { fetchGroups } = get();
		set({ loading: true, error: null });
		await fetchGroups();
	},
}));
