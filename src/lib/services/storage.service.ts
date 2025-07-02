import { supabase } from '@/lib/supabase/client';
import { showNotification } from '@/lib/utils/notification';

export class StorageService {
	private static bucketName = 'thesync';

	/**
	 * Sanitize filename for storage compatibility
	 */
	private static sanitizeFileName(fileName: string): string {
		// Remove or replace unsafe characters
		return fileName
			.replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
			.replace(/_{2,}/g, '_') // Replace multiple underscores with single
			.replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
			.substring(0, 100); // Limit length to 100 chars
	}

	/**
	 * Upload file to Supabase Storage and return public URL
	 */
	static async uploadFile(
		file: File,
		folder: string = 'support-doc',
	): Promise<string> {
		try {
			// Generate unique filename while preserving original name
			const originalName = file.name;
			const lastDotIndex = originalName.lastIndexOf('.');

			// Handle files without extension
			const nameWithoutExt =
				lastDotIndex > 0
					? originalName.substring(0, lastDotIndex)
					: originalName;
			const fileExtension =
				lastDotIndex > 0 ? originalName.substring(lastDotIndex) : '';

			// Sanitize the filename
			const sanitizedName = this.sanitizeFileName(nameWithoutExt);
			const timestamp = Date.now();

			// Format: sanitizedOriginalName_timestamp.extension
			const fileName = `${folder}/${sanitizedName}_${timestamp}${fileExtension}`;

			// Upload file to Supabase Storage
			const { data, error } = await supabase.storage
				.from(this.bucketName)
				.upload(fileName, file, {
					cacheControl: '3600',
					upsert: false,
				});

			if (error) {
				throw new Error(`Upload failed: ${error.message}`);
			}

			// Get public URL
			const { data: urlData } = supabase.storage
				.from(this.bucketName)
				.getPublicUrl(data.path);

			return urlData.publicUrl;
		} catch (error) {
			showNotification.error(
				'Upload Failed',
				error instanceof Error ? error.message : 'Failed to upload file',
			);
			throw error;
		}
	}

	/**
	 * Delete file from Supabase Storage
	 */
	static async deleteFile(filePath: string): Promise<void> {
		try {
			// Extract path from URL if needed
			const path = filePath.includes(this.bucketName)
				? filePath.split(`${this.bucketName}/`)[1]
				: filePath;

			const { error } = await supabase.storage
				.from(this.bucketName)
				.remove([path]);

			if (error) {
				throw new Error(`Delete failed: ${error.message}`);
			}
		} catch (error) {
			showNotification.error(
				'Delete Failed',
				error instanceof Error ? error.message : 'Failed to delete file',
			);
			throw error;
		}
	}

	/**
	 * Get download URL for a file
	 */
	static async getDownloadUrl(filePath: string): Promise<string> {
		try {
			// Extract path from URL if needed (similar to deleteFile logic)
			const path = filePath.includes(this.bucketName)
				? filePath.split(`${this.bucketName}/`)[1]
				: filePath;

			const { data, error } = await supabase.storage
				.from(this.bucketName)
				.createSignedUrl(path, 3600); // 1 hour expiry

			if (error) {
				throw new Error(`Failed to get download URL: ${error.message}`);
			}

			return data.signedUrl;
		} catch (error) {
			throw error;
		}
	}
}
