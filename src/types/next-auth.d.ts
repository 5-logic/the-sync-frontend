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
	}
	interface User {
		id: string;
		role: string;
		username?: string;
		isModerator?: boolean;
		accessToken?: string;
		refreshToken?: string;
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
