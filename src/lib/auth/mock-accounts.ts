/**
 * Mock Accounts for Development
 * Hardcoded user accounts when backend is not available
 */

export interface MockAccount {
	id: string;
	username?: string;
	email?: string;
	password: string;
	role: 'admin' | 'lecturer' | 'student' | 'moderator';
	fullName: string;
	isActive: boolean;
	isModerator?: boolean;
	studentCode?: string;
	majorId?: string;
}

export const MOCK_ACCOUNTS: MockAccount[] = [
	// Admin Account
	{
		id: 'admin-001',
		username: 'admin',
		email: 'admin@thesync.com',
		password: 'Admin123@',
		role: 'admin',
		fullName: 'System Administrator',
		isActive: true,
	},

	// Lecturer Accounts
	{
		id: 'lecturer-001',
		email: 'lecturer@example.com',
		password: 'Lecturer123@',
		role: 'lecturer',
		fullName: 'Dr. John Lecturer',
		isActive: true,
		isModerator: false,
	},
	{
		id: 'moderator-001',
		email: 'moderator@example.com',
		password: 'Moderator123@',
		role: 'lecturer', // Role is lecturer but with moderator privileges
		fullName: 'Dr. Jane Moderator',
		isActive: true,
		isModerator: true,
	},

	// Student Accounts
	{
		id: 'student-001',
		email: 'student@example.com',
		password: 'Student123@',
		role: 'student',
		fullName: 'Nguyen Van Student',
		isActive: true,
		studentCode: 'SE001',
		majorId: 'major-001',
	},
	{
		id: 'student-002',
		email: 'student2@example.com',
		password: 'Student123@',
		role: 'student',
		fullName: 'Tran Thi Student',
		isActive: true,
		studentCode: 'SE002',
		majorId: 'major-001',
	},
];

/**
 * Find mock account by credentials
 */
export function findMockAccount(
	identifier: string,
	password: string,
): MockAccount | null {
	const account = MOCK_ACCOUNTS.find((acc) => {
		const matchesIdentifier =
			acc.username === identifier || acc.email === identifier;
		const matchesPassword = acc.password === password;
		return matchesIdentifier && matchesPassword;
	});

	return account || null;
}

/**
 * Generate mock JWT token for development
 */
export function generateMockToken(account: MockAccount): string {
	const payload = {
		sub: account.id,
		role: account.role,
		email: account.email,
		username: account.username,
		fullName: account.fullName,
		isModerator: account.isModerator || false,
		studentCode: account.studentCode,
		majorId: account.majorId,
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
	};

	// For development, we'll create a simple base64 encoded "token"
	// In real implementation, this would be a proper JWT
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
		'base64',
	);
	return `mock.${encodedPayload}.signature`;
}

/**
 * Mock token payload interface
 */
export interface MockTokenPayload {
	sub: string;
	role: string;
	email?: string;
	username?: string;
	fullName: string;
	isModerator: boolean;
	studentCode?: string;
	majorId?: string;
	iat: number;
	exp: number;
}

/**
 * Decode mock token (for development only)
 */
export function decodeMockToken(token: string): MockTokenPayload | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3 || parts[0] !== 'mock') {
			return null;
		}

		const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
		return payload;
	} catch {
		return null;
	}
}

/**
 * Check if development mode is enabled
 */
export function isDevelopmentMode(): boolean {
	return (
		process.env.NODE_ENV === 'development' &&
		process.env.USE_MOCK_AUTH === 'true'
	);
}
