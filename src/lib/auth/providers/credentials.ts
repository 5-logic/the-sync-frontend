import CredentialsProvider from 'next-auth/providers/credentials';

import {
	decodeMockToken,
	findMockAccount,
	generateMockToken,
	isDevelopmentMode,
} from '@/lib/auth/mock-accounts';
import httpClient from '@/lib/services/_httpClient';
import { AuthService } from '@/lib/services/auth';

/**
 * NextAuth Credentials Provider
 * Handles admin and user authentication with remember me support
 */
export const credentialsProvider = CredentialsProvider({
	name: 'Credentials',
	credentials: {
		username: { label: 'Username or Email', type: 'text' },
		password: { label: 'Password', type: 'password' },
		remember: { label: 'Remember Me', type: 'checkbox' },
	},
	async authorize(credentials) {
		if (!credentials?.username || !credentials?.password) {
			return null;
		}

		try {
			// Parse remember me preference
			const rememberMe =
				credentials.remember === 'true' || credentials.remember === 'on';

			// Check if development mode with mock auth is enabled
			if (isDevelopmentMode()) {
				// Try to find mock account first
				const mockAccount = findMockAccount(
					credentials.username,
					credentials.password,
				);
				if (mockAccount) {
					console.log(
						'🔧 Development mode: Using mock account for',
						mockAccount.username || mockAccount.email,
					);

					// Generate mock tokens
					const mockAccessToken = generateMockToken(mockAccount);
					const mockRefreshToken = generateMockToken(mockAccount);

					// Decode user info from mock token
					const userInfo = decodeMockToken(mockAccessToken);

					if (!userInfo?.sub || !userInfo?.role) {
						return null;
					}

					// Return user object for NextAuth with mock tokens
					return {
						id: userInfo.sub,
						role: userInfo.role,
						name: userInfo.fullName,
						email: mockAccount.email || '',
						username: mockAccount.username || '',
						isModerator: userInfo.isModerator || false,
						accessToken: mockAccessToken,
						refreshToken: mockRefreshToken,
						rememberMe,
					};
				}
			}

			// Fallback to real API if not in development mode or mock account not found
			// Determine if it's admin login (username) or user login (email)
			const isEmail = credentials.username.includes('@');
			let tokenData;
			if (isEmail) {
				// User login (Student/Lecturer)
				tokenData = await AuthService.userLogin({
					email: credentials.username,
					password: credentials.password,
				});
			} else {
				// Admin login
				tokenData = await AuthService.adminLogin({
					username: credentials.username,
					password: credentials.password,
				});
			}

			// Decode user info from access token
			const userInfo = AuthService.getUserFromToken(tokenData.accessToken);

			if (!userInfo?.sub || !userInfo?.role) {
				return null;
			}

			// Return user object for NextAuth with tokens and remember preference
			const user = {
				id: userInfo.sub,
				role: userInfo.role,
				name: (() => {
					// Set name based on role and available data
					if (userInfo.role === 'admin') {
						return (
							userInfo.fullName ??
							userInfo.username ??
							credentials.username ??
							'Admin'
						);
					} else {
						return (
							userInfo.fullName ??
							userInfo.username ??
							userInfo.email ??
							credentials.username ??
							'User'
						);
					}
				})(),
				email: isEmail ? credentials.username : (userInfo?.email ?? ''),
				username: !isEmail ? credentials.username : userInfo?.username,
				isModerator: userInfo?.isModerator || false,
				// Include tokens in user object to pass to JWT callback
				accessToken: tokenData.accessToken,
				refreshToken: tokenData.refreshToken,
				rememberMe,
			};

			// Additional validation: Check if user account is active (skip for mock accounts)
			if (!isDevelopmentMode() || !user.accessToken.startsWith('mock.')) {
				await validateUserAccount(user);
			}

			// Note: sessionStorage flag will be set on client-side after login

			return user;
		} catch (error) {
			// Extract meaningful error message to pass to the client
			if (error instanceof Error) {
				throw new Error(error.message);
			}

			// Fallback for unknown errors
			throw new Error('Authentication failed');
		}
	},
});

/**
 * Validate user account status
 */
async function validateUserAccount(user: {
	id: string;
	role: string;
	email: string;
	accessToken: string;
}): Promise<void> {
	try {
		let profileEndpoint;
		switch (user.role) {
			case 'admin':
				profileEndpoint = `/admins/${user.id}`;
				break;
			case 'lecturer':
				profileEndpoint = `/lecturers/${user.id}`;
				break;
			case 'moderator':
				// Moderator uses lecturer endpoint but with special permissions
				profileEndpoint = `/lecturers/${user.id}`;
				break;
			case 'student':
				profileEndpoint = `/students/${user.id}`;
				break;
			default:
				profileEndpoint = null;
		}

		if (profileEndpoint) {
			const profileResponse = await httpClient.get(profileEndpoint, {
				headers: {
					Authorization: `Bearer ${user.accessToken}`,
				},
			});

			if (
				profileResponse.status === 200 &&
				profileResponse.data?.success &&
				profileResponse.data?.data
			) {
				const profileData = profileResponse.data.data;
				// Check if user account is active
				if (profileData.isActive === false) {
					throw new Error('Account is inactive');
				}
			}
		}
	} catch (profileError) {
		console.warn('Could not check user active status:', profileError);
		// Continue with login if profile check fails (don't block login)
	}
}
