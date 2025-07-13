import { z } from 'zod';

// Forgot Password Request Schema
export const ForgotPasswordRequestSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
});

// OTP Verification Schema
export const OtpVerificationSchema = z.object({
	otpCode: z
		.string()
		.length(8, 'OTP must be exactly 8 digits')
		.regex(/^\d+$/, 'OTP must contain digits only'),
});

// Export inferred types
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type OtpVerification = z.infer<typeof OtpVerificationSchema>;
