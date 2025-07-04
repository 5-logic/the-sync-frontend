import { z } from 'zod';

// Common Password Change Schema
export const PasswordChangeSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(12),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.discriminatedUnion('success', [
		// Success case
		z.object({
			success: z.literal(true),
			statusCode: z.number(),
			data: dataSchema,
		}),
		// Error case
		z.object({
			success: z.literal(false),
			statusCode: z.number(),
			error: z.string(),
		}),
	]);

// Export inferred types
export type PasswordChange = z.infer<typeof PasswordChangeSchema>;

export type ApiResponse<T> =
	| {
			success: true;
			statusCode: number;
			data: T;
	  }
	| {
			success: false;
			statusCode: number;
			error: string;
	  };
