/**
 * Common error handling utilities
 */

/**
 * Standard error handler for async operations
 * @param error - The error object
 * @param fallbackMessage - Default message if error doesn't have a message
 * @param context - Context for logging (e.g., function name)
 * @returns Error message string
 */
export const handleAsyncError = (
	error: unknown,
	fallbackMessage: string,
	context?: string,
): string => {
	const errorMessage = error instanceof Error ? error.message : fallbackMessage;

	if (context) {
		console.error(`Error in ${context}:`, error);
	} else {
		console.error("Error:", error);
	}

	return errorMessage;
};

/**
 * Create a standard try-catch wrapper for async operations
 * @param operation - The async operation to wrap
 * @param fallbackMessage - Default error message
 * @param context - Context for logging
 * @returns Promise that handles errors consistently
 */
export const withErrorHandling = async <T>(
	operation: () => Promise<T>,
	fallbackMessage: string,
	context?: string,
): Promise<{ data: T | null; error: string | null }> => {
	try {
		const data = await operation();
		return { data, error: null };
	} catch (error) {
		const errorMessage = handleAsyncError(error, fallbackMessage, context);
		return { data: null, error: errorMessage };
	}
};

/**
 * Standard loading state wrapper
 * @param operation - The async operation
 * @param setLoading - Loading state setter
 * @param setError - Error state setter (optional)
 */
export const withLoadingState = async <T>(
	operation: () => Promise<T>,
	setLoading: (loading: boolean) => void,
	setError?: (error: string | null) => void,
): Promise<T | null> => {
	try {
		setLoading(true);
		setError?.(null);
		return await operation();
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Operation failed";
		setError?.(errorMessage);
		console.error("Operation error:", error);
		return null;
	} finally {
		setLoading(false);
	}
};
