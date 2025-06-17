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

			console.log(
				'🔍 Session data after login:',
				JSON.stringify(session, null, 2),
			);

			const userRole = session?.user?.role;
			const isModerator = session?.user?.isModerator;

			console.log('🎯 User role:', userRole, 'isModerator:', isModerator);

			// Determine redirect path based on actual user role
			let redirectPath = '/student'; // default
			let dashboardName = 'student';

			if (userRole === 'admin') {
				redirectPath = '/admin';
				dashboardName = 'admin';
			} else if (userRole === 'lecturer') {
				redirectPath = '/lecturer';
				dashboardName = 'lecturer';
			} else if (userRole === 'moderator') {
				// Moderator also goes to lecturer dashboard
				redirectPath = '/lecturer';
				dashboardName = 'lecturer';
			} else if (userRole === 'student') {
				redirectPath = '/student';
				dashboardName = 'student';
			}

			console.log('🚀 Redirecting to:', redirectPath);

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
