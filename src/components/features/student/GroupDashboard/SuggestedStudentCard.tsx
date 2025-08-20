import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Flex, Progress, Row, Typography } from "antd";

import {
	ResponsibilityRadarChart,
	ResponsibilityData,
} from "@/components/common/radar-chart";
import type { SuggestedStudent } from "@/lib/services/ai.service";
import { useMajorStore } from "@/store";

const { Text, Title } = Typography;

interface SuggestedStudentCardProps {
	readonly student: SuggestedStudent;
	readonly onAdd: (student: SuggestedStudent) => void;
	readonly loading?: boolean;
	readonly isSelected?: boolean;
}

export default function SuggestedStudentCard({
	student,
	onAdd,
	loading = false,
	isSelected = false,
}: SuggestedStudentCardProps) {
	const { getMajorById } = useMajorStore();

	const handleAdd = () => {
		onAdd(student);
	};

	// Get major name from cache
	const major = getMajorById(student.majorId);
	const majorName = major ? `${major.name} (${major.code})` : "Unknown Major";

	// Get progress color based on compatibility percentage
	const getProgressColor = (percentage: number) => {
		if (percentage >= 0.7) return "#52c41a"; // green
		if (percentage >= 0.5) return "#faad14"; // orange
		return "#ff4d4f"; // red
	};

	// Convert studentResponsibilities to ResponsibilityData format
	const responsibilityData: ResponsibilityData[] =
		student.studentResponsibilities.map((resp) => ({
			responsibilityId: resp.responsibilityId,
			responsibilityName: resp.responsibilityName,
			level: Number(resp.level),
		}));

	// Convert compatibility to percentage (0-1 to 0-100)
	const compatibilityPercentage = Math.round(student.compatibility * 100);

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
					disabled={isSelected}
					onClick={handleAdd}
				>
					{isSelected ? "Added" : "Add"}
				</Button>
			}
		>
			<Row gutter={[12, 8]} align="middle">
				{/* Student Info */}
				<Col flex="auto">
					<Flex
						align="flex-start"
						gap={8}
						className="mb-2"
						style={{ minHeight: "85px", maxHeight: "100px" }}
					>
						<div
							style={{ minHeight: "80px", maxHeight: "95px", width: "100%" }}
						>
							<Title
								level={5}
								className="mb-0 text-sm"
								style={{
									lineHeight: "18px",
									minHeight: "18px",
									maxHeight: "36px", // Allow for 2 lines
									overflow: "hidden",
									textOverflow: "ellipsis",
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									marginBottom: "4px",
								}}
							>
								{student.fullName}
							</Title>
							<Text
								type="secondary"
								className="text-xs"
								style={{
									lineHeight: "16px",
									minHeight: "40px", // Ensure minimum space for student info
									display: "block",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
							>
								{student.studentCode} • {student.email}
								<br />
								{majorName}
							</Text>
						</div>
					</Flex>

					{/* Compatibility Percentage */}
					<div className="mb-2" style={{ marginTop: "12px" }}>
						<Flex align="center" gap={6}>
							<Text strong className="text-xs">
								Compatibility:
							</Text>
							<Progress
								percent={compatibilityPercentage}
								size="small"
								strokeColor={getProgressColor(student.compatibility)}
								style={{ flex: 1, maxWidth: 100 }}
							/>
						</Flex>
					</div>

					{/* Responsibilities Radar Chart */}
					<div>
						<Text className="text-xs text-gray-500 mb-1 block">
							Responsibility Levels:
						</Text>
						{responsibilityData.length > 0 ? (
							<div style={{ marginTop: 8 }}>
								<ResponsibilityRadarChart
									data={responsibilityData}
									height={180}
									loading={false}
								/>
							</div>
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
