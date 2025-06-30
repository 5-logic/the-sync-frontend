import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';

import { showNotification } from '@/lib/utils/notification';

/**
 * Utility function to wait for session to be updated
 */
const waitForSessionUpdate = async (
	maxAttempts = 5,
	delayMs = 200,
): Promise<Session> => {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		const session = await fetch('/api/auth/session').then((res) => res.json());

		if (session?.user?.role) {
			return session;
		}

		if (attempt < maxAttempts) {
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}

	throw new Error('Session update timeout');
};

/**
 * ✅ Login Success Handler
 * Handles successful login and routing logic
 */
export class LoginSuccessHandler {
	/**
	 * Handle successful login and determine redirect path
	 */
	static async handleLoginSuccess(router: ReturnType<typeof useRouter>) {
		try {
			// Wait for session to be properly updated with retry logic
			const session = await waitForSessionUpdate();
			const userRole = session?.user?.role;
			const fullName = session?.user?.fullName;
			const username = session?.user?.username;

			// Determine redirect path based on actual user role
			let redirectPath = '/student'; // default

			if (userRole === 'admin') {
				redirectPath = '/admin';
			} else if (userRole === 'lecturer' || userRole === 'moderator') {
				// Both lecturer and moderator go to lecturer dashboard
				redirectPath = '/lecturer';
			}
			// student is default, no need to reassign

			// Create personalized welcome message
			let welcomeMessage = 'Welcome back!';

			if (userRole === 'admin') {
				// For admin: try username first, then name, then email
				const adminName =
					username ?? session?.user?.name ?? session?.user?.email;
				if (adminName) {
					welcomeMessage = `Welcome back, ${adminName}!`;
				}
			} else if (
				userRole === 'student' ||
				userRole === 'lecturer' ||
				userRole === 'moderator'
			) {
				// For students/lecturers: try fullName first, then name, then email
				const userDisplayName =
					fullName ?? session?.user?.name ?? session?.user?.email;
				if (userDisplayName) {
					welcomeMessage = `Welcome back, ${userDisplayName}!`;
				}
			}

			showNotification.success('Login Successful', `🎉 ${welcomeMessage}`, 3);

			// Session is already verified from waitForSessionUpdate
			router.push(redirectPath);

			return true;
		} catch (sessionError) {
			console.error('Failed to get session after login:', sessionError);
			return false;
		}
	}
	/**
	 * Fallback redirect when session fetch fails
	 */
	static handleFallbackRedirect(
		router: ReturnType<typeof useRouter>,
		isAdmin = false,
		fallbackName?: string,
	) {
		const redirectPath = isAdmin ? '/admin' : '/student';

		// Create personalized welcome message if name is available
		let welcomeMessage = 'Welcome back!';
		if (fallbackName) {
			welcomeMessage = `Welcome back, ${fallbackName}!`;
		}
		showNotification.success('Login Successful', `🎉 ${welcomeMessage}`, 3);
		router.push(redirectPath);
	}
}
