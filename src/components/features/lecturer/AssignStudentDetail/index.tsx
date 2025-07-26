'use client';

import { Button, Card, Col, Row, Space, Spin, Tooltip } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import { Header } from '@/components/common/Header';
import AssignConfirmModal from '@/components/features/lecturer/AssignStudentDetail/AssignConfirmModal';
import AssignThesisModal from '@/components/features/lecturer/AssignStudentDetail/AssignThesisModal';
import AvailableThesesTable from '@/components/features/lecturer/AssignStudentDetail/AvailableThesesTable';
import GroupInfoCard from '@/components/features/lecturer/AssignStudentDetail/GroupInfoCard';
import TeamMembers from '@/components/features/lecturer/AssignStudentDetail/TeamMembers';
import ThesisCard from '@/components/features/lecturer/AssignStudentDetail/ThesisCard';
import ThesisDetailModal from '@/components/features/lecturer/AssignStudentDetail/ThesisDetailModal';
import ThesisFilterBar from '@/components/features/lecturer/AssignStudentDetail/ThesisFilterBar';
import StudentFilterBar from '@/components/features/lecturer/GroupManagement/StudentFilterBar';
import StudentTable from '@/components/features/lecturer/GroupManagement/StudentTable';
import { useCurrentSemester } from '@/hooks/semester/useCurrentSemester';
import groupService from '@/lib/services/groups.service';
import thesesService from '@/lib/services/theses.service';
import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { GroupDashboard } from '@/schemas/group';
import { Thesis } from '@/schemas/thesis';
import { useMajorStore } from '@/store/useMajorStore';
import { useSemesterStore } from '@/store/useSemesterStore';
import { useStudentStore } from '@/store/useStudentStore';

