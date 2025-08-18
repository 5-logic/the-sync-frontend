"use client";

import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import {
	Button,
	Col,
	Empty,
	Input,
	Row,
	Select,
	Space,
	Spin,
	Typography,
	Collapse,
} from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConfirmationModal } from "@/components/common/ConfirmModal";
import { Header } from "@/components/common/Header";
import { ListPagination } from "@/components/common/ListPagination";
import AISuggestThesisCard from "@/components/features/student/ViewListThesis/AISuggestThesisCard";
import ThesisCard from "@/components/features/student/ViewListThesis/ThesisCard";
import { useStudentGroupStatus } from "@/hooks/student/useStudentGroupStatus";
import { useThesisApplications } from "@/hooks/student/useThesisApplications";
import { getSortedDomains } from "@/lib/constants/domains";
import aiService, { SuggestedThesis } from "@/lib/services/ai.service";
import lecturersService from "@/lib/services/lecturers.service";
import studentsService from "@/lib/services/students.service";
import thesesService from "@/lib/services/theses.service";
import { handleApiResponse } from "@/lib/utils/handleApi";
import { Thesis, ThesisWithRelations } from "@/schemas/thesis";

const { Option } = Select;

// Convert Thesis to ThesisWithRelations format
const convertToThesisWithRelations = async (
	thesis: Thesis,
): Promise<ThesisWithRelations | null> => {
	try {
		// Fetch lecturer info for this thesis
		const lecturerResponse = await lecturersService.findOne(thesis.lecturerId);
		const lecturerResult = handleApiResponse(lecturerResponse, "Success");

		if (!lecturerResult.success || !lecturerResult.data) {
			return null;
		}

		const lecturer = lecturerResult.data;

		// Convert to ThesisWithRelations format
		return {
			...thesis,
			lecturer: {
				userId: lecturer.id,
				isModerator: lecturer.isModerator,
				user: {
					id: lecturer.id,
					fullName: lecturer.fullName,
					email: lecturer.email,
				},
			},
			thesisVersions:
				((thesis as Record<string, unknown>).thesisVersions as Array<{
					id: string;
					version: number;
					supportingDocument: string;
				}>) || [], // Use actual data from thesis
		};
	} catch (error) {
		console.error("Error converting thesis:", error);
		return null;
	}
};

