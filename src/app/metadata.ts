import { Metadata } from 'next';

interface MetadataConfig {
	title: string;
	description: string;
}

export function createMetadata({
	title,
	description,
}: MetadataConfig): Metadata {
	return {
		title: `TheSync | ${title}`,
		description,
		icons: {
			icon: '/icons/TheSyncLogo.ico',
			shortcut: '/icons/TheSyncLogo.ico',
		},
	};
}
