import { notification } from 'antd';
import { useRouter } from 'next/navigation';

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
			// Get the updated session to access user role
			const session = await fetch('/api/auth/session').then((res) =>
				res.json(),
			);
			const userRole = session?.user?.role; // Determine redirect path based on actual user role
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

			// Add a small delay to ensure session is fully updated
			setTimeout(() => {
				router.push(redirectPath);
			}, 100);

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
