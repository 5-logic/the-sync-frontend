'use client';

import { BookOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic, Tag, Typography } from 'antd';
import { useSession } from 'next-auth/react';

const { Title, Text } = Typography;

export default function AdminDashboard() {
	const { data: session } = useSession();
	return (
		<div className="max-w-7xl mx-auto">
			{/* Welcome Section */}
			<div className="mb-6">
				<Title level={2} className="mb-2">
					👨‍💻 Admin Dashboard
				</Title>
				<Text type="secondary">System Administration Panel</Text>
			</div>

			{/* Admin Info Card */}
			<Card className="mb-6">
				<Title level={4}>📋 Administrator Information</Title>
				<div className="space-y-2">
					<p>
						<strong>Name:</strong> {session?.user?.name}
					</p>
					<p>
						<strong>Email:</strong> {session?.user?.email}
					</p>
					<p>
						<strong>Role:</strong> <Tag color="red">{session?.user?.role}</Tag>
					</p>
					<p>
						<strong>Admin ID:</strong> {session?.user?.id}
					</p>
				</div>
			</Card>

			{/* System Statistics */}
			<Card className="mb-6">
				<Title level={4}>📊 System Overview</Title>
				<Row gutter={16}>
					<Col span={6}>
						<Statistic
							title="Total Students"
							value={1234}
							prefix={<UserOutlined />}
						/>
					</Col>
					<Col span={6}>
						<Statistic
							title="Total Lecturers"
							value={89}
							prefix={<UserOutlined />}
						/>
					</Col>
					<Col span={6}>
						<Statistic
							title="Active Courses"
							value={45}
							prefix={<BookOutlined />}
						/>
					</Col>
					<Col span={6}>
						<Statistic
							title="System Messages"
							value={23}
							prefix={<MessageOutlined />}
						/>
					</Col>
				</Row>
			</Card>

			{/* Admin Actions */}
			<Card>
				<Title level={4}>⚙️ Administrative Actions</Title>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card size="small" className="cursor-pointer hover:shadow-md">
						<Text strong>👥 User Management</Text>
						<br />
						<Text type="secondary">Manage all users</Text>
					</Card>
					<Card size="small" className="cursor-pointer hover:shadow-md">
						<Text strong>📚 Course Management</Text>
						<br />
						<Text type="secondary">Oversee all courses</Text>
					</Card>
					<Card size="small" className="cursor-pointer hover:shadow-md">
						<Text strong>📊 Reports</Text>
						<br />
						<Text type="secondary">Generate system reports</Text>
					</Card>
					<Card size="small" className="cursor-pointer hover:shadow-md">
						<Text strong>⚙️ System Settings</Text>
						<br />
						<Text type="secondary">Configure system</Text>
					</Card>
				</div>
			</Card>
		</div>
	);
}
