import { useCallback, useEffect, useMemo, useState } from 'react';

import { ExtendedThesis } from '@/data/thesis';
import { lecturerService } from '@/lib/services/lecturers.service';
import { thesisService } from '@/lib/services/theses.service';
import {
	THESIS_ERROR_CONFIGS,
	handleThesisError,
} from '@/lib/utils/thesis-handlers';
import { Lecturer } from '@/schemas/lecturer';
import { ThesisWithRelations } from '@/schemas/thesis';

// Memoized transformation function to prevent unnecessary recalculations
const transformThesisData = (
	apiThesis: ThesisWithRelations,
	lecturer?: Lecturer,
): ExtendedThesis => {
	// Extract skills from thesisRequiredSkills relationship
	const skills =
		apiThesis.thesisRequiredSkills?.map((trs) => trs.skill?.name ?? '') ?? [];

	// Get the highest version from thesisVersions array
	const highestVersion = apiThesis.thesisVersions?.length
		? Math.max(...apiThesis.thesisVersions.map((tv) => tv.version))
		: 1;
	const version = `${highestVersion}.0`;

	// Add lecturer info if available
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
		// Pass through thesisVersions for download functionality
		thesisVersions: apiThesis.thesisVersions,
	};
};

export const useThesisDetail = (thesisId: string) => {
	const [thesis, setThesis] = useState<ExtendedThesis | null>(null);
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
