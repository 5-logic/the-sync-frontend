import NextAuth, { NextAuthOptions } from 'next-auth';

import { jwtCallback } from '@/lib/auth/callbacks/jwt';
import { sessionCallback } from '@/lib/auth/callbacks/session';
import { credentialsProvider } from '@/lib/auth/providers/credentials';

/**
 * 🔐 Enhanced NextAuth Configuration
 * Uses modularized components with proper TypeScript types
 */
export const authOptions: NextAuthOptions = {
	providers: [credentialsProvider],
	pages: {
		signIn: '/login',
	},
	callbacks: {
		// Use the enhanced JWT callback with profile fetching
		async jwt({ token, user, account }) {
			return await jwtCallback({ token, user, account });
		},
		// Use the enhanced session callback with proper typing
		async session({ session, token }) {
			return await sessionCallback({ session, token });
		},
	},
	session: {
		strategy: 'jwt',
	},
	// Disable debug for better performance
	debug: false,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
