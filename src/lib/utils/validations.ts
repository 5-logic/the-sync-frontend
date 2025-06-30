/**
 * Vietnamese phone number validation utilities
 */

/**
 * Clean phone number by removing all non-digit characters except + sign
 */
export function cleanPhoneNumber(phone: string): string {
	return phone.replace(/[^\d+]/g, '');
}

/**
 * Normalize Vietnamese phone number to standard format (0xxxxxxxxx)
 */
export function normalizeVietnamesePhone(phone: string): string {
	const cleaned = cleanPhoneNumber(phone);

	// Handle +84 format
	if (cleaned.startsWith('+84')) {
		return '0' + cleaned.substring(3);
	}

	// Handle 84 format (without +)
	if (cleaned.startsWith('84') && cleaned.length === 11) {
		return '0' + cleaned.substring(2);
	}

	return cleaned;
}

/**
 * Validate Vietnamese mobile phone numbers
 * Supports: 03x, 05x, 07x, 08x, 09x networks
 */
export function isValidVietnameseMobile(phone: string): boolean {
	const normalized = normalizeVietnamesePhone(phone);

	// Must be exactly 10 digits and start with 0
	if (normalized.length !== 10 || !normalized.startsWith('0')) {
		return false;
	}

	// Valid mobile prefixes in Vietnam
	const mobilePatterns = [
		/^03[2-9]\d{7}$/, // Viettel, MobiFone, VinaPhone (032-039)
		/^05[6-9]\d{7}$/, // Vietnamobile, Gmobile (056-059)
		/^07\d{8}$/, // Viettel (070-079)
		/^08[1-9]\d{7}$/, // Viettel, MobiFone, VinaPhone (081-089)
		/^09\d{8}$/, // Viettel, MobiFone, VinaPhone (090-099)
	];

	return mobilePatterns.some((pattern) => pattern.test(normalized));
}

/**
 * Validate Vietnamese landline phone numbers
 * Supports: 02x area codes
 */
export function isValidVietnameseLandline(phone: string): boolean {
	const normalized = normalizeVietnamesePhone(phone);

	// Must be exactly 10 digits and start with 02
	if (normalized.length !== 10 || !normalized.startsWith('02')) {
		return false;
	}

	// Valid landline pattern: 02x-xxxx-xxxx
	const landlinePattern = /^02\d{8}$/;

	return landlinePattern.test(normalized);
}

/**
 * Validate any Vietnamese phone number (mobile or landline)
 */
export function isValidVietnamesePhone(phone: string): boolean {
	if (!phone || phone.trim() === '') {
		return false;
	}

	return isValidVietnameseMobile(phone) || isValidVietnameseLandline(phone);
}

/**
 * Get phone number type
 */
export function getVietnamesePhoneType(
	phone: string,
): 'mobile' | 'landline' | 'invalid' {
	if (isValidVietnameseMobile(phone)) {
		return 'mobile';
	}

	if (isValidVietnameseLandline(phone)) {
		return 'landline';
	}

	return 'invalid';
}

/**
 * Format Vietnamese phone number for display
 * Returns format: 0xxx xxx xxx or 0xx xxxx xxxx
 */
export function formatVietnamesePhone(phone: string): string {
	const normalized = normalizeVietnamesePhone(phone);

	if (!isValidVietnamesePhone(normalized)) {
		return phone; // Return original if invalid
	}

	// Format mobile numbers: 0xxx xxx xxx
	if (isValidVietnameseMobile(normalized)) {
		return normalized.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
	}

	// Format landline numbers: 0xx xxxx xxxx
	if (isValidVietnameseLandline(normalized)) {
		return normalized.replace(/(\d{3})(\d{4})(\d{3})/, '$1 $2 $3');
	}

	return normalized;
}

/**
 * Get phone network provider (for mobile numbers)
 */
export function getVietnamesePhoneProvider(phone: string): string {
	const normalized = normalizeVietnamesePhone(phone);

	if (!isValidVietnameseMobile(normalized)) {
		return 'Unknown';
	}

	const prefix = normalized.substring(0, 3);

	// Network mapping based on current Vietnamese telecom prefixes
	const networkMap: Record<string, string> = {
		'032': 'Viettel',
		'033': 'Viettel',
		'034': 'Viettel',
		'035': 'Viettel',
		'036': 'Viettel',
		'037': 'Viettel',
		'038': 'Viettel',
		'039': 'Viettel',
		'056': 'Vietnamobile',
		'058': 'Vietnamobile',
		'059': 'Gmobile',
		'070': 'Viettel',
		'079': 'Viettel',
		'077': 'Viettel',
		'076': 'Viettel',
		'078': 'Viettel',
		'081': 'Viettel',
		'082': 'Viettel',
		'083': 'Viettel',
		'084': 'Viettel',
		'085': 'Viettel',
		'088': 'Viettel',
		'086': 'MobiFone',
		'089': 'MobiFone',
		'090': 'MobiFone',
		'093': 'MobiFone',
		'091': 'VinaPhone',
		'094': 'VinaPhone',
		'092': 'Vietnamobile',
		'096': 'Vietnamobile',
		'097': 'Vietnamobile',
		'098': 'Vietnamobile',
		'095': 'Gmobile',
		'099': 'Gmobile',
	};

	return networkMap[prefix] || 'Unknown';
}
