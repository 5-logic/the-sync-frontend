"use client";

import { BookOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, Space, Tag, Tooltip, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import StudentEditThesisModal from "@/components/features/student/GroupDashboard/StudentEditThesisModal";
import { DOMAIN_COLOR_MAP } from "@/lib/constants/domains";
import thesesService from "@/lib/services/theses.service";

// Type for thesis required skills - handles both direct skill objects and skill relations
type ThesisRequiredSkill =
	| { id: string; name: string } // Direct skill object
	| { skill: { id: string; name: string } }; // Skill relation object

const { Title, Text } = Typography;

interface ThesisStatusCardProps {
	readonly thesisId?: string;
	readonly isLeader?: boolean;
	readonly isDashboardView?: boolean;
	readonly hideEditButton?: boolean; // Option to hide edit button for lecturer view
	readonly thesisData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function ThesisStatusCard({
	thesisId,
	thesisData,
	isLeader = false,
	isDashboardView = false,
	hideEditButton = false,
}: ThesisStatusCardProps) {
	const [thesis, setThesis] = useState<any>(thesisData || null); // eslint-disable-line @typescript-eslint/no-explicit-any
	const [loading, setLoading] = useState(!thesisData);
	const [editModalVisible, setEditModalVisible] = useState(false);
	const router = useRouter();

	const handleEditClick = () => {
		setEditModalVisible(true);
	};

	const handleEditModalClose = () => {
		setEditModalVisible(false);
	};

	const handleEditSuccess = () => {
		// Refresh thesis data after successful edit - only if we have thesisId
		if (thesisId) {
			fetchThesis();
		}
	};

	const handleCardClick = () => {
		if (isDashboardView) {
			router.push(`/student/list-thesis/${thesisId}`);
		}
	};

	const fetchThesis = async () => {
		if (!thesisId) return;

		try {
			setLoading(true);
			const response = await thesesService.findOne(thesisId);
			if (response.success) {
				setThesis(response.data);
			}
		} catch (error) {
			console.error("Failed to fetch thesis:", error);
		} finally {
			setLoading(false);
		}
	};

	// Fetch thesis data only if thesisData is not provided and thesisId exists
	useEffect(() => {
		if (!thesisData && thesisId) {
			fetchThesis();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [thesisId, thesisData]);

	// Update thesis state when thesisData prop changes
	useEffect(() => {
		if (thesisData) {
			setThesis(thesisData);
			setLoading(false);
		}
	}, [thesisData]);

	if (loading || !thesis) {
		return (
			<Card
				title={
					<Space>
						<BookOutlined />
						<span>Thesis Status</span>
					</Space>
				}
				loading={loading}
			/>
		);
	}
	// Get domain color
	const domainColor = thesis.domain
		? DOMAIN_COLOR_MAP[thesis.domain] || "default"
		: "default";

	// Only render modal when actually needed to avoid unnecessary renders
	const renderModal = editModalVisible && thesisId && (
		<StudentEditThesisModal
			visible={editModalVisible}
			thesisId={thesisId}
			onClose={handleEditModalClose}
			onSuccess={handleEditSuccess}
		/>
	);

	return (
		<>
			<Card
				title={
					<Space
						onClick={handleCardClick}
						style={{
							cursor: isDashboardView ? "pointer" : "default",
							transition: "color 0.2s ease",
						}}
						onMouseEnter={(e) => {
							if (isDashboardView) {
								e.currentTarget.style.color = "#1890ff";
							}
						}}
						onMouseLeave={(e) => {
							if (isDashboardView) {
								e.currentTarget.style.color = "";
							}
						}}
					>
						<BookOutlined />
						<span>Thesis Status</span>
					</Space>
				}
				extra={
					isLeader &&
					!hideEditButton && (
						<Tooltip title="Edit Thesis">
							<Button
								type="text"
								icon={<EditOutlined />}
								onClick={handleEditClick}
								size="small"
							/>
						</Tooltip>
					)
				}
				hoverable={isDashboardView}
			>
				<Space direction="vertical" size="middle" style={{ width: "100%" }}>
					<Space direction="vertical" size={4}>
						<Text type="secondary">Thesis title</Text>
						<Title level={5} style={{ margin: 0 }}>
							{thesis.englishName}
						</Title>
					</Space>

					<Space direction="vertical" size={4}>
						<Text type="secondary">Description</Text>
						<div
							style={{
								display: "-webkit-box",
								WebkitLineClamp: 3,
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
								textOverflow: "ellipsis",
								lineHeight: "1.5em",
								maxHeight: "4.5em", // 3 lines × 1.5 line-height
								wordBreak: "break-word",
							}}
						>
							{thesis.description}
						</div>
					</Space>

					<Space direction="vertical" size={4}>
						<Text type="secondary">Domain</Text>
						<Space>
							{thesis.domain && <Tag color={domainColor}>{thesis.domain}</Tag>}
						</Space>
					</Space>

					<Space direction="vertical" size={4}>
						<Text type="secondary">Status</Text>
						<Space>
							<Tag color="green">{thesis.status}</Tag>
						</Space>
					</Space>

					<Space direction="vertical" size={4}>
						<Text type="secondary">Required Skills</Text>
						<Space>
							{thesis.thesisRequiredSkills &&
							thesis.thesisRequiredSkills.length > 0 ? (
								<Space size={[4, 8]} wrap>
									{thesis.thesisRequiredSkills.map(
										(skillRelation: ThesisRequiredSkill) => {
											// Handle both direct skill objects and skill relation objects
											const skill =
												"skill" in skillRelation
													? skillRelation.skill
													: skillRelation;
											return (
												<Tag key={skill.id} color="blue">
													{skill.name}
												</Tag>
											);
										},
									)}
								</Space>
							) : (
								<Text type="secondary">No skills required</Text>
							)}
						</Space>
					</Space>
				</Space>
			</Card>

			{/* Edit Thesis Modal - Only render when needed */}
			{renderModal}
		</>
	);
}
