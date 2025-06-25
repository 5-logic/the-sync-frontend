// Shared constants for Excel import fields
export const COMMON_GENDER_OPTIONS = [
	{ label: 'Male', value: 'Male' },
	{ label: 'Female', value: 'Female' },
];

export const COMMON_FIELDS = {
	fullName: {
		title: 'Full Name',
		key: 'fullName' as const,
		type: 'text' as const,
	},
	email: { title: 'Email', key: 'email' as const, type: 'text' as const },
	phoneNumber: {
		title: 'Phone Number',
		key: 'phoneNumber' as const,
		type: 'text' as const,
	},
	gender: {
		title: 'Gender',
		key: 'gender' as const,
		type: 'select' as const,
		options: COMMON_GENDER_OPTIONS,
	},
	studentId: {
		title: 'Student ID',
		key: 'studentId' as const,
		type: 'text' as const,
	},
};

// Pre-configured field sets for different user types
export const LECTURER_FIELDS = [
	{ ...COMMON_FIELDS.fullName, width: '30%' },
	{ ...COMMON_FIELDS.email, width: '35%' },
	{ ...COMMON_FIELDS.phoneNumber, width: '20%' },
	{ ...COMMON_FIELDS.gender, width: '15%' },
];

export const STUDENT_FIELDS = [
	{ ...COMMON_FIELDS.studentId, width: '12%' },
	{ ...COMMON_FIELDS.fullName, width: '25%' },
	{ ...COMMON_FIELDS.email, width: '28%' },
	{ ...COMMON_FIELDS.phoneNumber, width: '15%' },
	{ ...COMMON_FIELDS.gender, width: '10%' },
];

// Common import handlers
export const createImportHandler = (userType: 'student' | 'lecturer') => {
	return (data: unknown[]) => {
		console.log(`Imported ${userType}s:`, data);
	};
};
