import { useCallback, useEffect, useMemo, useState } from 'react';

import { lecturerService } from '@/lib/services/lecturers.service';
import { thesisService } from '@/lib/services/theses.service';
import {
	THESIS_ERROR_CONFIGS,
	handleThesisError,
} from '@/lib/utils/thesis-handlers';
import { Lecturer } from '@/schemas/lecturer';
import { Thesis } from '@/schemas/thesis';

// API response type for thesis data với thêm fields từ API
type ThesisApiResponse = Thesis & {
	thesisRequiredSkills?: Array<{
		thesisId: string;
		skillId: string;
		skill: { id: string; name: string };
	}>;
	thesisVersions?: Array<{
		id: string;
		version: number;
		supportingDocument: string;
	}>;
};

// Enhanced thesis type cho UI display
type EnhancedThesis = ThesisApiResponse & {
	skills: string[];
	version: string;
	supervisor?: {
		name: string;
		phone: string;
		email: string;
	};
};

// Memoized transformation function để transform thesis data với lecturer info
const transformThesisData = (
	apiThesis: ThesisApiResponse,
	lecturer?: Lecturer,
): EnhancedThesis => {
	// Extract skills từ thesisRequiredSkills relationship
	const skills =
		apiThesis.thesisRequiredSkills?.map((trs) => trs.skill?.name ?? '') ?? [];

	// Get highest version từ thesisVersions array
	const highestVersion = apiThesis.thesisVersions?.length
		? Math.max(...apiThesis.thesisVersions.map((tv) => tv.version))
		: 1;
	const version = `${highestVersion}.0`;

	// Add lecturer info nếu có
	const supervisor = lecturer
		? {
				name: lecturer.fullName,
				phone: lecturer.phoneNumber,
				email: lecturer.email,
			}
		: undefined;

	return {
		...apiThesis,
		skills,
		version,
		supervisor,
	};
};

export const useThesisDetail = (thesisId: string) => {
	const [thesis, setThesis] = useState<EnhancedThesis | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadingStage, setLoadingStage] = useState<
		'thesis' | 'lecturer' | 'preparing'
	>('thesis');
	const [error, setError] = useState<string | null>(null);

	// Memoized fetch function to prevent unnecessary recreations
	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			setLoadingStage('thesis');
			// Fetch thesis data first
			const thesisResponse = await thesisService.findOne(thesisId);

			if ('data' in thesisResponse && thesisResponse.data) {
				// Type guard to ensure thesis data structure
				const isThesisApiResponse = (
					data: unknown,
				): data is ThesisApiResponse => {
					if (data === null || typeof data !== 'object') return false;
					const obj = data as Record<string, unknown>;
					return (
						'id' in obj &&
						typeof obj.id === 'string' &&
						'lecturerId' in obj &&
						typeof obj.lecturerId === 'string'
					);
				};

				if (!isThesisApiResponse(thesisResponse.data)) {
					throw new Error('Invalid thesis data structure');
				}

				const thesisData = thesisResponse.data;

				// Update loading stage
				setLoadingStage('lecturer');

				// Fetch lecturer data
				const lecturerResponse = await lecturerService.findOne(
					thesisData.lecturerId,
				);
				let lecturerData: Lecturer | undefined;

				if ('data' in lecturerResponse && lecturerResponse.data) {
					lecturerData = lecturerResponse.data;
				}

				// Final preparation
				setLoadingStage('preparing');

				// Transform thesis with lecturer data
				const transformedThesis = transformThesisData(thesisData, lecturerData);
				setThesis(transformedThesis);
			} else {
				setError('Failed to load thesis data. Please try again.');
			}
		} catch (error) {
			handleThesisError(error, THESIS_ERROR_CONFIGS.FETCH);
			setError('Failed to load data. Please try again.');
		} finally {
			setLoading(false);
		}
	}, [thesisId]);

	useEffect(() => {
		if (thesisId) {
			fetchData();
		}
	}, [thesisId, fetchData]);

	// Memoized loading message calculation
	const loadingMessage = useMemo(() => {
		switch (loadingStage) {
			case 'thesis':
				return 'Loading thesis data...';
			case 'lecturer':
				return 'Loading lecturer information...';
			case 'preparing':
				return 'Preparing content...';
			default:
				return 'Loading...';
		}
	}, [loadingStage]);

	return {
		thesis,
		loading,
		error,
		loadingMessage,
		refetch: fetchData,
	};
};
