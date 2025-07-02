'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

import { configureNotification } from '@/lib/utils/notification';

interface ProvidersProps {
	children: React.ReactNode;
}

export default function Providers({ children }: Readonly<ProvidersProps>) {
	// Configure notification settings on app initialization
	useEffect(() => {
		configureNotification();
	}, []);

	return (
		<SessionProvider
			// DISABLE automatic session refresh to prevent spam requests
			refetchInterval={0} // 0 = disabled
			// DISABLE refetch on window focus to prevent unnecessary calls
			refetchOnWindowFocus={false}
			// Add basePath to ensure correct API endpoint
			basePath="/api/auth"
			// DISABLE offline refetch
			refetchWhenOffline={false}
		>
			<AntdRegistry>{children}</AntdRegistry>
		</SessionProvider>
	);
}
