import lecturerService from '@/lib/services/lecturers.service';
import thesisService from '@/lib/services/theses.service';
import { isTextMatch } from '@/lib/utils';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { Thesis } from '@/schemas/thesis';
import {
	ExtendThesisStore,
	createThesisStoreFactory,
} from '@/store/helpers/thesisStoreHelpers';

// Extended thesis with lecturer information
export interface ThesisWithLecturer extends Thesis {
	lecturerName?: string;
	lecturerEmail?: string;
	[key: string]: unknown;
}

// Publish thesis filters
export interface PublishThesesFilters {
	searchText: string;
	isPublish?: boolean;
	domain?: string;
}

// Additional actions specific to publish theses
export interface PublishThesesActions {
	togglePublishStatus: (thesisId: string) => Promise<boolean>;
	publishMultiple: (thesisIds: string[]) => Promise<boolean>;
	getDomainOptions: () => string[];
}

// Full publish theses store type
export type PublishThesesStore = ExtendThesisStore<
	ThesisWithLecturer,
	PublishThesesFilters,
	PublishThesesActions
>;

// Fetch function to get approved theses enriched with lecturer data
const fetchApprovedThesesWithLecturer = async (): Promise<
	ThesisWithLecturer[]
> => {
	// Fetch both theses and lecturers in parallel
	const [thesisResponse, lecturerResponse] = await Promise.all([
		thesisService.findAll(),
		lecturerService.findAll(),
	]);

	const thesisResult = handleApiResponse(thesisResponse);
	const lecturerResult = handleApiResponse(lecturerResponse);

	if (!thesisResult.success || !lecturerResult.success) {
		const thesisError = thesisResult.success
			? ''
			: (thesisResult.error?.message ?? '');
		const lecturerError = lecturerResult.success
			? ''
			: (lecturerResult.error?.message ?? '');

		let errorMessage = 'Failed to fetch data';
		if (thesisError !== '') {
			errorMessage = thesisError;
		} else if (lecturerError !== '') {
			errorMessage = lecturerError;
		}

		throw new Error(errorMessage);
	}

	const allTheses = thesisResult.data ?? [];
	const allLecturers = lecturerResult.data ?? [];

	// Filter only approved theses
	const approvedTheses = allTheses.filter(
		(thesis) => thesis.status === 'Approved',
	);

	// Create lecturer lookup map for efficient matching
	const lecturerMap = new Map(
		allLecturers.map((lecturer) => [lecturer.id, lecturer]),
	);

	// Enrich thesis data with lecturer information
	const thesesWithLecturer: ThesisWithLecturer[] = approvedTheses.map(
		(thesis) => {
			const lecturer = lecturerMap.get(thesis.lecturerId);
			return {
				...thesis,
				lecturerName: (() => {
					const trimmedName = (lecturer?.fullName ?? '').trim();
					return trimmedName !== '' ? trimmedName : 'Unknown';
				})(),
				lecturerEmail: lecturer?.email,
			};
		},
	);

	return thesesWithLecturer;
};

// Custom filter function for publish theses
const filterPublishTheses = (
	theses: ThesisWithLecturer[],
	filters: PublishThesesFilters,
): ThesisWithLecturer[] => {
	return theses.filter((thesis) => {
		// Search text filter (English name, Vietnamese name, lecturer name)
		const searchMatch =
			!filters.searchText ||
			isTextMatch(filters.searchText, [
				thesis.englishName,
				thesis.vietnameseName,
				thesis.lecturerName ?? '',
			]);

		// Publish status filter
		const publishMatch =
			filters.isPublish === undefined
				? true
				: thesis.isPublish === filters.isPublish;

		// Domain filter
		const domainMatch = !filters.domain
			? true
			: thesis.domain === filters.domain;

		return searchMatch && publishMatch && domainMatch;
	});
};

// Search fields for text matching
const getSearchFields = (thesis: ThesisWithLecturer): string[] => [
	thesis.englishName,
	thesis.vietnameseName,
	thesis.lecturerName ?? '',
	thesis.domain ?? '',
];

// Create base store
const baseStore = createThesisStoreFactory<
	ThesisWithLecturer,
	PublishThesesFilters
>({
	entityName: 'publishTheses',
	fetchFn: fetchApprovedThesesWithLecturer,
	searchFields: getSearchFields,
	filterFn: filterPublishTheses,
	cacheTTL: 5 * 60 * 1000, // 5 minutes
	maxCacheSize: 1000,
	enableLocalStorage: false,
});

// Extend base store with publish-specific actions
export const usePublishThesesStore = () => {
	const store = baseStore();

	// Toggle publish status for a single thesis
	const togglePublishStatus = async (thesisId: string): Promise<boolean> => {
		try {
			const response = await thesisService.togglePublishStatus(thesisId);
			const result = handleApiResponse(response);

			if (result.success && result.data) {
				// Update local state
				const updatedItems = store.items.map((thesis) =>
					thesis.id === thesisId
						? { ...thesis, isPublish: result.data!.isPublish }
						: thesis,
				);

				// Update store state
				baseStore.setState({
					items: updatedItems,
				});

				// Re-apply filters
				store.filterItems();

				return true;
			}
			return false;
		} catch (error) {
			console.error('Failed to toggle publish status:', error);
			return false;
		}
	};

	// Publish multiple theses
	const publishMultiple = async (thesisIds: string[]): Promise<boolean> => {
		try {
			// Get theses that are not currently published
			const thesesToPublish = store.items.filter(
				(thesis) => thesisIds.includes(thesis.id) && !thesis.isPublish,
			);

			if (thesesToPublish.length === 0) {
				return true; // Nothing to publish
			}

			const promises = thesesToPublish.map((thesis) =>
				thesisService.togglePublishStatus(thesis.id),
			);

			const results = await Promise.all(promises);
			const allSuccessful = results.every((response) => {
				const result = handleApiResponse(response);
				return result.success;
			});

			if (allSuccessful) {
				// Update local state - mark all selected theses as published
				const updatedItems = store.items.map((thesis) =>
					thesisIds.includes(thesis.id)
						? { ...thesis, isPublish: true }
						: thesis,
				);

				// Update store state
				baseStore.setState({
					items: updatedItems,
				});

				// Re-apply filters
				store.filterItems();

				return true;
			}
			return false;
		} catch (error) {
			console.error('Failed to publish multiple theses:', error);
			return false;
		}
	};

	// Get unique domain options from current items
	const getDomainOptions = (): string[] => {
		const domains = store.items
			.map((thesis) => thesis.domain)
			.filter(
				(domain): domain is string =>
					typeof domain === 'string' && domain.trim() !== '',
			);
		return Array.from(new Set(domains));
	};

	return {
		...store,
		togglePublishStatus,
		publishMultiple,
		getDomainOptions,
		// Alias for better API
		theses: store.items,
		filteredTheses: store.filteredItems,
		refreshing: store.refreshing,
		refetch: () => store.fetchItems(true),
	};
};
