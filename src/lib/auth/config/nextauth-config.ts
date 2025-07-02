import NextAuth, { NextAuthOptions } from 'next-auth';

import { jwtCallback } from '@/lib/auth/callbacks/jwt';
import { sessionCallback } from '@/lib/auth/callbacks/session';
import { credentialsProvider } from '@/lib/auth/providers/credentials';

/**
 * Enhanced NextAuth Configuration
 * Uses modularized components with proper TypeScript types and remember me support
 */
export const authOptions: NextAuthOptions = {
	providers: [credentialsProvider],
	pages: {
		signIn: '/login',
	},
	callbacks: {
		// Use the enhanced JWT callback with profile fetching and remember me
		async jwt({ token, user, account }) {
			return await jwtCallback({ token, user, account });
		},
		// Use the enhanced session callback with proper typing and remember me
		async session({ session, token }) {
			return await sessionCallback({ session, token });
		},
	},
	session: {
		strategy: 'jwt',
		// Session max age aligned with backend refresh token (7 days maximum)
		maxAge: 7 * 24 * 60 * 60, // 7 days maximum (aligns with 1-week refresh token)
		// Update session age interval for better security
		updateAge: 24 * 60 * 60, // 24 hours
	},
	jwt: {
		// JWT max age based on backend refresh token lifetime
		maxAge: 7 * 24 * 60 * 60, // 7 days maximum (aligns with backend refresh token)
	},
	cookies: {
		sessionToken: {
			name: `next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				// Dynamic maxAge based on remember me preference
				// Will be overridden by session callback for proper remember me handling
			},
		},
	},
	// Debug disabled in production, enabled in development for error tracking
	debug: process.env.NODE_ENV === 'development',
	// Enhanced logger for better error monitoring
	logger: {
		error(code, metadata) {
			// Only log critical errors, suppress network retry errors
			if (code !== 'CLIENT_FETCH_ERROR') {
				console.error('NextAuth Error:', code, metadata);
			}
		},
		warn(code) {
			// Log all warnings in development, suppress in production
			if (process.env.NODE_ENV === 'development') {
				console.warn('NextAuth Warning:', code);
			}
		},
		debug(code, metadata) {
			// Only in development
			if (process.env.NODE_ENV === 'development') {
				console.debug('NextAuth Debug:', code, metadata);
			}
		},
	},
	// Events for better error handling
	events: {
		async signOut() {
			// Clear any additional tokens on signout
			if (typeof window !== 'undefined') {
				sessionStorage.clear();
				localStorage.removeItem('access_token');
				localStorage.removeItem('refresh_token');
			}
		},
		async session() {
			// Session created/updated
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
