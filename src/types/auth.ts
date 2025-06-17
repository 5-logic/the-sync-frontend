import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Base auth types
export interface AuthState {
	isAuthorized: boolean | null;
	isLoading: boolean;
	error?: string;
}

// Token types
export interface TokenData {
	accessToken: string;
	refreshToken: string;
	expiresAt?: number;
}

export interface UserTokenInfo {
	id: string;
	email: string;
	role: string;
	exp?: number;
	iat?: number;
}

// Login types
export interface LoginCredentials {
	identifier: string; // email for users, username for admin
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user?: {
		id: string;
		email?: string;
		username?: string;
		role: string;
		fullName?: string;
		isModerator?: boolean;
	};
}

// Session types (extending NextAuth types)
export interface ExtendedSession extends Session {
	user: {
		id: string;
		email?: string;
		username?: string;
		role: string;
		fullName?: string;
		isModerator?: boolean;
		// Add role-specific fields
		studentId?: string;
		lecturerId?: string;
		majorId?: string;
		majorName?: string;
		phone?: string;
		gender?: string;
		dateOfBirth?: string;
		academicLevel?: string;
	};
	accessToken?: string;
	refreshToken?: string;
}

export interface ExtendedJWT extends Omit<JWT, 'id'> {
	id?: string;
	email?: string;
	username?: string;
	role?: string;
	fullName?: string;
	isModerator?: boolean;
	accessToken?: string;
	refreshToken?: string;
	// Role-specific fields
	studentId?: string;
	lecturerId?: string;
	majorId?: string;
	majorName?: string;
	phone?: string;
	gender?: string;
	dateOfBirth?: string;
	academicLevel?: string;
}

// Profile types
export interface UserProfile {
	id: string;
	email?: string;
	fullName?: string;
	role: string;
	isModerator?: boolean;
	isActive?: boolean;
	// Role-specific fields
	studentId?: string;
	lecturerId?: string;
	majorId?: string;
	majorName?: string;
	phone?: string;
	gender?: string;
	dateOfBirth?: string;
	academicLevel?: string;
}

// Token-specific types
export interface TokenPayload {
	id: string;
	email?: string;
	username?: string;
	role: string;
	exp: number;
	iat: number;
}

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
}

export interface TokenValidationResult {
	isValid: boolean;
	isExpired: boolean;
	payload?: TokenPayload;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

export interface RefreshTokenResponse {
	accessToken: string;
	refreshToken?: string; // Some APIs may not return new refresh token
}

// Session-specific types
export interface SessionUser {
	id: string;
	email?: string;
	username?: string;
	name?: string;
	role: string;
	fullName?: string;
	isModerator?: boolean;
	// Role-specific fields
	studentId?: string;
	lecturerId?: string;
	majorId?: string;
	majorName?: string;
	phone?: string;
	gender?: string;
	dateOfBirth?: string;
	academicLevel?: string;
}

export interface ExtendedSessionData extends Session {
	user: SessionUser;
	accessToken?: string;
	refreshToken?: string;
}

export interface SessionStatus {
	status: 'loading' | 'authenticated' | 'unauthenticated';
	session: ExtendedSessionData | null;
}
