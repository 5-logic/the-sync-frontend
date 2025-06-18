import { z } from 'zod';

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
