import '@/app/globals.css';
import { createMetadata } from '@/app/metadata';
import ChatbotWidget from '@/components/ChatbotWidget';
import Providers from '@/components/Providers';

export const metadata = createMetadata({
	title: 'Login',
	description: 'Group Formation and Capstone Thesis Development',
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body suppressHydrationWarning>
				<Providers>
					{children}
					<ChatbotWidget />
				</Providers>
			</body>
		</html>
	);
}
