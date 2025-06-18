'use client';

import { Badge, Card, Tag, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LecturerDashboard() {
	const { data: session } = useSession();
	const isModerator = session?.user?.isModerator;
	return (
		<div className="max-w-6xl mx-auto">
			{/* Welcome Section */}
			<div className="mb-6">
				<Title level={2} className="mb-2">
					👨‍🏫 Lecturer Dashboard
					{isModerator && (
						<Badge count="Moderator" color="gold" className="ml-3" />
					)}
				</Title>{' '}
				<Text type="secondary">Welcome back, {session?.user?.name}!</Text>
			</div>
			{/* User Info Card */}
			<Card className="mb-6">
				<Title level={4}>📋 Your Information</Title>
				<div className="space-y-2">
					<p>
						<strong>Name:</strong> {session?.user?.name}
					</p>
					<p>
						<strong>Email:</strong> {session?.user?.email}
					</p>
					<p>
						<strong>Role:</strong>{' '}
						<Tag color="green">{session?.user?.role}</Tag>
					</p>
					{isModerator && (
						<p>
							<strong>Privileges:</strong> <Tag color="gold">Moderator</Tag>
						</p>
					)}
					<p>
						<strong>Lecturer ID:</strong> {session?.user?.id}
					</p>
				</div>
			</Card>{' '}
			{/* Quick Actions */}
			<Card>
				<Title level={4}>🚀 Quick Actions</Title>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Link href="/lecturer/thesis-management">
						<Card size="small" className="cursor-pointer hover:shadow-md">
							<Text strong>📚 Thesis Management</Text>
							<br />
							<Text type="secondary">Manage thesis topics</Text>
						</Card>
					</Link>
					<Link href="/lecturer/group-progress">
						<Card size="small" className="cursor-pointer hover:shadow-md">
							<Text strong>📊 Group Progress</Text>
							<br />
							<Text type="secondary">Track student progress</Text>
						</Card>
					</Link>
					<Link href="/lecturer/create-thesis">
						<Card size="small" className="cursor-pointer hover:shadow-md">
							<Text strong>📝 Create Thesis</Text>
							<br />
							<Text type="secondary">Add new thesis topics</Text>
						</Card>
					</Link>
					<Link href="/lecturer/profile-settings">
						<Card size="small" className="cursor-pointer hover:shadow-md">
							<Text strong>⚙️ Profile Settings</Text>
							<br />
							<Text type="secondary">Update your profile</Text>
						</Card>
					</Link>

					{/* Moderator-only sections */}
					{isModerator && (
						<>
							<Link href="/lecturer/assign-student-list">
								<Card
									size="small"
									className="cursor-pointer hover:shadow-md border-2 border-yellow-400 bg-yellow-50"
								>
									<Text strong>👥 Assign Students</Text>
									<br />
									<Text type="secondary">
										<Tag color="gold">Moderator</Tag>
										Assign students to supervisors
									</Text>
								</Card>
							</Link>
							<Link href="/lecturer/assign-supervisor">
								<Card
									size="small"
									className="cursor-pointer hover:shadow-md border-2 border-yellow-400 bg-yellow-50"
								>
									<Text strong>👨‍🏫 Assign Supervisor</Text>
									<br />
									<Text type="secondary">
										<Tag color="gold">Moderator</Tag>
										Manage supervisor assignments
									</Text>
								</Card>
							</Link>
						</>
					)}
				</div>
			</Card>
		</div>
	);
}
