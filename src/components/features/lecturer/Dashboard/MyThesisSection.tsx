import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Col,
	Flex,
	Row,
	Select,
	Spin,
	Tag,
	Typography,
} from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useLecturerSemesterFilter } from "@/hooks/lecturer/useLecturerSemesterFilter";
import { DOMAIN_COLOR_MAP } from "@/lib/constants/domains";
import thesesService from "@/lib/services/theses.service";
import { handleApiResponse } from "@/lib/utils/handleApi";
import { Thesis } from "@/schemas/thesis";

const statusColor = {
	Approved: "green",
	Pending: "orange",
	Rejected: "red",
	Draft: "blue",
};

interface ThesisWithRelations extends Thesis {
	thesisRequiredSkills?: Array<{ id: string; name: string }>;
	semester?: { id: string; name: string; code: string };
}

const MyThesisSection: React.FC = () => {
	const [theses, setTheses] = useState<ThesisWithRelations[]>([]);
	const [loading, setLoading] = useState(true);
	const [isMobile, setIsMobile] = useState(false);
	const router = useRouter();

	// Use custom hook for semester filter logic
	const {
		semesters,
		selectedSemester,
		setSelectedSemester,
		semestersLoading,
		session,
	} = useLecturerSemesterFilter();

	// Handle responsive behavior
	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < 576);
		};

		// Check initial size
		checkIsMobile();

		// Add event listener
		window.addEventListener("resize", checkIsMobile);

		// Cleanup
		return () => window.removeEventListener("resize", checkIsMobile);
	}, []);

	// Fetch lecturer theses
	useEffect(() => {
		const fetchTheses = async () => {
			if (!session?.user?.id) return;

			try {
				setLoading(true);
				const response = await thesesService.findByLecturerId(session.user.id);
				const result = handleApiResponse(response);
				if (result.success) {
					setTheses(result.data || []);
				}
			} catch (error) {
				console.error("Error fetching theses:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchTheses();
	}, [session?.user?.id]);

	// Filter theses by semester
	const filteredTheses =
		selectedSemester === "all"
			? theses
			: theses.filter((thesis) => thesis.semesterId === selectedSemester);

	// Check if all data is ready for display (including semester name mapping)
	const isDataReady = !loading && !semestersLoading && semesters.length > 0;

	const handleCreateThesis = () => {
		router.push("/lecturer/thesis-management/create-thesis");
	};

	const handleViewDetails = (thesisId: string) => {
		router.push(`/lecturer/thesis-management/${thesisId}`);
	};

	const handleEditThesis = (thesisId: string) => {
		router.push(`/lecturer/thesis-management/${thesisId}/edit-thesis`);
	};

	// Helper function to get empty message
	const getEmptyMessage = () => {
		if (selectedSemester === "all") {
			return "No thesis topics found";
		}
		return "No thesis topics found for selected semester";
	};

	// Helper function to get thesis tag color
	const getThesisTagColor = (thesis: ThesisWithRelations) => {
		if (thesis.isPublish) {
			return "green";
		}
		return statusColor[thesis.status as keyof typeof statusColor] || "default";
	};

	// Helper function to render main content
	const renderMainContent = () => {
		if (!isDataReady) {
			return (
				<div style={{ textAlign: "center", padding: "40px 0" }}>
					<Spin size="large" />
				</div>
			);
		}

		if (filteredTheses.length === 0) {
			return (
				<div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
					{getEmptyMessage()}
				</div>
			);
		}

		return (
			<Row gutter={[16, 16]}>
				{filteredTheses.map((thesis) => {
					// Get semester name from semester relation or find in semesters list
					const semesterName =
						thesis.semester?.name ||
						semesters.find((s) => s.id === thesis.semesterId)?.name ||
						"Unknown Semester";

					// Determine status to display
					const displayStatus = thesis.isPublish ? "Published" : thesis.status;

					return (
						<Col xs={24} md={12} lg={8} key={thesis.id}>
							<Card
								hoverable
								title={
									<Row justify="space-between" align="middle">
										<Col>
											<Tag color="cyan">{semesterName}</Tag>
										</Col>
										<Col>
											<Tag color={getThesisTagColor(thesis)}>
												{displayStatus}
											</Tag>
										</Col>
									</Row>
								}
								actions={[
									<button
										key="view"
										style={{
											color: "#000",
											cursor: "pointer",
											transition: "color 0.3s",
											background: "none",
											border: "none",
											padding: 0,
											font: "inherit",
										}}
										onMouseEnter={(e) =>
											((e.currentTarget as HTMLElement).style.color = "#1890ff")
										}
										onMouseLeave={(e) =>
											((e.currentTarget as HTMLElement).style.color = "#000")
										}
										onClick={() => handleViewDetails(thesis.id)}
									>
										<EyeOutlined style={{ marginRight: 4 }} />
										View Details
									</button>,
									<button
										key="edit"
										style={{
											color: "#000",
											cursor: "pointer",
											transition: "color 0.3s",
											background: "none",
											border: "none",
											padding: 0,
											font: "inherit",
										}}
										onMouseEnter={(e) =>
											((e.currentTarget as HTMLElement).style.color = "#1890ff")
										}
										onMouseLeave={(e) =>
											((e.currentTarget as HTMLElement).style.color = "#000")
										}
										onClick={() => handleEditThesis(thesis.id)}
									>
										<EditOutlined style={{ marginRight: 4 }} />
										Edit
									</button>,
								]}
								style={{ height: "100%" }}
							>
								<Flex vertical style={{ height: "100%" }}>
									{/* Domain Tag */}
									{thesis.domain && (
										<div style={{ marginBottom: 8 }}>
											<Tag color={DOMAIN_COLOR_MAP[thesis.domain] || "blue"}>
												{thesis.domain}
											</Tag>
										</div>
									)}

									{/* English Name */}
									<div
										style={{
											fontSize: "16px",
											fontWeight: 600,
											color: "#1f2937",
											marginBottom: 12,
											lineHeight: "1.5",
											height: "48px", // 2 lines * 1.5 * 16px
											overflow: "hidden",
											display: "-webkit-box",
											WebkitLineClamp: 2,
											WebkitBoxOrient: "vertical",
											wordBreak: "break-word",
										}}
									>
										{thesis.englishName}
									</div>

									{/* Description */}
									<div
										style={{
											color: "#6b7280",
											lineHeight: "1.5",
											marginBottom: 12,
											fontSize: "14px",
											height: "84px", // 4 lines * 1.5 * 14px = 84px
											overflow: "hidden",
											display: "-webkit-box",
											WebkitLineClamp: 4,
											WebkitBoxOrient: "vertical",
											wordBreak: "break-word",
											textOverflow: "ellipsis",
										}}
									>
										{thesis.description}
									</div>
								</Flex>
							</Card>
						</Col>
					);
				})}
			</Row>
		);
	};
	return (
		<Card>
			<Row
				justify="space-between"
				align="top"
				style={{ marginBottom: 16 }}
				gutter={[16, 16]}
			>
				<Col xs={24} sm={24} md={12} lg={8} xl={8}>
					<Typography.Title level={5} style={{ margin: 0 }}>
						My Thesis Topics
					</Typography.Title>
				</Col>
				<Col xs={24} sm={24} md={12} lg={16} xl={16}>
					<div
						style={{
							display: "flex",
							gap: 12,
							alignItems: "center",
							flexDirection: isMobile ? "column" : "row",
							justifyContent: isMobile ? "stretch" : "flex-end",
						}}
					>
						{/* Semester Filter */}
						<Select
							value={selectedSemester}
							onChange={setSelectedSemester}
							style={{
								width: isMobile ? "100%" : "auto",
								minWidth: isMobile ? "100%" : 200,
								maxWidth: isMobile ? "100%" : 250,
							}}
							placeholder="Filter by semester"
							allowClear
							loading={semestersLoading}
						>
							<Select.Option value="all">All Semesters</Select.Option>
							{semesters.map((semester) => (
								<Select.Option key={semester.id} value={semester.id}>
									{semester.name}
								</Select.Option>
							))}
						</Select>

						{/* Create Button */}
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={handleCreateThesis}
							style={{
								width: isMobile ? "100%" : "auto",
								minWidth: "fit-content",
							}}
						>
							Create New Thesis
						</Button>
					</div>
				</Col>
			</Row>

			{renderMainContent()}
		</Card>
	);
};

export default MyThesisSection;
