import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			role: string;
			username?: string;
			isModerator?: boolean;
			// Common user fields (UserSchema)
			fullName?: string;
			email?: string;
			phoneNumber?: string;
			gender?: string;
			isActive?: boolean;
			avatar?: string;
			// Student-specific fields
			studentId?: string;
			majorId?: string;
			major?: string;
			department?: string;
		} & DefaultSession['user'];
		accessToken?: string;
		refreshToken?: string;
		rememberMe?: boolean;
	}
	interface User {
		id: string;
		role: string;
		username?: string;
		isModerator?: boolean;
		accessToken?: string;
		refreshToken?: string;
		rememberMe?: boolean;
		// Common user fields
		fullName?: string;
		email?: string;
		phoneNumber?: string;
		gender?: string;
		isActive?: boolean;
		avatar?: string;
		// Student-specific fields
		studentId?: string;
		majorId?: string;
		major?: string;
		department?: string;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string;
		role: string;
		username?: string;
		isModerator?: boolean;
		accessToken?: string;
		refreshToken?: string;
		accessTokenExpires?: number;
		rememberMe?: boolean;
		// Common user fields (UserSchema)
		fullName?: string;
		email?: string;
		phoneNumber?: string;
		gender?: string;
		isActive?: boolean;
		avatar?: string;
		// Student-specific fields
		studentId?: string;
		majorId?: string;
		major?: string;
		department?: string;
	}
}
