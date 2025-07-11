'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Spin } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import StudentInfoCard from '@/components/features/student/StudentInfoCard';
import { useStudentInvite } from '@/hooks/student/useStudentInvite';
import {
	useStudentGroup,
	useStudentProfile,
} from '@/hooks/student/useStudentProfile';

export default function StudentProfilePage() {
	const params = useParams();
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
	} = useStudentGroup(studentId);

	const {
		inviteStudentToGroup,
		isCurrentUserGroupLeader,
		loading: inviteLoading,
	} = useStudentInvite();

	// Check if current user is a group leader
	const isLeader = isCurrentUserGroupLeader(studentGroup || undefined);

	const handleInviteToGroup = async () => {
		if (studentGroup) {
			await inviteStudentToGroup(studentId, studentGroup.id);
		}
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
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-6">
				<Link href="/student">
					<Button type="text" icon={<ArrowLeftOutlined />} className="mb-4">
						Back to Dashboard
					</Button>
				</Link>
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
				onInviteToGroup={handleInviteToGroup}
				loading={groupLoading || inviteLoading}
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
