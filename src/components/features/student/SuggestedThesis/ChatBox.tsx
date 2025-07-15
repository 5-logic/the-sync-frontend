import { DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Typography } from 'antd';
import { useState } from 'react';

const { Text } = Typography;

interface Topic {
	id: number;
	title: string;
	description: string;
	tags: string[];
	confidence: number;
}

interface ChatBoxProps {
	selectedTopic: Topic | null;
}

interface Message {
	sender: 'ai' | 'user';
	content: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ selectedTopic }) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');

	const sendMessage = () => {
		if (!input.trim()) return;
		setMessages([...messages, { sender: 'user', content: input }]);
		setInput('');
		// Mock AI reply
		setTimeout(() => {
			setMessages((prev) => [
				...prev,
				{ sender: 'ai', content: `AI reply to: "${input}"` },
			]);
		}, 500);
	};

	return (
		<Card title="Chat with AI Assistant">
			{selectedTopic ? (
				<>
					<Text strong>Selected Topic: {selectedTopic.title}</Text>

					<div
						style={{
							marginTop: 16,
							padding: '12px 16px',
							background: '#f9f9f9',
							borderRadius: 8,
							maxHeight: 300,
							overflowY: 'auto',
						}}
					>
						{messages.map((msg, idx) => (
							<div key={idx} style={{ marginBottom: 12 }}>
								<Text type={msg.sender === 'ai' ? 'secondary' : undefined}>
									<strong>
										{msg.sender === 'ai' ? 'AI Assistant:' : 'You:'}
									</strong>{' '}
									{msg.content}
								</Text>
							</div>
						))}
					</div>

					<Space style={{ marginTop: 16, width: '100%' }} direction="vertical">
						<Input.TextArea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							rows={2}
							placeholder="Ask the AI to refine the topic..."
							onPressEnter={(e) => {
								if (!e.shiftKey) {
									e.preventDefault();
									sendMessage();
								}
							}}
						/>
						<Button type="primary" onClick={sendMessage}>
							Send
						</Button>
						<Button icon={<DownloadOutlined />}>Download Template</Button>
					</Space>
				</>
			) : (
				<Text type="secondary">
					Please select a topic to start chatting with AI.
				</Text>
			)}
		</Card>
	);
};

export default ChatBox;
