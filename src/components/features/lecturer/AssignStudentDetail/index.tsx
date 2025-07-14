'use client';

import { Button, Card, Col, Row, Space, Spin, message } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Header } from '@/components/common/Header';
import StudentFilterBar from '@/components/features/lecturer/AssignStudent/StudentFilterBar';
import StudentTable from '@/components/features/lecturer/AssignStudent/StudentTable';
import AssignConfirmModal from '@/components/features/lecturer/AssignStudentDetail/AssignConfirmModal';
import GroupInfoCard from '@/components/features/lecturer/AssignStudentDetail/GroupInfoCard';
import TeamMembers from '@/components/features/lecturer/AssignStudentDetail/TeamMembers';
import groupService from '@/lib/services/groups.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { GroupDashboard } from '@/schemas/group';
import { useMajorStore } from '@/store/useMajorStore';
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
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [group, setGroup] = useState<GroupDashboard | null>(null);
	const [loading, setLoading] = useState(true);
	const [assignLoading, setAssignLoading] = useState(false);

	const {
		students,
		fetchStudentsWithoutGroup,
		loading: studentsLoading,
	} = useStudentStore();
	const { majors, fetchMajors } = useMajorStore();

	// Major options for filter
	const majorOptions = ['All', ...majors.map((major) => major.id)];
	const majorNamesMap: Record<string, string> = {
		All: 'All',
		...majors.reduce((acc, major) => ({ ...acc, [major.id]: major.name }), {}),
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
			// Fetch ungrouped students - you might need to pass semester ID
			// fetchStudentsWithoutGroup(semesterId);
		}
	}, [groupId, fetchMajors, fetchStudentsWithoutGroup]);

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

	const handleConfirmAssign = async () => {
		try {
			setAssignLoading(true);
			// Since we changed to single selection, selectedStudentIds should have only one student
			const studentId = selectedStudentIds[0];
			if (!studentId) {
				message.error('Please select a student to assign');
				return;
			}

			const response = await groupService.assignStudent(groupId, studentId);
			const result = handleApiResponse(
				response,
				'Student assigned successfully!',
			);

			if (result.success) {
				message.success('Student assigned to group successfully!');
				setIsModalOpen(false);
				setSelectedStudentIds([]); // Clear selection

				// Refetch group data to update member count and team members
				try {
					const groupResponse = await groupService.findOne(groupId);
					const groupResult = handleApiResponse(groupResponse, 'Success');
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
				message.error(
					result.error?.message || 'Failed to assign student to group',
				);
			}
		} catch (error) {
			console.error('Error assigning student:', error);
			message.error('An error occurred while assigning the student');
		} finally {
			setAssignLoading(false);
		}
	};

	return (
		<Space direction="vertical" size={24} style={{ width: '100%' }}>
			<Header
				title="Assign Students Detail"
				description="Facilitate the grouping process by assigning ungrouped students to
					available project groups."
				badgeText="Moderator Only"
			/>

			<GroupInfoCard group={group} />

			<Card>
				<TeamMembers group={group} />
			</Card>

			<Card title="Assign Student to Group">
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
				/>
				<Row gutter={[16, 16]} className="mt-4">
					<Col span={24}>
						<Row justify="space-between">
							<Button
								type="default"
								onClick={() => router.push('/lecturer/assign-student')}
							>
								Back
							</Button>
							<Button
								type="primary"
								disabled={selectedStudentIds.length === 0}
								onClick={() => setIsModalOpen(true)}
							>
								Assign To Group
							</Button>
						</Row>
					</Col>
				</Row>
			</Card>

			<AssignConfirmModal
				open={isModalOpen}
				onCancel={() => !assignLoading && setIsModalOpen(false)}
				onConfirm={handleConfirmAssign}
				students={selectedStudents}
				groupName={group.name}
				loading={assignLoading}
			/>
		</Space>
	);
}