export default function AssignStudentsDetailPage() {
	const params = useParams();
	const router = useRouter();
	const groupId = params.groupId as string;

	const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
	const [filters, setFilters] = useState({
		keyword: '',
		major: 'All',
	});
	const [thesisFilters, setThesisFilters] = useState({
		keyword: '',
		semester: 'All',
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [group, setGroup] = useState<GroupDashboard | null>(null);
	const [loading, setLoading] = useState(true);
	const [assignLoading, setAssignLoading] = useState(false);

	// Thesis-related states
	const [availableTheses, setAvailableTheses] = useState<Thesis[]>([]);
	const [selectedThesisKeys, setSelectedThesisKeys] = useState<React.Key[]>([]);
	const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
	const [thesesLoading, setThesesLoading] = useState(false);
	const [isThesisDetailModalOpen, setIsThesisDetailModalOpen] = useState(false);
	const [isAssignThesisModalOpen, setIsAssignThesisModalOpen] = useState(false);
	const [viewingThesis, setViewingThesis] = useState<Thesis | null>(null);
	const [assignThesisLoading, setAssignThesisLoading] = useState(false);
	const [unassignThesisLoading, setUnassignThesisLoading] = useState(false);

	const {
		students,
		fetchStudentsWithoutGroup,
		loading: studentsLoading,
	} = useStudentStore();
	const { majors, fetchMajors } = useMajorStore();
	const { semesters, fetchSemesters } = useSemesterStore();
	const { currentSemester } = useCurrentSemester();

	// Major options for filter
	const majorOptions = ['All', ...majors.map((major) => major.id)];
	const majorNamesMap: Record<string, string> = {
		All: 'All',
		...majors.reduce((acc, major) => ({ ...acc, [major.id]: major.name }), {}),
	};

	// Semester options for thesis filter
	const semesterOptions = ['All', ...semesters.map((semester) => semester.id)];
	const semesterNamesMap: Record<string, string> = {
		All: 'All',
		...semesters.reduce(
			(acc, semester) => ({ ...acc, [semester.id]: semester.name }),
			{},
		),
	};

	// Fetch available theses (approved and not assigned to any group)
	const fetchAvailableTheses = async () => {
		try {
			setThesesLoading(true);
			const response = await thesesService.findAllWithSemester();
			const result = handleApiResponse(response);

			if (result.success && result.data) {
				// Filter for approved theses without group assignment
				const availableTheses = result.data.filter(
					(thesis) => thesis.status === 'Approved' && !thesis.groupId,
				);
				setAvailableTheses(availableTheses);
			}
		} catch (error) {
			console.error('Error fetching available theses:', error);
		} finally {
			setThesesLoading(false);
		}
	};

	// Fetch group data
	useEffect(() => {
		const fetchGroupData = async () => {
			try {
				setLoading(true);
				const response = await groupService.findOne(groupId);
				const result = handleApiResponse(response, 'Success');

				if (result.success && result.data) {
					setGroup(result.data);
					// Fetch ungrouped students for the same semester as the group
					if (result.data.semester?.id) {
						fetchStudentsWithoutGroup(result.data.semester.id);
					}
				} else {
					console.error('Failed to fetch group:', result.error);
				}
			} catch (error) {
				console.error('Error fetching group:', error);
			} finally {
				setLoading(false);
			}
		};

		if (groupId) {
			fetchGroupData();
			fetchMajors();
			fetchSemesters();
			fetchAvailableTheses();
			// Fetch ungrouped students - you might need to pass semester ID
			// fetchStudentsWithoutGroup(semesterId);
		}
	}, [groupId, fetchMajors, fetchSemesters, fetchStudentsWithoutGroup]);

	// Set default semester filter when current semester is available
	useEffect(() => {
		if (currentSemester && thesisFilters.semester === 'All') {
			setThesisFilters((prev) => ({ ...prev, semester: currentSemester.id }));
		}
	}, [currentSemester, thesisFilters.semester]);

	if (loading) {
		return (
			<div style={{ textAlign: 'center', padding: '50px' }}>
				<Spin size="large" tip="Loading group details..." />
			</div>
		);
	}

	if (!group) {
		return <div>Group not found</div>;
	}

	const filteredStudents = students.filter((student) => {
		const keywordMatch =
			student.fullName.toLowerCase().includes(filters.keyword.toLowerCase()) ||
			student.email.toLowerCase().includes(filters.keyword.toLowerCase());
		const majorMatch =
			filters.major === 'All' || student.majorId === filters.major;
		return keywordMatch && majorMatch;
	});

	const selectedStudents = students.filter((s) =>
		selectedStudentIds.includes(s.id),
	);

	// Filter theses based on search and semester
	const filteredTheses = availableTheses.filter((thesis) => {
		const keywordMatch =
			thesis.englishName
				.toLowerCase()
				.includes(thesisFilters.keyword.toLowerCase()) ||
			thesis.abbreviation
				.toLowerCase()
				.includes(thesisFilters.keyword.toLowerCase());
		const semesterMatch =
			thesisFilters.semester === 'All' ||
			thesis.semesterId === thesisFilters.semester;
		return keywordMatch && semesterMatch;
	});

	// Check if group is full (6 members)
	const isGroupFull = group?.members?.length >= 6;
	const isAssignDisabled = selectedStudentIds.length === 0 || isGroupFull;

	// Check if group already has thesis
	const groupHasThesis = Boolean(group?.thesis);
	const isAssignThesisDisabled = !selectedThesis || groupHasThesis;

	const getAssignButtonTooltip = () => {
		if (isGroupFull) {
			return 'Group has reached maximum capacity (6 members)';
		}
		if (selectedStudentIds.length === 0) {
			return 'Please select a student to assign';
		}
		return '';
	};

	const getAssignThesisButtonTooltip = () => {
		if (groupHasThesis) {
			return 'Group already has a thesis assigned';
		}
		if (!selectedThesis) {
			return 'Please select a thesis to assign';
		}
		return '';
	};

	const handleConfirmAssign = async () => {
		try {
			setAssignLoading(true);

			// Check if group is full
			if (group?.members?.length >= 6) {
				showNotification.error(
					'Group Full',
					'This group has reached maximum capacity (6 members)',
				);
				return;
			}

			// Since we changed to single selection, selectedStudentIds should have only one student
			const studentId = selectedStudentIds[0];
			if (!studentId) {
				showNotification.error(
					'Selection Required',
					'Please select a student to assign',
				);
				return;
			}

			const response = await groupService.assignStudent(groupId, studentId);
			const result = handleApiResponse(response);

			if (result.success) {
				showNotification.success(
					'Student Assigned',
					'Student assigned to group successfully!',
				);
				setIsModalOpen(false);
				setSelectedStudentIds([]); // Clear selection

				// Refetch group data to update member count and team members
				try {
					const groupResponse = await groupService.findOne(groupId);
					const groupResult = handleApiResponse(groupResponse);
					if (groupResult.success && groupResult.data) {
						setGroup(groupResult.data);
					}
				} catch (error) {
					console.error('Error refreshing group data:', error);
				}

				// Refetch ungrouped students to remove the assigned student from the list
				if (group?.semester?.id) {
					fetchStudentsWithoutGroup(group.semester.id, true);
				}
			} else {
				// Show error message from backend
				showNotification.error(
					'Assignment Failed',
					result.error?.message || 'Failed to assign student to group',
				);
			}
		} catch (error) {
			console.error('Error assigning student:', error);
			// Use handleApiError to extract proper error message
			const { message } = handleApiError(
				error,
				'Failed to assign student to group',
			);
			showNotification.error('Assignment Failed', message);
		} finally {
			setAssignLoading(false);
		}
	};

	// Handle thesis selection
	const handleThesisSelection = (
		selectedRowKeys: React.Key[],
		selectedRows: Thesis[],
	) => {
		setSelectedThesisKeys(selectedRowKeys);
		setSelectedThesis(selectedRows[0] || null);
	};

	// Handle view thesis detail
	const handleViewThesisDetail = (thesis: Thesis) => {
		setViewingThesis(thesis);
		setIsThesisDetailModalOpen(true);
	};

	// Handle assign thesis confirmation
	const handleConfirmAssignThesis = async () => {
		if (!selectedThesis) {
			showNotification.error(
				'Selection Required',
				'Please select a thesis to assign',
			);
			return;
		}

		try {
			setAssignThesisLoading(true);
			const response = await thesesService.assignToGroup(
				selectedThesis.id,
				groupId,
			);
			const result = handleApiResponse(response);

			if (result.success) {
				showNotification.success(
					'Thesis Assigned',
					'Thesis assigned to group successfully!',
				);
				setIsAssignThesisModalOpen(false);
				setSelectedThesisKeys([]);
				setSelectedThesis(null);

				// Refresh group data and available theses
				const groupResponse = await groupService.findOne(groupId);
				const groupResult = handleApiResponse(groupResponse);
				if (groupResult.success && groupResult.data) {
					setGroup(groupResult.data);
				}

				fetchAvailableTheses();
			} else {
				// Show error message from backend
				showNotification.error(
					'Assignment Failed',
					result.error?.message || 'Failed to assign thesis to group',
				);
			}
		} catch (error) {
			console.error('Error assigning thesis:', error);
			// Use handleApiError to extract proper error message
			const { message } = handleApiError(
				error,
				'Failed to assign thesis to group',
			);
			showNotification.error('Assignment Failed', message);
		} finally {
			setAssignThesisLoading(false);
		}
	};

	// Handle unassign thesis
	const handleUnassignThesis = () => {
		if (!group?.thesis) return;

		ConfirmationModal.show({
			title: 'Unassign Thesis',
			message: 'Are you sure you want to unassign this thesis from the group?',
			details: `${group.thesis.englishName} (${group.thesis.abbreviation})`,
			note: 'This action will remove the thesis assignment from the group. The thesis will become available for other groups.',
			noteType: 'warning',
			okText: 'Yes, Unassign',
			okType: 'danger',
			onOk: async () => {
				try {
					setUnassignThesisLoading(true);
					const response = await groupService.unpickThesis(groupId);
					const result = handleApiResponse(response);

					if (result.success) {
						showNotification.success(
							'Thesis Unassigned',
							'Thesis has been unassigned from the group successfully!',
						);

						// Close thesis detail modal if open
						setIsThesisDetailModalOpen(false);
						setViewingThesis(null);

						// Refresh group data and available theses
						const groupResponse = await groupService.findOne(groupId);
						const groupResult = handleApiResponse(groupResponse);
						if (groupResult.success && groupResult.data) {
							setGroup(groupResult.data);
						}

						fetchAvailableTheses();
					} else {
						// Show error message from backend
						showNotification.error(
							'Unassignment Failed',
							result.error?.message || 'Failed to unassign thesis from group',
						);
					}
				} catch (error) {
					console.error('Error unassigning thesis:', error);
					// Use handleApiError to extract proper error message
					const { message } = handleApiError(
						error,
						'Failed to unassign thesis from group',
					);
					showNotification.error('Unassignment Failed', message);
				} finally {
					setUnassignThesisLoading(false);
				}
			},
			loading: unassignThesisLoading,
		});
	};

	return (
		<Space direction="vertical" size={24} style={{ width: '100%' }}>
			<Header
				title="Assign Student & Thesis"
				description="Facilitate the grouping process by assigning ungrouped students to
					available project groups."
				badgeText="Moderator Only"
			/>

			{/* Two-column layout for group info and team members */}
			<Row gutter={[16, 16]}>
				<Col xs={24} lg={15}>
					<Space direction="vertical" size={16} style={{ width: '100%' }}>
						<GroupInfoCard group={group} />
						<ThesisCard
							group={group}
							onViewDetail={async () => {
								if (group.thesis?.id) {
									// Fetch full thesis details using the thesis ID
									try {
										const response = await thesesService.findOne(
											group.thesis.id,
										);
										const result = handleApiResponse(response);
										if (result.success && result.data) {
											setViewingThesis(result.data);
											setIsThesisDetailModalOpen(true);
										}
									} catch (error) {
										console.error('Error fetching thesis details:', error);
										showNotification.error(
											'Error',
											'Failed to load thesis details',
										);
									}
								}
							}}
							onUnassignThesis={handleUnassignThesis}
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
							padding: '8px 12px',
							backgroundColor: '#f6ffed',
							border: '1px solid #b7eb8f',
							borderRadius: '6px',
							color: '#389e0d',
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
								fetchStudentsWithoutGroup(group.semester.id, true); // Force refresh
							}
						}}
						loading={studentsLoading} // Use students loading state
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

			{/* Assign Thesis Card */}
			<Card title="Assign Thesis to Group">
				{groupHasThesis && (
					<div
						style={{
							marginBottom: 16,
							padding: '8px 12px',
							backgroundColor: '#f6ffed',
							border: '1px solid #b7eb8f',
							borderRadius: '6px',
							color: '#389e0d',
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
					onSelectionChange={handleThesisSelection}
					onViewDetail={handleViewThesisDetail}
					semesterNamesMap={semesterNamesMap}
					disableSelection={groupHasThesis}
				/>
				<Row gutter={[16, 16]} className="mt-4">
					<Col span={24}>
						<Row justify="space-between">
							<Button
								type="default"
								onClick={() => router.push('/lecturer/group-management')}
							>
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
				onUnassignThesis={handleUnassignThesis}
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
