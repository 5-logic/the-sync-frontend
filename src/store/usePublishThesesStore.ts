import lecturerService from '@/lib/services/lecturers.service';
import thesisService from '@/lib/services/theses.service';
import { isTextMatch } from '@/lib/utils';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { Thesis } from '@/schemas/thesis';
import { cacheUtils } from '@/store/helpers/cacheHelpers';
import {
	ExtendThesisStore,
	createThesisStoreFactory,
} from '@/store/helpers/thesisStoreHelpers';

// Extended thesis with lecturer information
export interface ThesisWithLecturer extends Thesis {
	lecturerName?: string;
	lecturerEmail?: string;
	semesterName?: string;
	semesterCode?: string;
	[key: string]: unknown;
}

// Publish thesis filters
export interface PublishThesesFilters {
	searchText: string;
	isPublish?: boolean;
	domain?: string;
	semesterId?: string;
}

// Additional actions specific to publish theses
export interface PublishThesesActions {
	updatePublishStatus: (
		thesisIds: string[],
		isPublish: boolean,
	) => Promise<boolean>;
	togglePublishStatus: (thesisId: string) => Promise<boolean>;
	publishMultiple: (thesisIds: string[]) => Promise<boolean>;
	getDomainOptions: () => string[];
	getSemesterOptions: () => Array<{ id: string; name: string; code: string }>;
}

// Full publish theses store type
export type PublishThesesStore = ExtendThesisStore<
	ThesisWithLecturer,
	PublishThesesFilters,
	PublishThesesActions
>;

// Fetch function to get approved theses (all approved, regardless of publish status) enriched with lecturer data
const fetchApprovedThesesWithLecturer = async (): Promise<
	ThesisWithLecturer[]
> => {
	// Fetch theses, lecturers, and semesters in parallel
	const [thesisResponse, lecturerResponse, semesterResponse] =
		await Promise.all([
			thesisService.findAll(),
			lecturerService.findAll(),
			import('@/lib/services/semesters.service').then((module) =>
				module.default.findAll(),
			),
		]);

	const thesisResult = handleApiResponse(thesisResponse);
	const lecturerResult = handleApiResponse(lecturerResponse);
	const semesterResult = handleApiResponse(semesterResponse);

	if (
		!thesisResult.success ||
		!lecturerResult.success ||
		!semesterResult.success
	) {
		const thesisError = thesisResult.success
			? ''
			: (thesisResult.error?.message ?? '');
		const lecturerError = lecturerResult.success
			? ''
			: (lecturerResult.error?.message ?? '');
		const semesterError = semesterResult.success
			? ''
			: (semesterResult.error?.message ?? '');

		let errorMessage = 'Failed to fetch data';
		if (thesisError !== '') {
			errorMessage = thesisError;
		} else if (lecturerError !== '') {
			errorMessage = lecturerError;
		} else if (semesterError !== '') {
			errorMessage = semesterError;
		}

		throw new Error(errorMessage);
	}

	const allTheses = thesisResult.data ?? [];
	const allLecturers = lecturerResult.data ?? [];
	const allSemesters = semesterResult.data ?? [];

	// Filter only approved theses (regardless of publish status)
	const approvedTheses = allTheses.filter(
		(thesis) => thesis.status === 'Approved',
	);

	// Create lecturer lookup map for efficient matching
	const lecturerMap = new Map(
		allLecturers.map((lecturer) => [lecturer.id, lecturer]),
	);

	// Create semester lookup map for efficient matching
	const semesterMap = new Map(
		allSemesters.map((semester) => [semester.id, semester]),
	);

	// Enrich thesis data with lecturer and semester information
	const thesesWithLecturer: ThesisWithLecturer[] = approvedTheses.map(
		(thesis) => {
			const lecturer = lecturerMap.get(thesis.lecturerId);
			const semester = semesterMap.get(thesis.semesterId);
			return {
				...thesis,
				lecturerName: (() => {
					const trimmedName = (lecturer?.fullName ?? '').trim();
					return trimmedName !== '' ? trimmedName : 'Unknown';
				})(),
				lecturerEmail: lecturer?.email,
				semesterName: semester?.name,
				semesterCode: semester?.code,
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

		// Semester filter
		const semesterMatch = !filters.semesterId
			? true
			: thesis.semesterId === filters.semesterId;

		return searchMatch && publishMatch && domainMatch && semesterMatch;
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

	// Unified function to update publish status for single or multiple theses
	const updatePublishStatus = async (
		thesisIds: string[],
		isPublish: boolean,
	): Promise<boolean> => {
		try {
			// Filter valid theses that can be updated
			const validTheses = store.items.filter((thesis) => {
				if (!thesisIds.includes(thesis.id)) return false;

				// Cannot unpublish if thesis has group assigned
				if (!isPublish && thesis.groupId) return false;

				// Only process if status would actually change
				return thesis.isPublish !== isPublish;
			});

			if (validTheses.length === 0) {
				return true; // Nothing to update
			}

			// Call API
			const response = await thesisService.publishTheses({
				thesisIds: validTheses.map((thesis) => thesis.id),
				isPublish,
			});

			const result = handleApiResponse(response);

			if (result.success) {
				// Update local state
				const updatedItems = store.items.map((thesis) =>
					validTheses.some((t) => t.id === thesis.id)
						? { ...thesis, isPublish }
						: thesis,
				);

				// Update store state
				baseStore.setState({
					items: updatedItems,
				});

				// Re-apply filters
				store.filterItems();

				// Update cache
				cacheUtils.set('publishTheses', 'all', updatedItems);

				return true;
			}
			return false;
		} catch (error) {
			console.error('Failed to update publish status:', error);
			return false;
		}
	};

	// Helper methods for backward compatibility and easier usage
	const togglePublishStatus = async (thesisId: string): Promise<boolean> => {
		const currentThesis = store.items.find((thesis) => thesis.id === thesisId);
		if (!currentThesis) {
			console.error('Thesis not found:', thesisId);
			return false;
		}
		return updatePublishStatus([thesisId], !currentThesis.isPublish);
	};

	const publishMultiple = async (thesisIds: string[]): Promise<boolean> => {
		return updatePublishStatus(thesisIds, true);
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

	// Get unique semester options from current items
	const getSemesterOptions = (): Array<{
		id: string;
		name: string;
		code: string;
	}> => {
		const semesters = store.items
			.filter((thesis) => thesis.semesterName && thesis.semesterCode)
			.map((thesis) => ({
				id: thesis.semesterId,
				name: thesis.semesterName!,
				code: thesis.semesterCode!,
			}));

		// Remove duplicates based on id
		const uniqueSemesters = semesters.filter(
			(semester, index, arr) =>
				arr.findIndex((s) => s.id === semester.id) === index,
		);

		return uniqueSemesters;
	};

	return {
		...store,
		updatePublishStatus,
		togglePublishStatus,
		publishMultiple,
		getDomainOptions,
		getSemesterOptions,
		// Alias for better API
		theses: store.items,
		filteredTheses: store.filteredItems,
		refreshing: store.refreshing,
		refetch: () => store.fetchItems(true),
	};
};
