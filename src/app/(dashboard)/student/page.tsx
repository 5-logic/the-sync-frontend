'use client';

import { Card, Tag, Typography } from 'antd';

import { useSessionData } from '@/hooks/auth/useAuth';

const { Title, Text } = Typography;

export default function StudentDashboard() {
	const { session } = useSessionData();

	return (
		<div className="max-w-6xl mx-auto">
			{/* Welcome Section */}
			<div className="mb-6">
				<Title level={2} className="mb-2">
					🎓 Student Dashboard
				</Title>
				<Text type="secondary">
					Welcome back, {session?.user?.fullName ?? 'Student'}!
				</Text>
			</div>

			{/* Student Profile Overview */}
			<Card
				className="mb-6"
				style={{
					background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
				}}
			>
				<Title level={4}>👤 Student Profile</Title>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Text type="secondary">Full Name</Text>
						<br />
						<Text strong style={{ fontSize: '16px' }}>
							{session?.user?.fullName}
						</Text>
					</div>
					<div>
						<Text type="secondary">Student ID</Text>
						<br />
						<Text strong style={{ fontSize: '16px' }}>
							{session?.user?.id}
						</Text>
					</div>
					<div>
						<Text type="secondary">Email Address</Text>
						<br />
						<Text strong style={{ fontSize: '16px' }}>
							{session?.user?.email}
						</Text>
					</div>
					<div>
						<Text type="secondary">Academic Status</Text>
						<br />
						<Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
							{session?.user?.role}
						</Tag>
					</div>
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
					<Card size="small" className="cursor-pointer hover:shadow-md">
						<Text strong>👤 Student Profile (Demo)</Text>
						<br />
						<Text type="secondary">
							<a
								href="/student/profile/0c1ba461-751a-4369-a035-e94a1c07a1ce"
								className="text-blue-600"
							>
								View Sample Profile
							</a>
						</Text>
					</Card>
				</div>
			</Card>
		</div>
	);
}
