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
	// Handle new user sign in
	if (user) {
		assignUserDataToToken(token, user);
		setTokenExpiration(token, user, account);
		await enrichTokenWithProfile(token, user);
	}

	// Check token expiration
	checkTokenExpiration(token);

	return token;
}

/**
 * Assign user data to token on first sign in
 */
function assignUserDataToToken(token: JWT, user: User): void {
	token.role = user.role;
	token.id = user.id;
	token.rememberMe = user.rememberMe ?? false;

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
}

/**
 * Set token expiration based on remember me preference
 */
function setTokenExpiration(
	token: JWT,
	user: User,
	account: Record<string, unknown> | null | undefined,
): void {
	if (!account) return;

	const now = Date.now();
	if (user.rememberMe) {
		// Remember me: 7 days (aligns with 1-week refresh token)
		token.accessTokenExpires = now + 7 * 24 * 60 * 60 * 1000;
	} else {
		// Session only: 5 hours (increased from 2 hours)
		token.accessTokenExpires = now + 5 * 60 * 60 * 1000;
	}
}

/**
 * Check if token has expired
 */
function checkTokenExpiration(token: JWT): void {
	if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
		console.warn('JWT token expired, will require re-authentication');
		// Token expiration will be handled by session callback
	}
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
