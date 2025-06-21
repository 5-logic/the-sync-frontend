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
		<SessionProvider>
			<AntdRegistry>{children}</AntdRegistry>
		</SessionProvider>
	);
}
