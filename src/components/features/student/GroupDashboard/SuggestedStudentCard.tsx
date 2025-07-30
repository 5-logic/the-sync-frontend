import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Progress, Row, Typography } from 'antd';

import { TagList } from '@/components/common/TagList';
import type { SuggestedStudent } from '@/lib/services/ai.service';

const { Text, Title } = Typography;

interface SuggestedStudentCardProps {
	student: SuggestedStudent;
	onAdd: (student: SuggestedStudent) => void;
	loading?: boolean;
}

export default function SuggestedStudentCard({
	student,
	onAdd,
	loading = false,
}: SuggestedStudentCardProps) {
	const handleAdd = () => {
		onAdd(student);
	};

	// Get progress color based on match percentage
	const getProgressColor = (percentage: number) => {
		if (percentage >= 70) return '#52c41a'; // green
		if (percentage >= 50) return '#faad14'; // orange
		return '#ff4d4f'; // red
	};

	return (
		<Card
			size="small"
			className="mb-3"
			bodyStyle={{ padding: '12px' }}
			extra={
				<Button
					type="primary"
					icon={<PlusOutlined />}
					size="small"
					loading={loading}
					onClick={handleAdd}
				>
					Add
				</Button>
			}
		>
			<Row gutter={[12, 8]} align="middle">
				{/* Student Info */}
				<Col flex="auto">
					<Flex align="center" gap={8} className="mb-2">
						<UserOutlined style={{ color: '#1890ff' }} />
						<div>
							<Title level={5} className="mb-0 text-sm">
								{student.fullName}
							</Title>
							<Text type="secondary" className="text-xs">
								{student.studentCode} • {student.email}
							</Text>
						</div>
					</Flex>

					{/* Match Percentage */}
					<div className="mb-2">
						<Flex align="center" gap={6}>
							<Text strong className="text-xs">
								Match:
							</Text>
							<Progress
								percent={student.matchPercentage}
								size="small"
								strokeColor={getProgressColor(student.matchPercentage)}
								style={{ flex: 1, maxWidth: 100 }}
							/>
							<Text className="text-xs font-medium">
								{student.matchPercentage}%
							</Text>
						</Flex>
					</div>

					{/* Skills */}
					{student.skills.length > 0 && (
						<div className="mb-2">
							<Text className="text-xs text-gray-500 mb-1 block">Skills:</Text>
							<TagList
								items={student.skills}
								color="blue"
								maxVisible={2}
								showLevel={true}
								minHeight="32px"
								maxHeight="32px"
							/>
						</div>
					)}

					{/* Responsibilities */}
					{student.responsibilities.length > 0 && (
						<div>
							<Text className="text-xs text-gray-500 mb-1 block">
								Responsibilities:
							</Text>
							<TagList
								items={student.responsibilities}
								color="green"
								maxVisible={2}
								minHeight="32px"
								maxHeight="32px"
							/>
						</div>
					)}
				</Col>
			</Row>
		</Card>
	);
}
