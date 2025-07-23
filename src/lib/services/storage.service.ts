import { supabase } from '@/lib/supabase/client';
import { showNotification } from '@/lib/utils/notification';

export class StorageService {
	private static readonly bucketName = 'thesync';

	/**
	 * Sanitize filename for storage compatibility
	 */
	private static sanitizeFileName(fileName: string): string {
		// Remove or replace unsafe characters
		let sanitized = fileName
			.replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
			.replace(/_{2,}/g, '_'); // Replace multiple underscores with single

		// Safely remove leading underscores
		while (sanitized.startsWith('_')) {
			sanitized = sanitized.substring(1);
		}

		// Safely remove trailing underscores
		while (sanitized.endsWith('_')) {
			sanitized = sanitized.substring(0, sanitized.length - 1);
		}

		// Limit length to 100 chars
		return sanitized.substring(0, 100);
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
	}

	/**
	 * Extract filename from Supabase URL
	 */
	static getFileNameFromUrl(url: string): string {
		try {
			// Extract path from URL first
			const path = url.includes(this.bucketName)
				? url.split(`${this.bucketName}/`)[1]
				: url;

			// Get filename from path (remove folder structure)
			const pathParts = path.split('/');
			const filename = pathParts[pathParts.length - 1];

			// Remove query parameters if any
			return filename.split('?')[0];
		} catch {
			return 'Unknown file';
		}
	}
}
