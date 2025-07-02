import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { useSessionData } from '@/hooks/auth/useAuth';
import { TIMING } from '@/lib/constants/thesis';
import { showNotification } from '@/lib/utils/notification';
import {
	THESIS_ERROR_CONFIGS,
	THESIS_SUCCESS_CONFIGS,
	handleThesisError,
	handleThesisSuccess,
} from '@/lib/utils/thesis-handlers';
import {
	ThesisCreate,
	ThesisUpdate,
	ThesisWithRelations,
} from '@/schemas/thesis';
import { useThesisStore } from '@/store';

interface UseThesisFormOptions {
	mode: 'create' | 'edit';
	thesisId?: string;
	thesis?: ThesisWithRelations | null;
}

export const useThesisForm = ({
	mode,
	thesisId,
	thesis,
}: UseThesisFormOptions) => {
	const router = useRouter();
	const { session } = useSessionData();
	const { createThesis, updateThesis } = useThesisStore();

	const [loading, setLoading] = useState(false);

	// Transform thesis data for form initial values
	const getFormInitialValues = useCallback(() => {
		if (mode === 'create' || !thesis) return undefined;

		// Extract skill IDs from thesisRequiredSkills
		const selectedSkillIds =
			thesis.thesisRequiredSkills?.map((thesisSkill) => thesisSkill.skillId) ||
			[];

		return {
			englishName: thesis.englishName,
			vietnameseName: thesis.vietnameseName,
			abbreviation: thesis.abbreviation,
			description: thesis.description,
			domain: thesis.domain,
			skills: selectedSkillIds,
		};
	}, [mode, thesis]);

	// Get initial file info for edit mode
	const getInitialFile = useCallback(() => {
		if (mode === 'create' || !thesis) return null;

		// Extract supporting document from thesisVersions (latest version)
		const latestVersion = thesis.thesisVersions?.[0];
		if (!latestVersion?.supportingDocument) return null;

		// Extract filename from URL
		const url = latestVersion.supportingDocument;
		const urlParts = url.split('/');
		const filename = urlParts[urlParts.length - 1] || 'thesis-document.docx';

		return {
			name: filename,
			size: 0, // We don't have size info from API
			url: url,
		};
	}, [mode, thesis]);

	// Handle form submission for both create and edit
	const handleSubmit = useCallback(
		async (values: Record<string, unknown>) => {
			if (!session?.user?.id) {
				handleThesisError(
					new Error('User not authenticated'),
					mode === 'create'
						? THESIS_ERROR_CONFIGS.CREATE
						: THESIS_ERROR_CONFIGS.UPDATE,
				);
				return;
			}

			try {
				setLoading(true);

				if (mode === 'create') {
					// Create mode
					const data = values as ThesisCreate;
					const thesisData: ThesisCreate = { ...data };

					const success = await createThesis(thesisData);

					if (success) {
						handleThesisSuccess(
							{
								...THESIS_SUCCESS_CONFIGS.CREATE,
								redirectDelay: TIMING.REDIRECT_DELAY,
							},
							router,
						);
					} else {
						throw new Error('Create thesis failed');
					}
				} else {
					// Edit mode
					if (!thesisId) throw new Error('Thesis ID is required for update');

					// Use store's updateThesis method
					const success = await updateThesis(thesisId, values as ThesisUpdate);

					if (success) {
						showNotification.success('Success', 'Thesis updated successfully!');
						router.push('/lecturer/thesis-management');
					} else {
						throw new Error('Update thesis failed');
					}
				}
			} catch (error) {
				if (mode === 'create') {
					handleThesisError(error, THESIS_ERROR_CONFIGS.CREATE, setLoading);
				} else {
					console.error('Error updating thesis:', error);
					showNotification.error(
						'Error',
						'Failed to update thesis. Please try again.',
					);
					setLoading(false);
				}
			}
		},
		[mode, session?.user?.id, thesisId, createThesis, updateThesis, router],
	);

	return {
		loading,
		handleSubmit,
		getFormInitialValues,
		getInitialFile,
	};
};
