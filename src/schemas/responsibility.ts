import { z } from 'zod';

export const ResponsibilitySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(100),
	createdAt: z.string().transform((val) => new Date(val)),
	updatedAt: z.string().transform((val) => new Date(val)),
});

export const StudentExpectedResponsibilitySchema = z.object({
	studentCode: z.string(),
	responsibilityId: z.string().uuid(),
});

export const GroupExpectedResponsibilitySchema = z.object({
	groupId: z.string().uuid(),
	responsibilityId: z.string().uuid(),
});

export const ResponsibilityCreateSchema = ResponsibilitySchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
export const ResponsibilityUpdateSchema = ResponsibilitySchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial();

// Export inferred types
export type Responsibility = z.infer<typeof ResponsibilitySchema>;
export type ResponsibilityCreate = z.infer<typeof ResponsibilityCreateSchema>;
export type ResponsibilityUpdate = z.infer<typeof ResponsibilityUpdateSchema>;
export type StudentExpectedResponsibility = z.infer<
	typeof StudentExpectedResponsibilitySchema
>;
export type GroupExpectedResponsibility = z.infer<
	typeof GroupExpectedResponsibilitySchema
>;
