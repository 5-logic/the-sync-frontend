import { z } from 'zod';

import { RequestStatusSchema, RequestTypeSchema } from '@/schemas/_enums';

export const RequestSchema = z.object({
	id: z.string().uuid(),
	type: RequestTypeSchema,
	status: RequestStatusSchema,
	studentCode: z.string(),
	groupId: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const RequestCreateSchema = RequestSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).extend({
	status: RequestStatusSchema.default('Pending'),
});

export const RequestUpdateSchema = RequestSchema.pick({
	status: true,
});

// Export inferred types
export type Request = z.infer<typeof RequestSchema>;
export type RequestCreate = z.infer<typeof RequestCreateSchema>;
export type RequestUpdate = z.infer<typeof RequestUpdateSchema>;
