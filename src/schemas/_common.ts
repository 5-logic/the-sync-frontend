import { z } from 'zod';

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		data: dataSchema,
		message: z.string().optional(),
		success: z.boolean(),
	});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
	dataSchema: T,
) =>
	z.object({
		data: z.array(dataSchema),
		total: z.number().int().nonnegative(),
		page: z.number().int().positive(),
		limit: z.number().int().positive(),
	});

// Export inferred types
export type ApiResponse<T> = {
	data: T;
	message?: string;
	success: boolean;
};

export type PaginatedResponse<T> = {
	data: T[];
	total: number;
	page: number;
	limit: number;
};
