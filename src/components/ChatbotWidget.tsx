'use client';

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

			const script = document.createElement('script');
			script.src =
				process.env.NEXT_PUBLIC_CHATBOT_URL ||
				'https://www.chatbase.co/embed.min.js';
			script.id = process.env.NEXT_PUBLIC_CHATBOT_ID || 'chatbase-script';
			script.defer = true;

			if (!document.getElementById(script.id)) {
				document.body.appendChild(script);
			}
		}
	}, []);

	return null;
};

export default ChatbotWidget;
