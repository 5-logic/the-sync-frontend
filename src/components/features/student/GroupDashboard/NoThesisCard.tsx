import { BulbOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Row, Typography } from 'antd';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

// ThesisOptionCard component
interface ThesisOptionCardProps {
	readonly title: string;
	readonly description: string;
	readonly buttonText: string;
	readonly icon: React.ReactNode;
	readonly buttonType?: 'primary' | 'default';
	readonly onClick?: () => void;
}

function ThesisOptionCard({
	title,
	description,
	buttonText,
	icon,
	buttonType = 'primary',
	onClick,
}: ThesisOptionCardProps) {
	return (
		<Card className="border border-gray-200 rounded-md h-full">
			<div className="flex flex-col items-center text-center space-y-3 md:space-y-4 p-2">
				<div className="flex justify-center text-gray-500 text-4xl">{icon}</div>
				<Title
					level={4}
					className="text-base md:text-lg font-bold text-gray-600 mb-2"
				>
					{title}
				</Title>
				<Text className="text-sm text-gray-500 leading-relaxed mb-4">
					{description}
				</Text>
				<Button
					type={buttonType}
					className="px-4 md:px-6 py-2 text-sm rounded w-full sm:w-auto"
					block
					onClick={onClick}
				>
					{buttonText}
				</Button>
			</div>
		</Card>
	);
}

export default function NoThesisCard() {
	const router = useRouter();

	const handleViewAvailableThesis = () => {
		router.push('/student/list-thesis');
	};

	return (
		<div className="space-y-4">
			<Title level={4} className="text-base font-bold text-gray-600">
				Choose Your Thesis Topic
			</Title>
			<Divider className="bg-gray-100 my-3" />

			<Row gutter={[16, 16]}>
				<Col xs={24} md={12}>
					<ThesisOptionCard
						title="Choose Available Thesis"
						description="Browse and select from approved thesis from our database"
						buttonText="View Available Thesis"
						icon={<FileTextOutlined />}
						buttonType="primary"
						onClick={handleViewAvailableThesis}
					/>
				</Col>
				<Col xs={24} md={12}>
					<ThesisOptionCard
						title="AI Thesis Suggestions"
						description="Get personalized thesis topic recommendations based on your interests"
						buttonText="Get AI Suggestions"
						icon={<BulbOutlined />}
						buttonType="default"
					/>
				</Col>
			</Row>
		</div>
	);
}
