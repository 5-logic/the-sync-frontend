import { User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

import {
	fetchUserProfile,
	getFallbackName,
	mapProfileToToken,
} from '@/lib/utils/auth/profile-fetcher';

/**
 * JWT Callback Handler
 * Manages JWT token creation and updates with remember me support
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

		// Store remember me preference
		token.rememberMe = user.rememberMe ?? false;

		// Store tokens from user object
		if (user.accessToken) {
			token.accessToken = user.accessToken;
		}
		if (user.refreshToken) {
			token.refreshToken = user.refreshToken;
		}

		// Dynamic token expiration based on backend settings and remember me
		if (account) {
			const now = Date.now();
			if (user.rememberMe) {
				// Remember me: 7 days (aligns with 1-week refresh token)
				token.accessTokenExpires = now + 7 * 24 * 60 * 60 * 1000;
			} else {
				// Session only: 2 hours (shorter for security)
				token.accessTokenExpires = now + 2 * 60 * 60 * 1000;
			}
		}

		// Fetch user profile data based on role and ID
		await enrichTokenWithProfile(token, user);
	}

	// Check token expiration and cleanup if needed
	if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
		console.warn('JWT token expired, will require re-authentication');
		// Don't clear token here, let the session callback handle it
	}

	return token;
}

/**
 * Enrich token with user profile data
 */
async function enrichTokenWithProfile(token: JWT, user: User): Promise<void> {
	try {
		const profile = await fetchUserProfile({
			id: user.id,
			role: user.role,
			accessToken: user.accessToken ?? '',
		});

		if (profile) {
			// Map profile data to token based on user type
			const mappedData = mapProfileToToken(profile, user.role, {
				username: token.username,
				email: token.email,
			}); // Apply mapped data to token
			Object.assign(token, mappedData);
		} else {
			// Fallback if profile fetch fails
			const fallbackName = getFallbackName(user.role, {
				username: token.username,
				email: token.email,
			});
			token.fullName = fallbackName;
		}
	} catch (error) {
		console.error('Error enriching token with profile:', error);

		// Fallback based on user role
		const fallbackName = getFallbackName(user.role, {
			username: token.username,
			email: token.email,
		});
		token.fullName = fallbackName;
	}
}
