import { z } from 'zod';

import { RequestStatusSchema, RequestTypeSchema } from '@/schemas/_enums';

export const RequestSchema = z.object({
	id: z.string().uuid(),
	type: RequestTypeSchema,
	status: RequestStatusSchema,
	studentId: z.string(),
	groupId: z.string().uuid(),
});

export const RequestCreateSchema = RequestSchema.omit({ id: true }).extend({
	status: RequestStatusSchema.optional().default('pending'),
});

export const RequestUpdateSchema = RequestSchema.pick({
	status: true,
});

// Export inferred types
export type Request = z.infer<typeof RequestSchema>;
export type RequestCreate = z.infer<typeof RequestCreateSchema>;
export type RequestUpdate = z.infer<typeof RequestUpdateSchema>;
