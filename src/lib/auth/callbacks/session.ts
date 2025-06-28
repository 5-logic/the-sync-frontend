import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * Session Callback Handler
 * Manages session data sent to client with remember me support
 */
export async function sessionCallback({
	session,
	token,
}: {
	session: Session;
	token: JWT;
}): Promise<Session> {
	// Token expiration before creating session
	if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
		console.warn('Session expired, will require re-authentication');
		// Return minimal session to trigger re-authentication
		return {
			...session,
			user: undefined,
			expires: new Date(Date.now() - 1000).toISOString(), // Expired timestamp
		} as unknown as Session;
	}

	// Send properties to the client
	if (session.user && token.id && token.role) {
		session.user.id = token.id;
		session.user.role = token.role;

		// Use fullName if available, otherwise fallback to email
		session.user.name =
			token.fullName ?? session.user.email ?? session.user.name;
		// Add isModerator to session if exists
		if (token.isModerator !== undefined) {
			session.user.isModerator = token.isModerator;
		}

		// Add username for admin
		if (token.username) {
			session.user.username = token.username;
		}

		// Add common user profile data to session (UserSchema fields)
		session.user.fullName = token.fullName;
		session.user.email = token.email ?? session.user.email;
		session.user.phoneNumber = token.phoneNumber;
		session.user.gender = token.gender;
		session.user.isActive = token.isActive;
		session.user.avatar = token.avatar;

		// Add role-specific fields
		session.user.studentId = token.studentId;
		session.user.majorId = token.majorId;
		session.user.major = token.major;
		session.user.department = token.department;
	}

	// Add tokens to session for client access
	if (token.accessToken) {
		session.accessToken = token.accessToken;
	}
	if (token.refreshToken) {
		session.refreshToken = token.refreshToken;
	}

	// Remember me preference to session
	session.rememberMe = token.rememberMe ?? false;

	// Dynamic session expiration based on backend token lifetimes and remember me
	if (token.rememberMe) {
		// Remember me: 7 days (aligns with 1-week refresh token)
		const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		session.expires = sevenDaysFromNow.toISOString();
	} else {
		// Session only: 2 hours (shorter for security)
		// IMPORTANT: For true session-only behavior (clear on tab close),
		// we set a short expiry that requires active session
		const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
		session.expires = twoHoursFromNow.toISOString();
	}

	return session;
}
