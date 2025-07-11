'use client';

import {
	ExclamationCircleOutlined,
	TeamOutlined,
	UserOutlined,
} from '@ant-design/icons';
import {
	Avatar,
	Button,
	Card,
	Col,
	Descriptions,
	Divider,
	Modal,
	Row,
	Space,
	Tag,
	Typography,
} from 'antd';
import Link from 'next/link';
import { useState } from 'react';

import { GroupDashboard } from '@/schemas/group';
import { StudentProfile } from '@/schemas/student';

const { Title, Text } = Typography;
const { confirm } = Modal;

interface StudentInfoCardProps {
	student: StudentProfile | null;
	studentGroup?: GroupDashboard;
	isCurrentUserGroupLeader?: boolean;
	onInviteToGroup?: () => void;
	loading?: boolean;
}

const getLevelColor = (level: string) => {
	switch (level.toLowerCase()) {
		case 'beginner':
			return 'blue';
		case 'intermediate':
			return 'orange';
		case 'proficient':
			return 'green';
		case 'expert':
			return 'purple';
		default:
			return 'default';
	}
};

export default function StudentInfoCard({
	student,
	studentGroup,
	isCurrentUserGroupLeader = false,
	onInviteToGroup,
	loading = false,
}: StudentInfoCardProps) {
	const [inviteLoading, setInviteLoading] = useState(false);

	const handleInviteClick = () => {
		if (!student) return;

		confirm({
			title: 'Invite Student to Group',
			icon: <ExclamationCircleOutlined />,
			content: `Are you sure you want to invite ${student.fullName} to join your group?`,
			okText: 'Yes, Invite',
			cancelText: 'Cancel',
			onOk: async () => {
				setInviteLoading(true);
				try {
					await onInviteToGroup?.();
				} finally {
					setInviteLoading(false);
				}
			},
		});
	};

	// Show loading state
	if (loading || !student) {
		return (
			<div className="space-y-6">
				<Card loading={true} />
				<Card loading={true} />
				<Card loading={true} />
				<Card loading={true} />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Basic Information Card */}
			<Card
				title={
					<div className="flex items-center gap-3">
						<Avatar size={40} icon={<UserOutlined />} />
						<div>
							<Title level={4} className="mb-0">
								{student.fullName}
							</Title>
							<Text type="secondary">{student.studentCode}</Text>
						</div>
					</div>
				}
				extra={
					isCurrentUserGroupLeader &&
					!studentGroup && (
						<Button
							type="primary"
							icon={<TeamOutlined />}
							onClick={handleInviteClick}
							loading={inviteLoading}
						>
							Invite to Group
						</Button>
					)
				}
				loading={loading}
			>
				<Descriptions column={2} size="middle">
					<Descriptions.Item label="Email">{student.email}</Descriptions.Item>
					<Descriptions.Item label="Phone Number">
						{student.phoneNumber}
					</Descriptions.Item>
					<Descriptions.Item label="Gender">{student.gender}</Descriptions.Item>
					<Descriptions.Item label="Major">
						<Tag color="blue">
							{student.major.name} ({student.major.code})
						</Tag>
					</Descriptions.Item>
					<Descriptions.Item label="Status">
						<Tag color={student.isActive ? 'green' : 'red'}>
							{student.isActive ? 'Active' : 'Inactive'}
						</Tag>
					</Descriptions.Item>
					<Descriptions.Item label="Joined">
						{new Date(student.createdAt).toLocaleDateString()}
					</Descriptions.Item>
				</Descriptions>
			</Card>

			{/* Enrollments */}
			<Card title="Semester Enrollments" loading={loading}>
				<Row gutter={[16, 16]}>
					{student.enrollments.map((enrollment, index) => (
						<Col xs={24} sm={12} md={8} key={index}>
							<Tag color="blue">{enrollment.semester.name}</Tag>
						</Col>
					))}
				</Row>
			</Card>

			{/* Skills */}
			<Card title="Skills & Expertise" loading={loading}>
				<Space size={[8, 8]} wrap>
					{student.studentSkills.map((skill, index) => (
						<div
							key={index}
							className="inline-flex items-center gap-2 p-2 border rounded-lg bg-gray-50 border-gray-300"
						>
							<Text strong className="text-sm">
								{skill.skillName}
							</Text>
							<Tag color={getLevelColor(skill.level)} className="text-xs">
								{skill.level}
							</Tag>
						</div>
					))}
				</Space>
				{student.studentSkills.length === 0 && (
					<div className="text-center py-8">
						<Text type="secondary">No skills registered yet</Text>
					</div>
				)}
			</Card>

			{/* Expected Responsibilities */}
			<Card title="Expected Responsibilities" loading={loading}>
				<Space wrap>
					{student.studentExpectedResponsibilities.map(
						(responsibility, index) => (
							<Tag key={index} color="purple">
								{responsibility.responsibilityName}
							</Tag>
						),
					)}
				</Space>
				{student.studentExpectedResponsibilities.length === 0 && (
					<div className="text-center py-4">
						<Text type="secondary">No expected responsibilities specified</Text>
					</div>
				)}
			</Card>

			{/* Group Information */}
			{studentGroup && (
				<Card
					title="Current Group"
					loading={loading}
					extra={
						<Link href={`/student/group-detail/${studentGroup.id}`}>
							<Button type="link">View Group Detail</Button>
						</Link>
					}
				>
					<Descriptions column={2} size="middle">
						<Descriptions.Item label="Group Name">
							<Title level={5} className="mb-0">
								{studentGroup.name}
							</Title>
						</Descriptions.Item>
						<Descriptions.Item label="Group Code">
							<Tag color="blue">{studentGroup.code}</Tag>
						</Descriptions.Item>
						<Descriptions.Item label="Project Direction">
							{studentGroup.projectDirection || 'Not specified'}
						</Descriptions.Item>
						<Descriptions.Item label="Leader">
							<div className="flex items-center gap-2">
								<Avatar size={24} icon={<UserOutlined />} />
								<span>{studentGroup.leader.user.fullName}</span>
								<Tag color="gold">Leader</Tag>
							</div>
						</Descriptions.Item>
						<Descriptions.Item label="Semester">
							{studentGroup.semester.name} ({studentGroup.semester.code})
						</Descriptions.Item>
						<Descriptions.Item label="Members">
							{studentGroup.members.length} members
						</Descriptions.Item>
					</Descriptions>

					<Divider />

					{/* Group Skills */}
					<div className="mb-4">
						<Title level={5}>Required Skills</Title>
						<Space wrap>
							{studentGroup.skills.map((skill) => (
								<Tag key={skill.id} color="green">
									{skill.name} ({skill.skillSet.name})
								</Tag>
							))}
						</Space>
					</div>

					{/* Group Responsibilities */}
					<div>
						<Title level={5}>Required Responsibilities</Title>
						<Space wrap>
							{studentGroup.responsibilities.map((responsibility) => (
								<Tag key={responsibility.id} color="purple">
									{responsibility.name}
								</Tag>
							))}
						</Space>
					</div>
				</Card>
			)}
		</div>
	);
}
