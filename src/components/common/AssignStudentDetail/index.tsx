"use client";

import { Button, Card, Col, Row, Space, Spin, Tooltip } from "antd";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { Header } from "@/components/common/Header";
import AssignConfirmModal from "@/components/features/lecturer/AssignStudentDetail/AssignConfirmModal";
import AssignThesisModal from "@/components/features/lecturer/AssignStudentDetail/AssignThesisModal";
import AvailableThesesTable from "@/components/features/lecturer/AssignStudentDetail/AvailableThesesTable";
import GroupInfoCard from "@/components/features/lecturer/AssignStudentDetail/GroupInfoCard";
import TeamMembers from "@/components/features/lecturer/AssignStudentDetail/TeamMembers";
import ThesisCard from "@/components/features/lecturer/AssignStudentDetail/ThesisCard";
import ThesisDetailModal from "@/components/features/lecturer/AssignStudentDetail/ThesisDetailModal";
import ThesisFilterBar from "@/components/features/lecturer/AssignStudentDetail/ThesisFilterBar";
import StudentFilterBar from "@/components/features/lecturer/GroupManagement/StudentFilterBar";
import StudentTable from "@/components/features/lecturer/GroupManagement/StudentTable";
import { useAssignStudentDetail } from "@/hooks/group/useAssignStudentDetail";
import { useThesisOperations } from "@/hooks/group/useThesisOperations";
import { Thesis } from "@/schemas/thesis";

interface AssignStudentDetailProps {
	readonly groupId: string;
	readonly backRoute: string;
	readonly headerBadgeText?: string;
	readonly isAdminMode?: boolean;
}

