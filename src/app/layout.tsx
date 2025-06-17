import '@/app/globals.css';
import ChatbotWidget from '@/components/ChatbotWidget';
import Providers from '@/components/Providers';

export { metadata } from '@/app/metadata';

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
