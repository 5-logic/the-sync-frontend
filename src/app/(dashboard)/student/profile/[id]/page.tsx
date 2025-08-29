'use client';

import { Alert, Button, Spin } from 'antd';
import { useParams, useRouter } from 'next/navigation';

import StudentInfoCard from '@/components/features/student/StudentInfoCard';
import { useStudentInvite } from '@/hooks/student/useStudentInvite';
import {
	useStudentGroup,
	useStudentProfile,
} from '@/hooks/student/useStudentProfile';
import { useStudentRequestStatus } from '@/hooks/student/useStudentRequestStatus';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

export default function StudentProfilePage() {
	const params = useParams();
	const router = useRouter();
	const studentId = params.id as string;

	const {
		data: student,
		loading: studentLoading,
		error: studentError,
	} = useStudentProfile(studentId);

	const {
		data: studentGroup,
		loading: groupLoading,
		error: groupError,
		refetch: refetchStudentGroup,
	} = useStudentGroup(studentId);

	const { isCurrentUserGroupLeader } = useStudentInvite();

	// Get current user's group
	const { group: currentUserGroup } = useGroupDashboardStore();

	// Use the new hook to manage request status
	const {
		hasInvite,
		hasJoinRequest,
		loading: requestLoading,
		sendInvite,
		cancelInvite,
		approveJoinRequest,
		rejectJoinRequest,
	} = useStudentRequestStatus(studentId, refetchStudentGroup);

	// Check if current user is a group leader of their own group
	const isLeader = isCurrentUserGroupLeader(currentUserGroup || undefined);

	const handleGoBackToGroup = () => {
		router.push('/student/group-dashboard');
	};

	if (studentLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Spin size="large" />
			</div>
		);
	}

	if (studentError) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Alert
					message="Error"
					description={studentError}
					type="error"
					showIcon
					action={
						<Button size="small" danger>
							Try Again
						</Button>
					}
				/>
			</div>
		);
	}

	if (!student) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Alert
					message="Student Not Found"
					description="The student profile you are looking for does not exist."
					type="warning"
					showIcon
				/>
			</div>
		);
	}

	return (
		<div className="container mx-auto">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
				<p className="text-gray-600 mt-2">
					Detailed information about {student.fullName}
				</p>
			</div>

			{/* Student Info Card */}
			<StudentInfoCard
				student={student}
				studentGroup={studentGroup || undefined}
				isCurrentUserGroupLeader={isLeader}
				loading={groupLoading}
				// New props for request management
				hasInvite={hasInvite}
				hasJoinRequest={hasJoinRequest}
				requestLoading={requestLoading}
				onSendInvite={sendInvite}
				onCancelInvite={cancelInvite}
				onApproveJoinRequest={approveJoinRequest}
				onRejectJoinRequest={rejectJoinRequest}
				onGoBackToGroup={handleGoBackToGroup}
				showGroupActions={!!currentUserGroup} // Show actions if current user has a group
			/>

			{/* Group Error (if any) */}
			{groupError && (
				<Alert
					message="Failed to load group information"
					description={groupError}
					type="warning"
					showIcon
					className="mt-4"
				/>
			)}
		</div>
	);
}
