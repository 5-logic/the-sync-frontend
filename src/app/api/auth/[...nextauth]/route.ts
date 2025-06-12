import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username or Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				console.log('🔐 NextAuth Authorize called');

				if (!credentials?.username || !credentials?.password) {
					console.log('❌ Missing credentials');
					return null;
				}

				// Test credentials - 4 different user types
				const testUsers = {
					// Student - Email login
					'student@fpt.edu.vn': {
						id: '1',
						name: 'John Student',
						email: 'student@fpt.edu.vn',
						role: 'student',
					},

					// Regular Lecturer - Email login
					'lecturer@fpt.edu.vn': {
						id: '2',
						name: 'Dr. Jane Lecturer',
						email: 'lecturer@fpt.edu.vn',
						role: 'lecturer',
						isModerator: false,
					},

					// Lecturer with Moderator privileges - Email login
					'moderator@fpt.edu.vn': {
						id: '3',
						name: 'Prof. Mike Moderator',
						email: 'moderator@fpt.edu.vn',
						role: 'lecturer',
						isModerator: true,
					},

					// Admin - Username login
					admin: {
						id: '4',
						name: 'System Admin',
						username: 'admin',
						email: 'admin@fpt.edu.vn',
						role: 'admin',
					},
				};

				const user = testUsers[credentials.username as keyof typeof testUsers];

				if (user && credentials.password === 'test123') {
					console.log(
						'✅ Authentication successful for:',
						credentials.username,
					);
					console.log('👤 User details:', {
						id: user.id,
						name: user.name,
						role: user.role,
						isModerator: 'isModerator' in user ? user.isModerator : undefined,
					});
					return user;
				} else {
					console.log('❌ Authentication failed');
					return null;
				}
			},
		}),
	],
	pages: {
		signIn: '/login',
	},
	callbacks: {
		async jwt({ token, user }) {
			console.log('🔐 JWT callback - token:', token, 'user:', user);

			// Add user data to token on first sign in
			if (user) {
				token.role = user.role;
				token.id = user.id;
				// Add isModerator for lecturers
				if ('isModerator' in user) {
					token.isModerator = user.isModerator;
				}
			}

			return token;
		},
		async session({ session, token }) {
			console.log('🔐 Session callback - session:', session, 'token:', token);

			// Send properties to the client
			if (session.user) {
				session.user.id = token.id as string;
				session.user.role = token.role as string;
				// Add isModerator to session if exists
				if (token.isModerator !== undefined) {
					session.user.isModerator = token.isModerator as boolean;
				}
			}

			return session;
		},
	},
	session: {
		strategy: 'jwt',
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
