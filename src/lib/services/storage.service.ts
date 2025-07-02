import { supabase } from '@/lib/supabase/client';
import { showNotification } from '@/lib/utils/notification';

export class StorageService {
	private static bucketName = 'thesync';

	/**
	 * Upload file to Supabase Storage and return public URL
	 */
	static async uploadFile(
		file: File,
		folder: string = 'support-doc',
	): Promise<string> {
		try {
			// Generate unique filename
			const fileExtension = file.name.split('.').pop();
			const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

			// Upload file to Supabase Storage
			const { data, error } = await supabase.storage
				.from(this.bucketName)
				.upload(fileName, file, {
					cacheControl: '3600',
					upsert: false,
				});

			if (error) {
				console.error('Supabase upload error:', error);
				throw new Error(`Upload failed: ${error.message}`);
			}

			// Get public URL
			const { data: urlData } = supabase.storage
				.from(this.bucketName)
				.getPublicUrl(data.path);

			return urlData.publicUrl;
		} catch (error) {
			console.error('File upload error:', error);
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
				console.error('Supabase delete error:', error);
				throw new Error(`Delete failed: ${error.message}`);
			}
		} catch (error) {
			console.error('File delete error:', error);
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
			console.error('Get download URL error:', error);
			throw error;
		}
	}
}
