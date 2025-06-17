import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * 🔐 Session Callback Handler
 * Manages session data sent to client
 */
export async function sessionCallback({
	session,
	token,
}: {
	session: Session;
	token: JWT;
}): Promise<Session> {
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

	return session;
}
