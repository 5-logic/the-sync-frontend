'use client';

import { Badge, Card, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import LogoutButton from '@/components/common/LogoutButton';

const { Title, Text } = Typography;

export default function LecturerAssignStudentListPage() {
	const { data: session } = useSession();

	return (
		<div className="p-6 max-w-6xl mx-auto">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<Title level={2} className="mb-2">
						👥 Assign Student List
						<Badge count="Moderator Only" color="gold" className="ml-3" />
					</Title>
					<Text type="secondary">
						View and manage student assignments to supervisors
					</Text>
				</div>
				<div className="flex gap-3">
					<Link href="/lecturer">
						<Text className="cursor-pointer hover:text-blue-600">
							← Back to Dashboard
						</Text>
					</Link>
					<LogoutButton />
				</div>
			</div>

			{/* Content */}
			<Card>
				<Title level={4}>📋 Student Assignment Management</Title>
				<Text type="secondary">
					As a moderator, you can view all student assignments and manage the
					assignment process.
				</Text>

				{/* TODO: Add actual student assignment list logic here */}
				<div className="mt-4 p-4 bg-blue-50 rounded-lg">
					<Text>
						<strong>Moderator Privileges:</strong> This page is only accessible
						to lecturers with moderator privileges. Current user:{' '}
						<strong>{session?.user?.name}</strong> ({session?.user?.role})
					</Text>
				</div>
			</Card>
		</div>
	);
}
