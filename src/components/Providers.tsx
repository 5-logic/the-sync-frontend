'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SessionProvider } from 'next-auth/react';

interface ProvidersProps {
	children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
	return (
		<SessionProvider>
			<AntdRegistry>{children}</AntdRegistry>
		</SessionProvider>
	);
}
