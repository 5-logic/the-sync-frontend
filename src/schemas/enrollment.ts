import { z } from 'zod';

import { EnrollmentStatusSchema } from '@/schemas/_enums';

export const EnrollmentSchema = z.object({
	studentId: z.string(),
	semesterId: z.string().uuid(),
	status: EnrollmentStatusSchema,
});

export const EnrollmentCreateSchema = EnrollmentSchema;
export const EnrollmentUpdateSchema = EnrollmentSchema.pick({
	status: true,
});

// Export inferred types
export type Enrollment = z.infer<typeof EnrollmentSchema>;
export type EnrollmentCreate = z.infer<typeof EnrollmentCreateSchema>;
export type EnrollmentUpdate = z.infer<typeof EnrollmentUpdateSchema>;
