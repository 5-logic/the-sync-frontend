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
	// Debug disabled
	debug: false,
	// Custom logger for better monitoring
	logger: {
		error(code, metadata) {
			console.error('NextAuth Error:', code, metadata);
		},
		warn(code) {
			console.warn('NextAuth Warning:', code);
		},
		// debug disabled
	},
	// Custom events disabled
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
