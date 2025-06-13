'use client';

import { Card, Tag, Typography } from 'antd';
import { useSession } from 'next-auth/react';

const { Title, Text } = Typography;

export default function StudentDashboard() {
	const { data: session } = useSession();

	return (
		<div className="max-w-6xl mx-auto">
			{/* Welcome Section */}
			<div className="mb-6">
				<Title level={2} className="mb-2">
					🎓 Student Dashboard
				</Title>
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
						<strong>Role:</strong> <Tag color="blue">{session?.user?.role}</Tag>
					</p>
					<p>
						<strong>Student ID:</strong> {session?.user?.id}
					</p>
				</div>
			</Card>

			{/* Quick Actions */}
			<Card>
				<Title level={4}>🚀 Quick Actions</Title>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card size="small" className="cursor-pointer hover:shadow-md">
						<Text strong>📚 My Courses</Text>
						<br />
						<Text type="secondary">View enrolled courses</Text>
					</Card>
					<Card size="small" className="cursor-pointer hover:shadow-md">
						<Text strong>📝 Assignments</Text>
						<br />
						<Text type="secondary">View and submit assignments</Text>
					</Card>
					<Card size="small" className="cursor-pointer hover:shadow-md">
						<Text strong>📊 Grades</Text>
						<br />
						<Text type="secondary">Check your performance</Text>
					</Card>
					<Card size="small" className="cursor-pointer hover:shadow-md">
						<Text strong>📅 Schedule</Text>
						<br />
						<Text type="secondary">View class timetable</Text>
					</Card>
					<Card size="small" className="cursor-pointer hover:shadow-md">
						<Text strong>💬 Messages</Text>
						<br />
						<Text type="secondary">Chat with lecturers</Text>
					</Card>
					<Card size="small" className="cursor-pointer hover:shadow-md">
						<Text strong>📖 Resources</Text>
						<br />
						<Text type="secondary">Access course materials</Text>
					</Card>
				</div>
			</Card>
		</div>
	);
}
