import { useCallback, useState } from 'react';

import aiDuplicateService, {
	DuplicateThesis,
} from '@/lib/services/ai-duplicate.service';
import { showNotification } from '@/lib/utils/notification';

export function useAiDuplicateCheck() {
	const [loading, setLoading] = useState(false);
	const [duplicateTheses, setDuplicateTheses] = useState<DuplicateThesis[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [checkedThesisIds, setCheckedThesisIds] = useState<Set<string>>(
		new Set(),
	);

	const checkDuplicate = useCallback(async (thesisId: string) => {
		setLoading(true);
		try {
			// Call AI duplicate check API
			const duplicateResponse =
				await aiDuplicateService.checkDuplicate(thesisId);

			if (duplicateResponse.success && duplicateResponse.data) {
				setDuplicateTheses(duplicateResponse.data);
				setIsModalVisible(true);
			} else {
				showNotification.error(
					'Duplicate Check Failed',
					'Failed to check for duplicate theses',
				);
			}
		} catch (error) {
			console.error('Error checking duplicate theses:', error);
			showNotification.error(
				'Error',
				'An error occurred while checking for duplicate theses',
			);
		} finally {
			setLoading(false);
		}
	}, []);

	// Simplified version for automatic checking (no modal)
	const checkDuplicateOnly = useCallback(
		async (thesisId: string) => {
			// Skip if already checked this thesis
			if (checkedThesisIds.has(thesisId)) {
				return;
			}

			setLoading(true);
			try {
				// Call AI duplicate check API
				const duplicateResponse =
					await aiDuplicateService.checkDuplicate(thesisId);

				if (duplicateResponse.success && duplicateResponse.data) {
					setDuplicateTheses(duplicateResponse.data);
					// Mark this thesis as checked
					setCheckedThesisIds((prev) => new Set(prev).add(thesisId));
				} else {
					// Don't show error notification for automatic check
					console.warn('Failed to check for duplicate theses');
				}
			} catch (error) {
				console.error('Error checking duplicate theses:', error);
				// Don't show error notification for automatic check
			} finally {
				setLoading(false);
			}
		},
		[checkedThesisIds],
	);

	const closeModal = useCallback(() => {
		setIsModalVisible(false);
		setDuplicateTheses([]);
	}, []);

	return {
		loading,
		duplicateTheses,
		isModalVisible,
		checkDuplicate,
		checkDuplicateOnly,
		closeModal,
	};
}