export default function AssignStudentDetail({
	groupId,
	backRoute,
	headerBadgeText,
	isAdminMode = false,
}: AssignStudentDetailProps) {
	const router = useRouter();

	// Use the extracted hook for state and logic
	const {
		group,
		loading,
		selectedStudentIds,
		setSelectedStudentIds,
		filters,
		setFilters,
		thesisFilters,
		setThesisFilters,
		isModalOpen,
		setIsModalOpen,
		assignLoading,
		handleConfirmAssign,
		availableTheses,
		selectedThesisKeys,
		setSelectedThesisKeys,
		selectedThesis,
		setSelectedThesis,
		thesesLoading,
		isThesisDetailModalOpen,
		setIsThesisDetailModalOpen,
		isAssignThesisModalOpen,
		setIsAssignThesisModalOpen,
		viewingThesis,
		setViewingThesis,
		showUnassignButton,
		setShowUnassignButton,
		assignThesisLoading,
		unassignThesisLoading,
		setUnassignThesisLoading,
		handleConfirmAssignThesis,
		students,
		majors,
		semesters,
		studentsLoading,
		refreshGroupAndTheses,
		handleThesisOperationError,
		fetchAvailableTheses,
		fetchStudentsWithoutGroup,
	} = useAssignStudentDetail(groupId);

	// Use thesis operations hook
	const {
		handleViewThesisDetail,
		handleViewGroupThesisDetail,
		handleUnassignThesis,
	} = useThesisOperations({
		group,
		groupId,
		refreshGroupAndTheses,
		handleThesisOperationError,
		setIsThesisDetailModalOpen,
		setViewingThesis,
		setUnassignThesisLoading,
		unassignThesisLoading,
	});

	// Computed values
	const majorOptions = useMemo(
		() => ["All", ...majors.map((major) => major.id)],
		[majors],
	);
	const majorNamesMap = useMemo(
		() => ({
			All: "All",
			...majors.reduce(
				(acc, major) => ({ ...acc, [major.id]: major.name }),
				{},
			),
		}),
		[majors],
	);

	const semesterOptions = useMemo(
		() => ["All", ...semesters.map((semester) => semester.id)],
		[semesters],
	);
	const semesterNamesMap = useMemo(
		() => ({
			All: "All",
			...semesters.reduce(
				(acc, semester) => ({ ...acc, [semester.id]: semester.name }),
				{},
			),
		}),
		[semesters],
	);

	const filteredStudents = useMemo(
		() =>
			students.filter((student) => {
				const keywordMatch =
					student.fullName
						.toLowerCase()
						.includes(filters.keyword.toLowerCase()) ||
					student.email.toLowerCase().includes(filters.keyword.toLowerCase());
				const majorMatch =
					filters.major === "All" || student.majorId === filters.major;
				return keywordMatch && majorMatch;
			}),
		[students, filters],
	);

	const selectedStudents = useMemo(
		() => students.filter((s) => selectedStudentIds.includes(s.id)),
		[students, selectedStudentIds],
	);

	const filteredTheses = useMemo(
		() =>
			availableTheses.filter((thesis) => {
				const keywordMatch =
					thesis.englishName
						.toLowerCase()
						.includes(thesisFilters.keyword.toLowerCase()) ||
					thesis.abbreviation
						.toLowerCase()
						.includes(thesisFilters.keyword.toLowerCase());
				const semesterMatch =
					thesisFilters.semester === "All" ||
					thesis.semesterId === thesisFilters.semester;
				return keywordMatch && semesterMatch;
			}),
		[availableTheses, thesisFilters],
	);

	// Computed flags
	const isGroupFull = Boolean(group?.members && group.members.length >= 6);
	const isAssignDisabled = selectedStudentIds.length === 0 || isGroupFull;
	const groupHasThesis = Boolean(group?.thesis);
	const isAssignThesisDisabled = !selectedThesis || groupHasThesis;

	const getAssignButtonTooltip = () => {
		if (isGroupFull) {
			return "Group has reached maximum capacity (6 members)";
		}
		if (selectedStudentIds.length === 0) {
			return "Please select a student to assign";
		}
		return "";
	};

	const getAssignThesisButtonTooltip = () => {
		if (groupHasThesis) {
			return "Group already has a thesis assigned";
		}
		if (!selectedThesis) {
			return "Please select a thesis to assign";
		}
		return "";
	};

	// Thesis selection and view handlers
	const handleThesisSelectionChange = (
		selectedRowKeys: React.Key[],
		selectedRows: Thesis[],
	) => {
		setSelectedThesisKeys(selectedRowKeys);
		setSelectedThesis(selectedRows[0] || null);
	};

	const handleViewGroupThesisWithButton = async () => {
		if (group?.thesis?.id) {
			const result = await handleViewGroupThesisDetail();
			if (result) {
				setShowUnassignButton(result.showUnassignButton);
			}
		}
	};

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "50px" }}>
				<Spin size="large" tip="Loading group details..." />
			</div>
		);
	}

	if (!group) {
		return <div>Group not found</div>;
	}

	return (
		<Space direction="vertical" size={24} style={{ width: "100%" }}>
			<Header
				title={
					isAdminMode ? "Assign Student to Group" : "Assign Student & Thesis"
				}
				description={
					isAdminMode
						? "Facilitate the grouping process by assigning ungrouped students to available project groups."
						: "Facilitate the grouping process by assigning ungrouped students to available project groups and assign thesis topics."
				}
				badgeText={headerBadgeText}
			/>

			{/* Two-column layout for group info and team members */}
			<Row gutter={[16, 16]}>
				<Col xs={24} lg={15}>
					<Space direction="vertical" size={16} style={{ width: "100%" }}>
						<GroupInfoCard group={group} />
						<ThesisCard
							group={group}
							onViewDetail={handleViewGroupThesisWithButton}
							onUnassignThesis={isAdminMode ? undefined : handleUnassignThesis}
							showUnassignButton={!isAdminMode}
						/>
					</Space>
				</Col>
				<Col xs={24} lg={9}>
					<Card>
						<TeamMembers group={group} />
					</Card>
				</Col>
			</Row>

			<Card title="Assign Student to Group">
				{isGroupFull && (
					<div
						style={{
							marginBottom: 16,
							padding: "8px 12px",
							backgroundColor: "#f6ffed",
							border: "1px solid #b7eb8f",
							borderRadius: "6px",
							color: "#389e0d",
						}}
					>
						✓ This group has reached maximum capacity (6 members). Student
						assignment is disabled.
					</div>
				)}
				<div style={{ marginBottom: 16 }}>
					<StudentFilterBar
						search={filters.keyword}
						onSearchChange={(val) =>
							setFilters((prev) => ({ ...prev, keyword: val }))
						}
						major={filters.major}
						onMajorChange={(val) =>
							setFilters((prev) => ({ ...prev, major: val }))
						}
						majorOptions={majorOptions}
						majorNamesMap={majorNamesMap}
						onRefresh={() => {
							if (group?.semester?.id) {
								fetchStudentsWithoutGroup(group.semester.id, true);
							}
						}}
						loading={studentsLoading}
					/>
				</div>
				<StudentTable
					data={filteredStudents}
					majorNamesMap={majorNamesMap}
					selectedRowKeys={selectedStudentIds}
					onSelectionChange={setSelectedStudentIds}
					loading={studentsLoading}
					disableSelection={isGroupFull}
				/>
				<Row gutter={[16, 16]} className="mt-4">
					<Col span={24}>
						<Row justify="end">
							<Tooltip title={getAssignButtonTooltip()}>
								<Button
									type="primary"
									disabled={isAssignDisabled}
									onClick={() => setIsModalOpen(true)}
								>
									Assign To Group
								</Button>
							</Tooltip>
						</Row>
					</Col>
				</Row>
			</Card>

			{/* Back button for admin mode when thesis assignment is hidden */}
			{isAdminMode && (
				<Row gutter={[16, 16]} className="mt-4">
					<Col span={24}>
						<Row justify="start">
							<Button type="default" onClick={() => router.push(backRoute)}>
								Back
							</Button>
						</Row>
					</Col>
				</Row>
			)}

			{/* Assign Thesis Card - Hidden for admin mode */}
			{!isAdminMode && (
				<Card title="Assign Thesis to Group">
					{groupHasThesis && (
						<div
							style={{
								marginBottom: 16,
								padding: "8px 12px",
								backgroundColor: "#f6ffed",
								border: "1px solid #b7eb8f",
								borderRadius: "6px",
								color: "#389e0d",
							}}
						>
							✓ This group already has a thesis assigned. Thesis assignment is
							disabled.
						</div>
					)}
					<div style={{ marginBottom: 16 }}>
						<ThesisFilterBar
							search={thesisFilters.keyword}
							onSearchChange={(val) =>
								setThesisFilters((prev) => ({ ...prev, keyword: val }))
							}
							semester={thesisFilters.semester}
							onSemesterChange={(val) =>
								setThesisFilters((prev) => ({ ...prev, semester: val }))
							}
							semesterOptions={semesterOptions}
							semesterNamesMap={semesterNamesMap}
							onRefresh={fetchAvailableTheses}
							loading={thesesLoading}
						/>
					</div>
					<AvailableThesesTable
						data={filteredTheses}
						loading={thesesLoading}
						selectedRowKeys={selectedThesisKeys}
						onSelectionChange={handleThesisSelectionChange}
						onViewDetail={handleViewThesisDetail}
						semesterNamesMap={semesterNamesMap}
						disableSelection={groupHasThesis}
					/>
					<Row gutter={[16, 16]} className="mt-4">
						<Col span={24}>
							<Row justify="space-between">
								<Button type="default" onClick={() => router.push(backRoute)}>
									Back
								</Button>
								<Tooltip title={getAssignThesisButtonTooltip()}>
									<Button
										type="primary"
										disabled={isAssignThesisDisabled}
										onClick={() => setIsAssignThesisModalOpen(true)}
									>
										Assign Thesis to Group
									</Button>
								</Tooltip>
							</Row>
						</Col>
					</Row>
				</Card>
			)}

			{/* Student Assignment Modal */}
			<AssignConfirmModal
				open={isModalOpen}
				onCancel={() => !assignLoading && setIsModalOpen(false)}
				onConfirm={handleConfirmAssign}
				students={selectedStudents}
				groupName={group.name}
				loading={assignLoading}
			/>

			{/* Thesis Detail Modal */}
			<ThesisDetailModal
				open={isThesisDetailModalOpen}
				onCancel={() => setIsThesisDetailModalOpen(false)}
				thesis={viewingThesis}
				onUnassignThesis={isAdminMode ? undefined : handleUnassignThesis}
				showUnassignButton={!isAdminMode && showUnassignButton}
			/>

			{/* Assign Thesis Modal */}
			<AssignThesisModal
				open={isAssignThesisModalOpen}
				onCancel={() => setIsAssignThesisModalOpen(false)}
				onConfirm={handleConfirmAssignThesis}
				thesis={selectedThesis}
				groupName={group.name}
				loading={assignThesisLoading}
			/>
		</Space>
	);
}
