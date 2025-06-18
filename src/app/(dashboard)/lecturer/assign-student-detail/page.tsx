'use client';

import { Badge, Card, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LecturerAssignStudentDetailPage() {
	const { data: session } = useSession();

	return (
		<div className="p-6 max-w-6xl mx-auto">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<Title level={2} className="mb-2">
						👤 Assign Student Detail
						<Badge count="Moderator Only" color="gold" className="ml-3" />
					</Title>
					<Text type="secondary">
						View detailed information of assigned student
					</Text>
				</div>
				<div className="flex gap-3">
					<Link href="/lecturer/assign-student-list">
						<Text className="cursor-pointer hover:text-blue-600">
							← Back to Student List
						</Text>
					</Link>{' '}
					<Link href="/lecturer">
						<Text className="cursor-pointer hover:text-blue-600">
							← Dashboard
						</Text>
					</Link>
				</div>
			</div>

			{/* Content */}
			<Card>
				<Title level={4}>📋 Student Assignment Details</Title>
				<Text type="secondary">
					As a moderator, you can view detailed assignment information and make
					changes as needed.
				</Text>

				{/* Add actual student detail logic here */}
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
