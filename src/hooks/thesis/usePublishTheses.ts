import { useEffect, useState } from 'react';

import lecturerService from '@/lib/services/lecturers.service';
import thesisService from '@/lib/services/theses.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { Lecturer } from '@/schemas/lecturer';
import { Thesis } from '@/schemas/thesis';

export interface ThesisWithLecturer extends Thesis {
	lecturerName?: string;
	lecturerEmail?: string;
}

interface UsePublishThesesState {
	theses: ThesisWithLecturer[];
	lecturers: Lecturer[];
	loading: boolean;
	error: string | null;
}

export const usePublishTheses = () => {
	const [state, setState] = useState<UsePublishThesesState>({
		theses: [],
		lecturers: [],
		loading: false,
		error: null,
	});

	const fetchData = async () => {
		setState((prev) => ({ ...prev, loading: true, error: null }));

		try {
			// Fetch both theses and lecturers in parallel
			const [thesisResponse, lecturerResponse] = await Promise.all([
				thesisService.findAll(),
				lecturerService.findAll(),
			]);

			const thesisResult = handleApiResponse(thesisResponse);
			const lecturerResult = handleApiResponse(lecturerResponse);

			if (!thesisResult.success || !lecturerResult.success) {
				throw new Error(
					thesisResult.error || lecturerResult.error || 'Failed to fetch data',
				);
			}

			const allTheses = thesisResult.data || [];
			const allLecturers = lecturerResult.data || [];

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
						lecturerName: lecturer?.fullName || 'Unknown',
						lecturerEmail: lecturer?.email,
					};
				},
			);

			setState({
				theses: thesesWithLecturer,
				lecturers: allLecturers,
				loading: false,
				error: null,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'An error occurred';
			setState((prev) => ({
				...prev,
				loading: false,
				error: errorMessage,
			}));
		}
	};

	const togglePublishStatus = async (thesisId: string): Promise<boolean> => {
		try {
			const response = await thesisService.togglePublishStatus(thesisId);
			const result = handleApiResponse(response);

			if (result.success && result.data) {
				// Update local state
				setState((prev) => ({
					...prev,
					theses: prev.theses.map((thesis) =>
						thesis.id === thesisId
							? { ...thesis, isPublish: result.data!.isPublish }
							: thesis,
					),
				}));
				return true;
			}
			return false;
		} catch (error) {
			console.error('Failed to toggle publish status:', error);
			return false;
		}
	};

	const publishMultiple = async (thesisIds: string[]): Promise<boolean> => {
		try {
			// Since there's no bulk publish API, we'll call toggle for each thesis
			// that is not currently published
			const thesesToPublish = state.theses.filter(
				(thesis) => thesisIds.includes(thesis.id) && !thesis.isPublish,
			);

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
				setState((prev) => ({
					...prev,
					theses: prev.theses.map((thesis) =>
						thesisIds.includes(thesis.id)
							? { ...thesis, isPublish: true }
							: thesis,
					),
				}));
				return true;
			}
			return false;
		} catch (error) {
			console.error('Failed to publish multiple theses:', error);
			return false;
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return {
		...state,
		refetch: fetchData,
		togglePublishStatus,
		publishMultiple,
	};
};
