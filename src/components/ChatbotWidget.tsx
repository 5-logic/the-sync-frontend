'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
	interface Window {
		chatbaseConfig?: {
			chatbotId?: string;
		};
	}
}

const ChatbotWidget = () => {
	useEffect(() => {
		if (typeof window !== 'undefined') {
			window.chatbaseConfig = {
				chatbotId: process.env.NEXT_PUBLIC_CHATBOT_ID,
			};
		}
	}, []);

	return (
		<Script
			src={
				process.env.NEXT_PUBLIC_CHATBOT_URL ??
				'https://www.chatbase.co/embed.min.js'
			}
			id={process.env.NEXT_PUBLIC_CHATBOT_ID ?? 'chatbase-script'}
			strategy="lazyOnload"
		/>
	);
};

export default ChatbotWidget;
