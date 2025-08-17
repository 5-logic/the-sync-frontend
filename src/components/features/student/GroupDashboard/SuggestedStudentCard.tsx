import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Flex, Progress, Row, Typography } from "antd";

import { TagList } from "@/components/common/TagList";
import type { SuggestedStudent } from "@/lib/services/ai.service";

const { Text, Title } = Typography;

interface SuggestedStudentCardProps {
	readonly student: SuggestedStudent;
	readonly onAdd: (student: SuggestedStudent) => void;
	readonly loading?: boolean;
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
		if (percentage >= 70) return "#52c41a"; // green
		if (percentage >= 50) return "#faad14"; // orange
		return "#ff4d4f"; // red
	};

	return (
		<Card
			size="small"
			className="mb-3"
			bodyStyle={{ padding: "12px" }}
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
					<Flex
						align="center"
						gap={8}
						className="mb-2"
						style={{ minHeight: "60px", maxHeight: "60px" }}
					>
						<div style={{ minHeight: "54px", maxHeight: "54px" }}>
							<Title
								level={5}
								className="mb-0 text-sm"
								style={{ lineHeight: "18px", height: "18px" }}
							>
								{student.fullName}
							</Title>
							<Text
								type="secondary"
								className="text-xs"
								style={{
									lineHeight: "14px",
									height: "42px",
									display: "block",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
							>
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
						</Flex>
					</div>

					{/* Responsibilities */}
					<div>
						<Text className="text-xs text-gray-500 mb-1 block">
							Responsibilities:
						</Text>
						{student.responsibilities.length > 0 ? (
							<TagList
								items={student.responsibilities}
								color="green"
								maxVisible={3}
								minHeight="auto"
								maxHeight="none"
							/>
						) : (
							<Text className="text-xs text-gray-400">
								No responsibilities specified
							</Text>
						)}
					</div>
				</Col>
			</Row>
		</Card>
	);
}
