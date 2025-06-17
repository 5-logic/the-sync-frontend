'use client';

import { Badge, Card, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LecturerAssignSupervisorPage() {
	const { data: session } = useSession();

	return (
		<div className="p-6 max-w-6xl mx-auto">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<Title level={2} className="mb-2">
						👨‍🏫 Assign Supervisor
						<Badge count="Moderator Only" color="gold" className="ml-3" />
					</Title>
					<Text type="secondary">
						Manage supervisor assignments for thesis groups
					</Text>
				</div>{' '}
				<Link href="/lecturer">
					<Text className="cursor-pointer hover:text-blue-600">
						← Back to Dashboard
					</Text>
				</Link>
			</div>

			{/* Content */}
			<Card>
				<Title level={4}>📋 Supervisor Assignment Management</Title>
				<Text type="secondary">
					As a moderator, you can assign supervisors to thesis groups and manage
					supervision relationships.
				</Text>

				{/* Add actual supervisor assignment logic here */}
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
