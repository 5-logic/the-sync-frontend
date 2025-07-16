import httpClient from '@/lib/services/_httpClient';

export interface ProfileData {
	fullName?: string;
	name?: string;
	email?: string;
	phoneNumber?: string;
	gender?: string;
	isActive?: boolean;
	avatar?: string;
	username?: string;
	studentCode?: string;
	majorId?: string;
	major?: string;
	isModerator?: boolean;
}

/**
 * Fetch user profile data based on role
 */
export async function fetchUserProfile(user: {
	id: string;
	role: string;
	accessToken: string;
}): Promise<ProfileData | null> {
	try {
		// Determine endpoint based on user role
		const endpoint = getProfileEndpoint(user.role, user.id);

		if (!endpoint) {
			console.warn('Unknown user role:', user.role);
			return null;
		}

		const response = await httpClient.get(endpoint, {
			headers: {
				Authorization: `Bearer ${user.accessToken}`,
			},
		});

		if (
			response.status === 200 &&
			response.data?.success &&
			response.data?.data
		) {
			const profileData = response.data.data;
			return profileData;
		} else {
			console.warn('Failed to fetch profile:', response.status);
			return null;
		}
	} catch (error) {
		console.error('Error fetching user profile:', error);
		return null;
	}
}

/**
 * 🛣️ Get profile endpoint based on user role
 */
function getProfileEndpoint(role: string, userId: string): string | null {
	switch (role) {
		case 'admin':
			// Admin endpoint changed to GET /admins (no user ID needed)
			return `/admins`;
		case 'lecturer':
			return `/lecturers/${userId}`;
		case 'moderator':
			// Moderator uses lecturer endpoint
			return `/lecturers/${userId}`;
		case 'student':
			return `/students/${userId}`;
		default:
			return null;
	}
}

/**
 * 🏷️ Map profile data to token fields based on user role
 */
export function mapProfileToToken(
	profile: ProfileData,
	role: string,
	fallbackData: { username?: string; email?: string },
) {
	const mappedData: Record<string, unknown> = {};

	switch (role) {
		case 'admin':
			// Admin-specific fields (from AdminSchema)
			mappedData.username = profile.username ?? fallbackData.username;
			mappedData.fullName =
				profile.username ?? fallbackData.username ?? 'Admin';
			mappedData.email = profile.email ?? fallbackData.email;
			break;

		case 'student':
			// Student-specific fields (from StudentSchema)
			mappedData.fullName =
				profile.fullName ?? profile.name ?? fallbackData.email ?? 'Student';
			mappedData.email = profile.email ?? fallbackData.email;
			mappedData.phoneNumber = profile.phoneNumber;
			mappedData.gender = profile.gender;
			mappedData.isActive = profile.isActive;
			mappedData.avatar = profile.avatar;
			mappedData.studentCode = profile.studentCode ?? profile.studentCode;
			mappedData.majorId = profile.majorId;
			mappedData.major = profile.major;
			break;

		case 'lecturer':
			// Lecturer-specific fields (from LecturerSchema)
			mappedData.fullName =
				profile.fullName ?? profile.name ?? fallbackData.email ?? 'Lecturer';
			mappedData.email = profile.email ?? fallbackData.email;
			mappedData.phoneNumber = profile.phoneNumber;
			mappedData.gender = profile.gender;
			mappedData.isActive = profile.isActive;
			mappedData.avatar = profile.avatar;
			mappedData.isModerator = profile.isModerator ?? false;
			break;

		case 'moderator':
			// Moderator-specific fields (same as lecturer but force isModerator = true)
			mappedData.fullName =
				profile.fullName ?? profile.name ?? fallbackData.email ?? 'Moderator';
			mappedData.email = profile.email ?? fallbackData.email;
			mappedData.phoneNumber = profile.phoneNumber;
			mappedData.gender = profile.gender;
			mappedData.isActive = profile.isActive;
			mappedData.avatar = profile.avatar;
			mappedData.isModerator = true; // Force true for moderators
			break;
		default:
			mappedData.fullName = fallbackData.email ?? 'User';
	}

	return mappedData;
}

/**
 * Get fallback display name based on role
 */
export function getFallbackName(
	role: string,
	fallbackData: { username?: string; email?: string },
): string {
	switch (role) {
		case 'admin':
			return fallbackData.username ?? 'Admin';
		case 'student':
			return fallbackData.email ?? 'Student';
		case 'lecturer':
			return fallbackData.email ?? 'Lecturer';
		case 'moderator':
			return fallbackData.email ?? 'Moderator';
		default:
			return fallbackData.email ?? 'User';
	}
}
