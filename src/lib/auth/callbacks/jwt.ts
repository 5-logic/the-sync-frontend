import {
	fetchUserProfile,
	getFallbackName,
	mapProfileToToken,
} from '../profile-fetcher';
import { User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * 🔐 JWT Callback Handler
 * Manages JWT token creation and updates
 */
export async function jwtCallback({
	token,
	user,
	account,
}: {
	token: JWT;
	user?: User;
	account?: Record<string, unknown> | null;
}): Promise<JWT> {
	console.log('🔐 JWT callback - token:', token, 'user:', user);

	// Add user data to token on first sign in
	if (user) {
		token.role = user.role;
		token.id = user.id;

		// Add isModerator for lecturers
		if (user.isModerator !== undefined) {
			token.isModerator = user.isModerator;
		}

		// Add username for admin
		if (user.username) {
			token.username = user.username;
		}

		// Store tokens from user object
		if (user.accessToken) {
			token.accessToken = user.accessToken;
		}
		if (user.refreshToken) {
			token.refreshToken = user.refreshToken;
		}

		// Fetch user profile data based on role and ID
		await enrichTokenWithProfile(token, user);

		// Handle token refresh if needed
		if (account) {
			// Store token expiration time (1 hour from now)
			token.accessTokenExpires = Date.now() + 60 * 60 * 1000;
		}
	}

	return token;
}

/**
 * 🔍 Enrich token with user profile data
 */
async function enrichTokenWithProfile(token: JWT, user: User): Promise<void> {
	try {
		const profile = await fetchUserProfile({
			id: user.id,
			role: user.role,
			accessToken: user.accessToken || '',
		});

		if (profile) {
			// Map profile data to token based on user type
			const mappedData = mapProfileToToken(profile, user.role, {
				username: token.username,
				email: token.email,
			});

			// Apply mapped data to token
			Object.assign(token, mappedData);

			console.log('✅ Profile stored in token:', {
				fullName: token.fullName,
				role: user.role,
				studentId: token.studentId,
				majorId: token.majorId,
				isModerator: token.isModerator,
				isActive: token.isActive,
			});
		} else {
			// Fallback if profile fetch fails
			const fallbackName = getFallbackName(user.role, {
				username: token.username,
				email: token.email,
			});
			token.fullName = fallbackName;
		}
	} catch (error) {
		console.error('❌ Error enriching token with profile:', error);

		// Fallback based on user role
		const fallbackName = getFallbackName(user.role, {
			username: token.username,
			email: token.email,
		});
		token.fullName = fallbackName;
	}
}
