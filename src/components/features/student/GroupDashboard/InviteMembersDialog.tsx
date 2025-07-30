import {
	Alert,
	Button,
	Col,
	Divider,
	Modal,
	Row,
	Spin,
	Typography,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { ListPagination } from '@/components/common/ListPagination';
import InviteTeamMembers from '@/components/features/student/FormOrJoinGroup/CreateGroup/InviteTeamMembers';
import SuggestedStudentCard from '@/components/features/student/GroupDashboard/SuggestedStudentCard';
import aiService, { type SuggestedStudent } from '@/lib/services/ai.service';
import requestService from '@/lib/services/requests.service';
import { showNotification } from '@/lib/utils/notification';
import { GroupDashboard } from '@/schemas/group';
import type { Student } from '@/schemas/student';
import { useRequestsStore, useStudentStore } from '@/store';

const { Text } = Typography;

interface InviteMembersDialogProps {
	readonly visible: boolean;
	readonly onCancel: () => void;
	readonly onSuccess: () => void;
	readonly groupId: string;
	readonly group: GroupDashboard; // Add group data to exclude existing members
}

export default function InviteMembersDialog({
	visible,
	onCancel,
	onSuccess,
	groupId,
	group,
}: InviteMembersDialogProps) {
	const [selectedMembers, setSelectedMembers] = useState<Student[]>([]);
	const [loading, setLoading] = useState(false);
	const [suggestedStudents, setSuggestedStudents] = useState<
		SuggestedStudent[]
	>([]);
	const [suggestLoading, setSuggestLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(3);
	const { fetchGroupRequests, requests } = useRequestsStore();
	const { fetchStudentsWithoutGroupAuto } = useStudentStore();

	// Calculate pagination for suggested students
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedStudents = suggestedStudents.slice(startIndex, endIndex);

	// Handle pagination change
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	// Get existing member IDs to exclude from invites
	const existingMemberIds = group.members.map((member) => member.userId);

	// Helper function to get user IDs by request type and status
	const getUserIdsByRequestType = useMemo(() => {
		return (type: 'Join' | 'Invite') => {
			return requests
				.filter(
					(request) =>
						request.groupId === groupId &&
						request.type === type &&
						request.status === 'Pending',
				)
				.map((request) => request.student.userId);
		};
	}, [requests, groupId]);

	// Get user IDs who have pending join requests for this group
	const pendingJoinRequestUserIds = useMemo(() => {
		return getUserIdsByRequestType('Join');
	}, [getUserIdsByRequestType]);

	// Get user IDs who have pending invite requests from this group
	const pendingInviteRequestUserIds = useMemo(() => {
		return getUserIdsByRequestType('Invite');
	}, [getUserIdsByRequestType]);

	// Combine existing members, pending join requests, and pending invite requests to exclude
	const excludeUserIds = useMemo(() => {
		return [
			...existingMemberIds,
			...pendingJoinRequestUserIds,
			...pendingInviteRequestUserIds,
		];
	}, [
		existingMemberIds,
		pendingJoinRequestUserIds,
		pendingInviteRequestUserIds,
	]);

	// Fetch requests and students when dialog opens to ensure we have latest data
	useEffect(() => {
		if (visible) {
			fetchGroupRequests(groupId, true); // Force refresh to get latest requests
			fetchStudentsWithoutGroupAuto(); // Refresh students list to get latest data
		}
	}, [visible, groupId, fetchGroupRequests, fetchStudentsWithoutGroupAuto]);

	// Handle AI suggest students
	const handleSuggestStudents = async () => {
		setSuggestLoading(true);
		try {
			const response = await aiService.suggestStudentsForGroup(groupId);
			if (response.success) {
				setSuggestedStudents(response.data);
				setShowSuggestions(true);
				showNotification.success(
					'Students Suggested',
					`Found ${response.data.length} suggested students for your group.`,
				);
			} else {
				showNotification.error(
					'Failed to Get Suggestions',
					'Unable to get student suggestions. Please try again.',
				);
			}
		} catch (error) {
			console.error('Error getting student suggestions:', error);
			showNotification.error(
				'Failed to Get Suggestions',
				'Unable to get student suggestions. Please try again.',
			);
		} finally {
			setSuggestLoading(false);
		}
	};

	// Handle adding suggested student to invite list
	const handleAddSuggestedStudent = (suggestedStudent: SuggestedStudent) => {
		// Convert SuggestedStudent to Student format
		const studentToAdd: Student = {
			id: suggestedStudent.id,
			fullName: suggestedStudent.fullName,
			email: suggestedStudent.email,
			password: '', // Not needed for invite
			gender: 'Male', // Default value
			phoneNumber: '', // Default value
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			studentCode: suggestedStudent.studentCode,
			majorId: '', // Default value
		};

		// Check if student is already in selected members
		const isAlreadySelected = selectedMembers.some(
			(member) => member.id === suggestedStudent.id,
		);

		if (isAlreadySelected) {
			showNotification.warning(
				'Student Already Selected',
				'This student is already in your invite list.',
			);
			return;
		}

		// Add to selected members
		setSelectedMembers((prev) => [...prev, studentToAdd]);
		showNotification.success(
			'Student Added',
			`${suggestedStudent.fullName} has been added to your invite list.`,
		);
	};

	// Debug log in development mode
	useEffect(() => {
		if (process.env.NODE_ENV === 'development' && visible) {
			console.log('Exclude user IDs:', {
				existingMembers: existingMemberIds,
				pendingJoinRequests: pendingJoinRequestUserIds,
				pendingInviteRequests: pendingInviteRequestUserIds,
				total: excludeUserIds,
			});
		}
	}, [
		visible,
		existingMemberIds,
		pendingJoinRequestUserIds,
		pendingInviteRequestUserIds,
		excludeUserIds,
	]);

	const handleSendInvites = async () => {
		if (selectedMembers.length === 0) {
			showNotification.warning(
				'No Students Selected',
				'Please select at least one student to invite.',
			);
			return;
		}

		setLoading(true);
		try {
			const studentIds = selectedMembers.map((member) => member.id);
			const response = await requestService.inviteMultipleStudents(
				groupId,
				studentIds,
			);

			if (response.success) {
				showNotification.success(
					'Invitations Sent',
					`Successfully sent ${selectedMembers.length} invitation(s)!`,
				);
				setSelectedMembers([]);

				// Refresh requests to update badge and table
				await fetchGroupRequests(groupId, true);

				onSuccess();
			} else {
				showNotification.error(
					'Failed to Send Invitations',
					'Failed to send invitations. Please try again.',
				);
			}
		} catch (error) {
			console.error('Error sending invitations:', error);
			showNotification.error(
				'Failed to Send Invitations',
				'Failed to send invitations. Please try again.',
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setSelectedMembers([]);
		setSuggestedStudents([]);
		setShowSuggestions(false);
		setCurrentPage(1);
		onCancel();
	};

	return (
		<Modal
			title="Invite Members to Group"
			open={visible}
			onCancel={handleCancel}
			width={800}
			footer={[
				<Button key="cancel" onClick={handleCancel}>
					Cancel
				</Button>,
				<Button
					key="send"
					type="primary"
					loading={loading}
					onClick={handleSendInvites}
					disabled={selectedMembers.length === 0}
				>
					Send Invitation{selectedMembers.length > 1 ? 's' : ''} (
					{selectedMembers.length})
				</Button>,
			]}
		>
			<div className="mb-4">
				<Text type="secondary">
					Select students to invite to your group. They will receive an
					invitation request that they can accept or decline.
				</Text>
				{(pendingJoinRequestUserIds.length > 0 ||
					pendingInviteRequestUserIds.length > 0) && (
					<div className="mt-2">
						<Text type="secondary" className="text-xs">
							Note: Students with pending requests (join or invite) are
							automatically excluded from the list.
						</Text>
					</div>
				)}
			</div>

			{/* AI Suggestion Alert */}
			<Alert
				message="Get AI-powered student suggestions"
				description="Let our AI suggest students who would be a great fit for your group based on skills and responsibilities."
				type="info"
				showIcon
				action={
					<Button
						type="primary"
						loading={suggestLoading}
						onClick={handleSuggestStudents}
					>
						Get Suggestions
					</Button>
				}
				className="mb-4"
			/>

			{/* Suggested Students */}
			{showSuggestions && (
				<div className="mb-4">
					<Divider orientation="left">
						<Text strong>
							AI Suggested Students ({suggestedStudents.length})
						</Text>
					</Divider>
					{suggestLoading ? (
						<div className="text-center py-4">
							<Spin size="large" />
						</div>
					) : suggestedStudents.length > 0 ? (
						<>
							{/* Students Grid */}
							<Row gutter={[16, 16]} className="mb-4">
								{paginatedStudents.map((student) => (
									<Col xs={24} sm={12} lg={8} key={student.id}>
										<SuggestedStudentCard
											student={student}
											onAdd={handleAddSuggestedStudent}
										/>
									</Col>
								))}
							</Row>

							{/* Pagination */}
							{suggestedStudents.length > pageSize && (
								<ListPagination
									total={suggestedStudents.length}
									current={currentPage}
									pageSize={pageSize}
									onChange={handlePageChange}
									itemName="students"
									showSizeChanger={false}
								/>
							)}
						</>
					) : (
						<Text type="secondary" className="block text-center py-4">
							No student suggestions available for your group.
						</Text>
					)}
				</div>
			)}

			<Divider orientation="left">
				<Text strong>All Available Students</Text>
			</Divider>

			<InviteTeamMembers
				members={selectedMembers}
				onMembersChange={setSelectedMembers}
				excludeUserIds={excludeUserIds}
				currentMemberCount={group.members.length}
			/>
		</Modal>
	);
}