export default function ViewListThesis() {
	const { data: session } = useSession();
	const { isLeader, hasGroup, group } = useStudentGroupStatus();
	const {
		applications,
		refreshApplications,
		initialized: applicationsInitialized,
	} = useThesisApplications();
	const router = useRouter();
	const [currentPage, setCurrentPage] = useState(1);
	const [searchText, setSearchText] = useState("");
	const [selectedDomain, setSelectedDomain] = useState<string | undefined>(
		undefined,
	);
	const [selectedSupervisor, setSelectedSupervisor] = useState<
		string | undefined
	>(undefined);
	const [theses, setTheses] = useState<ThesisWithRelations[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// AI Suggest states
	const [showAISuggestions, setShowAISuggestions] = useState(false);
	const [aiSuggestions, setAISuggestions] = useState<SuggestedThesis[]>([]);
	const [aiReason, setAIReason] = useState<string>("");
	const [aiLoading, setAILoading] = useState(false);
	const [aiCurrentPage, setAICurrentPage] = useState(1);

	const pageSize = 6;

	// Get student ID from session
	const studentId = session?.user?.id;

	// Fetch theses data
	const fetchThesesData = useCallback(
		async (forceRefresh = false) => {
			if (!studentId) return;

			try {
				if (forceRefresh) {
					setRefreshing(true);
				} else {
					setLoading(true);
				}

				// First, get student profile to get semester info
				const studentResponse = await studentsService.findOne(studentId);
				const studentResult = handleApiResponse(studentResponse, "Success");

				if (!studentResult.success || !studentResult.data) {
					console.error("Failed to fetch student profile");
					return;
				}

				// Get the semester from student's enrollment
				const enrollment = studentResult.data.enrollments?.[0];
				if (!enrollment?.semester?.id) {
					console.error("No enrollment or semester found for student");
					return;
				}

				// Fetch theses for the semester
				const thesesResponse = await thesesService.findBySemester(
					enrollment.semester.id,
				);
				const thesesResult = handleApiResponse(thesesResponse, "Success");

				if (thesesResult.success && thesesResult.data) {
					// Filter only published theses
					const publishedTheses = thesesResult.data.filter(
						(thesis) => thesis.isPublish && thesis.status === "Approved",
					);

					// Convert each thesis to ThesisWithRelations format
					const thesesWithRelations = await Promise.all(
						publishedTheses.map(convertToThesisWithRelations),
					);

					// Filter out any null results and set state
					const validTheses = thesesWithRelations.filter(
						(thesis): thesis is ThesisWithRelations => thesis !== null,
					);
					setTheses(validTheses);
				}
			} catch (error) {
				console.error("Error fetching theses:", error);
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[studentId],
	);

	// Fetch data on component mount
	useEffect(() => {
		if (studentId) {
			fetchThesesData();
		}
	}, [studentId, fetchThesesData]);

	// Handle refresh button
	const handleRefresh = () => {
		fetchThesesData(true);
	};

	// Check if group has required information for AI suggestions
	const isGroupInfoComplete = () => {
		if (!group) return false;
		return !!group.projectDirection;
	};

	// Handle AI Suggest button click
	const handleAISuggest = () => {
		if (!hasGroup || !group) {
			// Should not happen if button is properly disabled, but just in case
			return;
		}

		if (!isGroupInfoComplete()) {
			// Show confirmation modal for incomplete group info
			ConfirmationModal.show({
				title: "Group Information Incomplete",
				message:
					"Your group is missing some important information for better AI recommendations.",
				details: "Project direction is needed for accurate suggestions.",
				note: "You can continue anyway, but the suggestions might be less accurate.",
				noteType: "warning",
				okText: "Continue Anyway",
				cancelText: "Go to Group",
				okType: "primary",
				onOk: () => {
					fetchAISuggestions();
				},
				onCancel: () => {
					router.push("/student/group-dashboard");
				},
			});
		} else {
			// Group info is complete, directly fetch suggestions
			fetchAISuggestions();
		}
	};

	// Fetch AI suggestions
	const fetchAISuggestions = async () => {
		if (!group) return;

		try {
			setAILoading(true);
			const response = await aiService.suggestThesesForGroup(group.id);

			if (response.success && response.data) {
				setAISuggestions(response.data.theses);
				setAIReason(response.data.reason);
				setShowAISuggestions(true);
				setAICurrentPage(1); // Reset to first page
			}
		} catch (error) {
			console.error("Error fetching AI suggestions:", error);
		} finally {
			setAILoading(false);
		}
	};

	// Handle toggle between normal list and AI suggestions
	const handleToggleView = () => {
		setShowAISuggestions(!showAISuggestions);
		if (!showAISuggestions) {
			setCurrentPage(1); // Reset normal page when switching to AI
		} else {
			setAICurrentPage(1); // Reset AI page when switching to normal
		}
	};

	// Get domain options from the constants
	const domainOptions = useMemo(() => getSortedDomains(), []);

	// Get supervisor options from fetched theses
	const supervisorOptions = useMemo(() => {
		const supervisors = theses
			.map((thesis) => thesis.lecturer.user.fullName)
			.filter(Boolean);
		return Array.from(new Set(supervisors));
	}, [theses]);

	// Apply filters and search
	const filteredTheses = useMemo(() => {
		return theses.filter((thesis) => {
			const matchesSearch =
				thesis.englishName.toLowerCase().includes(searchText.toLowerCase()) ||
				thesis.vietnameseName
					.toLowerCase()
					.includes(searchText.toLowerCase()) ||
				thesis.description.toLowerCase().includes(searchText.toLowerCase());

			const matchesDomain = selectedDomain
				? thesis.domain === selectedDomain
				: true;

			const matchesSupervisor = selectedSupervisor
				? thesis.lecturer.user.fullName === selectedSupervisor
				: true;

			return matchesSearch && matchesDomain && matchesSupervisor;
		});
	}, [searchText, selectedDomain, selectedSupervisor, theses]);

	const paginatedTheses = filteredTheses.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	// Paginated AI suggestions
	const paginatedAISuggestions = aiSuggestions.slice(
		(aiCurrentPage - 1) * pageSize,
		aiCurrentPage * pageSize,
	);

	// Render thesis list content based on current view mode
	const renderThesisContent = () => {
		if (showAISuggestions) {
			// AI Suggestions View
			if (aiLoading) {
				return (
					<Col span={24}>
						<div style={{ textAlign: "center", padding: "50px" }}>
							<Spin size="large" tip="Getting AI recommendations..." />
						</div>
					</Col>
				);
			}

			if (paginatedAISuggestions.length > 0) {
				return paginatedAISuggestions.map((suggestion) => (
					<Col xs={24} sm={12} md={8} key={suggestion.id}>
						<AISuggestThesisCard
							suggestion={suggestion}
							studentRole={isLeader ? "leader" : "member"}
							onThesisUpdate={handleRefresh}
						/>
					</Col>
				));
			}

			return (
				<Col span={24}>
					<Empty description="No AI suggestions available. Try updating your group information." />
				</Col>
			);
		}

		// Normal Thesis List View
		if (paginatedTheses.length > 0) {
			return paginatedTheses.map((thesis) => (
				<Col xs={24} sm={12} md={8} key={thesis.id}>
					<ThesisCard
						thesis={thesis}
						studentRole={isLeader ? "leader" : "member"}
						applications={applications}
						applicationsLoading={!applicationsInitialized}
						onThesisUpdate={handleRefresh}
						onApplicationsRefresh={refreshApplications}
					/>
				</Col>
			));
		}

		return (
			<Col span={24}>
				<Empty description="No thesis available." />
			</Col>
		);
	};

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "50px" }}>
				<Spin size="large" tip="Loading theses..." />
			</div>
		);
	}

	return (
		<Space
			direction="vertical"
			size="large"
			style={{ width: "100%", position: "relative" }}
		>
			{/* Refresh Loading Overlay */}
			{refreshing && (
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "rgba(255, 255, 255, 0.8)",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 1000,
					}}
				>
					<Spin size="large" tip="Refreshing theses..." />
				</div>
			)}

			<Row justify="space-between" align="top" gutter={[16, 16]}>
				<Col flex="auto">
					<Header
						title={showAISuggestions ? "AI Suggested Thesis" : "List Thesis"}
						description={
							showAISuggestions
								? "AI-recommended thesis topics based on your group's project direction."
								: "Browse available thesis topics proposed and published by lecturers. You can view details and apply once your group is ready."
						}
					/>
				</Col>
				<Col style={{ marginTop: 20 }}>
					<Space>
						{showAISuggestions && (
							<Button onClick={handleToggleView}>Back to All Thesis</Button>
						)}
						{!showAISuggestions && hasGroup && isLeader && (
							<Button
								type="primary"
								onClick={handleAISuggest}
								loading={aiLoading}
							>
								{aiLoading ? "Getting AI Suggestions..." : "AI Suggest"}
							</Button>
						)}
					</Space>
				</Col>
			</Row>

			{/* Search & Filters - Only show for normal thesis list */}
			{!showAISuggestions && (
				<Row gutter={[16, 16]}>
					<Col flex="auto">
						<Input
							placeholder="Search by name or description"
							allowClear
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							prefix={<SearchOutlined />}
						/>
					</Col>

					<Col style={{ minWidth: 200 }}>
						<Select
							placeholder="Filter by Domain"
							allowClear
							style={{ width: "100%" }}
							value={selectedDomain}
							onChange={(value) => setSelectedDomain(value)}
						>
							{domainOptions.map((domain) => (
								<Option key={domain} value={domain}>
									{domain}
								</Option>
							))}
						</Select>
					</Col>
					<Col style={{ minWidth: 200 }}>
						<Select
							placeholder="Filter by Supervisor"
							allowClear
							style={{ width: "100%" }}
							value={selectedSupervisor}
							onChange={(value) => setSelectedSupervisor(value)}
						>
							{supervisorOptions.map((name) => (
								<Option key={name} value={name}>
									{name}
								</Option>
							))}
						</Select>
					</Col>
					<Col>
						<Button
							icon={<ReloadOutlined />}
							onClick={handleRefresh}
							loading={refreshing}
							title="Refresh theses"
						>
							Refresh
						</Button>
					</Col>
				</Row>
			)}

			{/* AI Reasoning Section - Only show for AI suggestions */}
			{showAISuggestions && aiReason && (
				<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
					<Col span={24}>
						<Collapse
							size="small"
							style={{
								borderColor: "#1890ff",
								backgroundColor: "#f6ffed",
							}}
							items={[
								{
									key: "ai-reasoning",
									label: (
										<Typography.Text strong style={{ color: "#1890ff" }}>
											🤖 AI Analysis & Reasoning
										</Typography.Text>
									),
									children: (
										<Typography.Paragraph
											style={{
												margin: 0,
												lineHeight: "1.6",
											}}
										>
											{aiReason
												.replace(/\n{2,}/g, "\n")
												.split("\n")
												.map((line, index, array) => {
													// Process each line to handle text formatting
													const processedLine = line
														.split(/'([^']*)'/)
														.map((part, partIndex) => {
															// If index is odd, it's text within single quotes - make it bold
															if (partIndex % 2 === 1) {
																return <strong key={partIndex}>{part}</strong>;
															}
															return part;
														});

													return (
														<span key={index}>
															{processedLine}
															{index < array.length - 1 && <br />}
														</span>
													);
												})}
										</Typography.Paragraph>
									),
								},
							]}
						/>
					</Col>
				</Row>
			)}

			{/* Danh sách Thesis */}
			<Row gutter={[16, 16]}>{renderThesisContent()}</Row>

			{/* Phân trang */}
			{showAISuggestions ? (
				// AI Suggestions Pagination
				aiSuggestions.length > 0 && (
					<ListPagination
						current={aiCurrentPage}
						pageSize={pageSize}
						total={aiSuggestions.length}
						onChange={(page) => setAICurrentPage(page)}
						itemName="suggestion"
					/>
				)
			) : (
				// Normal Thesis Pagination
				<ListPagination
					current={currentPage}
					pageSize={pageSize}
					total={filteredTheses.length}
					onChange={(page) => setCurrentPage(page)}
					itemName="thesis"
				/>
			)}
		</Space>
	);
}
