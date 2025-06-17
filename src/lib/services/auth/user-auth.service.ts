import {
	RefreshToken,
	RefreshTokenData,
	TokenData,
	UserLogin,
} from '@/schemas/auth';

import { BaseAuthService } from './base-auth.service';

/**
 * 👤 User Authentication Service
 * Handles user (student/lecturer) login and token refresh
 */
export class UserAuthService extends BaseAuthService {
	/**
	 * 🔐 User Login (Student/Lecturer)
	 */
	static async login(credentials: UserLogin): Promise<TokenData> {
		return super.performLogin('/auth/user/login', credentials);
	}

	/**
	 * 🔄 User Token Refresh
	 */
	static async refresh(refreshToken: RefreshToken): Promise<RefreshTokenData> {
		return super.performRefresh('/auth/user/refresh', refreshToken);
	}
}
