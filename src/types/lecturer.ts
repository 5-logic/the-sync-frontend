import { Lecturer as BaseLecturer } from '@/schemas/lecturer';

export type ExtendedLecturer = BaseLecturer & {
	key: string;
	name: string;
	email: string;
	phoneNumber: string;
	instructionGroups: string;
	status: 'Active' | 'Inactive';
	specialPermission: boolean;
};
