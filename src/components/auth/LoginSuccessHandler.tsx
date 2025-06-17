import { notification } from 'antd';
import { useRouter } from 'next/navigation';

/**
 * Utility function to wait for session to be updated
 */
const waitForSessionUpdate = async (
	maxAttempts = 5,
	delayMs = 200,
): Promise<{ user?: { role?: string } } | null> => {
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

			// Determine redirect path based on actual user role
			let redirectPath = '/student'; // default
			let dashboardName = 'student';

			if (userRole === 'admin') {
				redirectPath = '/admin';
				dashboardName = 'admin';
			} else if (userRole === 'lecturer' || userRole === 'moderator') {
				// Both lecturer and moderator go to lecturer dashboard
				redirectPath = '/lecturer';
				dashboardName = 'lecturer';
			}
			// student is default, no need to reassign

			notification.success({
				message: 'Login Successful',
				description: `🎉 Welcome back! Redirecting to ${dashboardName} dashboard...`,
				duration: 3,
				placement: 'bottomRight',
			});

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
	) {
		const redirectPath = isAdmin ? '/admin' : '/student';
		notification.success({
			message: 'Login Successful',
			description: `🎉 Welcome back! Redirecting to dashboard...`,
			duration: 3,
			placement: 'bottomRight',
		});
		router.push(redirectPath);
	}
}
