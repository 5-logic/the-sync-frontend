import { Typography } from 'antd';

const { Text } = Typography;

interface ChatMessageProps {
	sender: 'ai' | 'user';
	content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, content }) => {
	return (
		<div style={{ marginBottom: 12 }}>
			<Text type={sender === 'ai' ? 'secondary' : undefined}>
				<strong>{sender === 'ai' ? 'AI Assistant:' : 'You:'}</strong> {content}
			</Text>
		</div>
	);
};

export default ChatMessage;
