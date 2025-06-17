import CredentialsProvider from 'next-auth/providers/credentials';

import httpClient from '@/lib/services/_httpClient';
import { AuthService } from '@/lib/services/auth';

/**
 * 🔐 NextAuth Credentials Provider
 * Handles admin and user authentication
 */
export const credentialsProvider = CredentialsProvider({
	name: 'Credentials',
	credentials: {
		username: { label: 'Username or Email', type: 'text' },
		password: { label: 'Password', type: 'password' },
	},
	async authorize(credentials) {
		if (!credentials?.username || !credentials?.password) {
			return null;
		}

		try {
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
			} // Decode user info from access token
			const userInfo = AuthService.getUserFromToken(tokenData.accessToken);

			if (!userInfo?.sub || !userInfo?.role) {
				return null;
			}

			// Return user object for NextAuth with tokens
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
			};

			// ⚠️ Additional validation: Check if user account is active
			await validateUserAccount(user);
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
 * 🔍 Validate user account status
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
				const profileData = profileResponse.data.data; // Check if user account is active
				if (profileData.isActive === false) {
					throw new Error('Account is inactive');
				}
			}
		}
	} catch (profileError) {
		console.warn('⚠️ Could not check user active status:', profileError);
		// Continue with login if profile check fails (don't block login)
	}
}
