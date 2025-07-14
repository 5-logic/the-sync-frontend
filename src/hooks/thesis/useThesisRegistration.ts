import { useCallback, useState } from 'react';

import { showNotification } from '@/lib/utils/notification';

export const useThesisRegistration = () => {
	const [isRegistering, setIsRegistering] = useState(false);

	const registerThesis = useCallback(async (thesisId: string) => {
		try {
			setIsRegistering(true);
			// Implement actual registration API call
			// await thesesService.registerThesis(thesisId);

			// Simulate API call for now
			await new Promise((resolve) => setTimeout(resolve, 1000));

			console.log('Registering thesis:', thesisId);

			showNotification.success(
				'Registration Successful',
				'Your group has been registered for this thesis successfully',
			);
		} catch (error) {
			console.error('Error registering thesis:', error);
			showNotification.error(
				'Registration Failed',
				'Failed to register for this thesis. Please try again.',
			);
		} finally {
			setIsRegistering(false);
		}
	}, []);

	return {
		registerThesis,
		isRegistering,
	};
};
