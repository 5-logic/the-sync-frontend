import type { Metadata } from 'next';

import '@/app/globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
	title: 'TheSync',
	description: 'Group Formation and Capstone Thesis Development',
	icons: {
		icon: '/icons/TheSyncLogo.ico',
		shortcut: '/icons/TheSyncLogo.ico',
	},
};

const RootLayout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<html lang="en" suppressHydrationWarning>
			<body suppressHydrationWarning={true}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
};

export default RootLayout;
