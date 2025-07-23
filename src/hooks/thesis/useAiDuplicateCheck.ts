import { useState } from 'react';

import aiDuplicateService, {
	DuplicateThesis,
} from '@/lib/services/ai-duplicate.service';
import { showNotification } from '@/lib/utils/notification';

export function useAiDuplicateCheck() {
	const [loading, setLoading] = useState(false);
	const [duplicateTheses, setDuplicateTheses] = useState<DuplicateThesis[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);

	const checkDuplicate = async (thesisId: string) => {
		setLoading(true);
		try {
			// Call AI duplicate check API
			const duplicateResponse =
				await aiDuplicateService.checkDuplicate(thesisId);

			if (duplicateResponse.success && duplicateResponse.data) {
				setDuplicateTheses(duplicateResponse.data);
				setIsModalVisible(true);
			} else {
				showNotification.error('Failed to check for duplicate theses');
			}
		} catch (error) {
			console.error('Error checking duplicate theses:', error);
			showNotification.error(
				'An error occurred while checking for duplicate theses',
			);
		} finally {
			setLoading(false);
		}
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setDuplicateTheses([]);
	};

	return {
		loading,
		duplicateTheses,
		isModalVisible,
		checkDuplicate,
		closeModal,
	};
}
