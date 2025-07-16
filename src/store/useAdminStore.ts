/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import adminService from '@/lib/services/admins.service';
import { Admin } from '@/schemas/admin';
import { cacheUtils } from '@/store/helpers/cacheHelpers';

interface AdminState {
	admin: Admin | null;
	loading: boolean;
	error: string | null;
	lastFetched: number | null;
	setAdmin: (admin: Admin | null) => void;
	clearAdmin: () => void;
	fetchAdmin: (forceRefresh?: boolean) => Promise<Admin | null>;
	updateAdmin: (updateAdminDto: Partial<Admin>) => Promise<Admin | null>;
	cache: {
		clear: () => void;
		stats: () => any;
		invalidate: () => void;
	};
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ADMIN_CACHE_KEY = 'admin';

export const useAdminStore = create<AdminState>()(
	persist(
		(set, get) => {
			// Initialize cache for admin entity
			cacheUtils.initCache<Admin>(ADMIN_CACHE_KEY, {
				ttl: CACHE_DURATION,
				enableLocalStorage: true,
			});

			return {
				admin: null,
				loading: false,
				error: null,
				lastFetched: null,

				setAdmin: (admin) => {
					set({ admin });
					if (admin) {
						cacheUtils.set(ADMIN_CACHE_KEY, admin.id, admin);
					}
				},
				clearAdmin: () => {
					set({ admin: null, loading: false, error: null, lastFetched: null });
					cacheUtils.clear(ADMIN_CACHE_KEY);
				},

				fetchAdmin: async (forceRefresh = false) => {
					const state = get();
					const now = Date.now();

					// Try to get id from localStorage
					let adminId = state.admin?.id;
					if (!adminId) {
						const cached = cacheUtils.getCache<Admin>(ADMIN_CACHE_KEY);
						if (cached && cached.entries.size > 0) {
							const firstEntry = Array.from(cached.entries.values())[0];
							adminId = firstEntry.key;
							set({ admin: firstEntry.data });
							return firstEntry.data;
						}
					}

					// Check cache validity
					if (adminId) {
						const cachedAdmin = cacheUtils.get<Admin>(ADMIN_CACHE_KEY, adminId);
						if (!forceRefresh && cachedAdmin) {
							set({ admin: cachedAdmin });
							return cachedAdmin;
						}
					}

					if (state.loading) {
						return null; // Already loading
					}

					try {
						set({ loading: true, error: null });
						const response = await adminService.findOne();
						if (response.success && response.data) {
							set({ admin: response.data, loading: false, lastFetched: now });
							cacheUtils.set(ADMIN_CACHE_KEY, response.data.id, response.data);
							return response.data;
						} else if (!response.success) {
							set({
								loading: false,
								error: (response as any).error || 'Failed to fetch admin',
								lastFetched: null,
							});
							return null;
						} else {
							set({
								loading: false,
								error: 'Failed to fetch admin',
								lastFetched: null,
							});
							return null;
						}
					} catch (error) {
						set({
							loading: false,
							error:
								error instanceof Error
									? error.message
									: 'Failed to fetch admin',
							lastFetched: null,
						});
						return null;
					}
				},

				updateAdmin: async (updateAdminDto: Partial<Admin>) => {
					try {
						set({ loading: true, error: null });
						const response = await adminService.update(updateAdminDto);
						if (response.success && response.data) {
							set({
								admin: response.data,
								loading: false,
								lastFetched: Date.now(),
							});
							cacheUtils.set(ADMIN_CACHE_KEY, response.data.id, response.data);
							return response.data;
						} else if (!response.success) {
							set({
								loading: false,
								error: (response as any).error || 'Failed to update admin',
							});
							return null;
						} else {
							set({ loading: false, error: 'Failed to update admin' });
							return null;
						}
					} catch (error) {
						set({
							loading: false,
							error:
								error instanceof Error
									? error.message
									: 'Failed to update admin',
						});
						return null;
					}
				},

				cache: {
					clear: () => cacheUtils.clear(ADMIN_CACHE_KEY),
					stats: () => cacheUtils.getStats(ADMIN_CACHE_KEY),
					invalidate: () => cacheUtils.clear(ADMIN_CACHE_KEY),
				},
			};
		},
		{
			name: 'admin-store',
			partialize: (state) => ({
				admin: state.admin,
				lastFetched: state.lastFetched,
				loading: false,
				error: null,
			}),
			storage: createJSONStorage(() => localStorage),
		},
	),
);
