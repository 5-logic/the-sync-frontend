import { create } from 'zustand';

import requestService, {
	type GroupRequest,
} from '@/lib/services/requests.service';
import { cacheUtils } from '@/store/helpers/cacheHelpers';

interface RequestsState {
	requests: GroupRequest[];
	loading: boolean;
	error: string | null;
	fetchGroupRequests: (
		groupId: string,
		forceRefresh?: boolean,
	) => Promise<void>;
	fetchStudentRequests: (forceRefresh?: boolean) => Promise<void>;
	updateRequestStatus: (
		requestId: string,
		status: 'Approved' | 'Rejected',
	) => Promise<boolean>;
	cancelRequest: (requestId: string) => Promise<boolean>;
	clearRequests: () => void;
	clearCache: () => void;
}

const ENTITY_NAME = 'groupRequests';

// Helper function to handle cache initialization and checking
const handleCacheLogic = (
	cacheKey: string,
	forceRefresh: boolean,
	set: (partial: Partial<RequestsState>) => void,
): { shouldProceed: boolean; cachedData?: GroupRequest[] } => {
	// Initialize cache if not exists
	if (!cacheUtils.getCache(ENTITY_NAME)) {
		cacheUtils.initCache(ENTITY_NAME, { ttl: 5 * 60 * 1000 }); // 5 minutes
	}

	// Check cache first
	const cachedData = cacheUtils.get<GroupRequest[]>(ENTITY_NAME, cacheKey);

	console.log('Cache check:', {
		cacheKey,
		forceRefresh,
		hasCachedData: !!cachedData,
		cachedDataLength: cachedData?.length || 0,
	});

	if (!forceRefresh && cachedData) {
		console.log('Using cached data');
		set({ requests: cachedData, loading: false, error: null });
		return { shouldProceed: false, cachedData };
	}

	// Check if should fetch
	if (!forceRefresh && !cacheUtils.shouldFetch(ENTITY_NAME, forceRefresh)) {
		console.log('Skipping fetch due to cache policy');
		return { shouldProceed: false };
	}

	return { shouldProceed: true };
};

export const useRequestsStore = create<RequestsState>((set, get) => ({
	requests: [],
	loading: false,
	error: null,

	fetchGroupRequests: async (groupId: string, forceRefresh = false) => {
		const cacheKey = `group_${groupId}`;
		const cacheResult = handleCacheLogic(cacheKey, forceRefresh, set);

		if (!cacheResult.shouldProceed) {
			return;
		}

		console.log('Fetching fresh data from API...');
		set({ loading: true, error: null });
		try {
			const response = await requestService.getGroupRequests(groupId);
			if (response.success) {
				console.log('API response:', { dataLength: response.data.length });
				// Update cache
				cacheUtils.set(ENTITY_NAME, cacheKey, response.data);
				set({
					requests: response.data,
					loading: false,
				});
			} else {
				set({
					error: response.error || 'Failed to fetch requests',
					loading: false,
				});
			}
		} catch (error) {
			console.error('Error fetching group requests:', error);
			set({
				error:
					error instanceof Error ? error.message : 'Failed to fetch requests',
				loading: false,
			});
		}
	},

	fetchStudentRequests: async (forceRefresh = false) => {
		const cacheKey = 'student_requests';
		const cacheResult = handleCacheLogic(cacheKey, forceRefresh, set);

		if (!cacheResult.shouldProceed) {
			return;
		}

		console.log('Fetching fresh student requests from API...');
		set({ loading: true, error: null });
		try {
			const response = await requestService.getStudentRequests();
			if (response.success) {
				console.log('API response:', { dataLength: response.data.length });
				// Update cache
				cacheUtils.set(ENTITY_NAME, cacheKey, response.data);
				set({
					requests: response.data,
					loading: false,
				});
			} else {
				set({
					error: response.error || 'Failed to fetch student requests',
					loading: false,
				});
			}
		} catch (error) {
			console.error('Error fetching student requests:', error);
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to fetch student requests',
				loading: false,
			});
		}
	},

	updateRequestStatus: async (
		requestId: string,
		status: 'Approved' | 'Rejected',
	) => {
		try {
			const response = await requestService.updateRequestStatus(requestId, {
				status,
			});
			if (response.success) {
				// Update the request in local state
				const currentRequests = get().requests;
				const updatedRequests = currentRequests.map((request) =>
					request.id === requestId
						? { ...request, status, updatedAt: new Date().toISOString() }
						: request,
				);
				set({ requests: updatedRequests });

				// Update cache with new data
				const updatedRequest = updatedRequests.find(
					(req) => req.id === requestId,
				);
				if (updatedRequest) {
					const cacheKey = `group_${updatedRequest.groupId}`;
					cacheUtils.set(ENTITY_NAME, cacheKey, updatedRequests);
				}

				return true;
			} else {
				set({ error: response.error || 'Failed to update request status' });
				return false;
			}
		} catch (error) {
			console.error('Error updating request status:', error);
			set({
				error:
					error instanceof Error
						? error.message
						: 'Failed to update request status',
			});
			return false;
		}
	},

	cancelRequest: async (requestId: string) => {
		try {
			const response = await requestService.cancelStudentRequest(requestId);
			if (response.success) {
				// Remove the request from local state
				const currentRequests = get().requests;
				const updatedRequests = currentRequests.filter(
					(req) => req.id !== requestId,
				);
				set({ requests: updatedRequests });

				// Update cache with new data
				const cacheKey = 'student_requests';
				cacheUtils.set(ENTITY_NAME, cacheKey, updatedRequests);

				return true;
			} else {
				set({ error: response.error || 'Failed to cancel request' });
				return false;
			}
		} catch (error) {
			console.error('Error canceling request:', error);
			set({
				error:
					error instanceof Error ? error.message : 'Failed to cancel request',
			});
			return false;
		}
	},

	clearRequests: () => {
		set({ requests: [], error: null });
	},

	clearCache: () => {
		cacheUtils.clear(ENTITY_NAME);
	},
}));
