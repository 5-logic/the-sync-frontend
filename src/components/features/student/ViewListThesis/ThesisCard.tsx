'use client';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import { useRouter } from 'next/navigation';

import { useStudentGroupStatus } from '@/hooks/student/useStudentGroupStatus';
import { DOMAIN_COLOR_MAP } from '@/lib/constants/domains';
import { ThesisWithRelations } from '@/schemas/thesis';

interface Props {
	readonly thesis: ThesisWithRelations;
	readonly studentRole?: 'leader' | 'member' | 'guest';
}

export default function ThesisCard({ thesis, studentRole }: Props) {
	const { hasGroup } = useStudentGroupStatus();
	const router = useRouter();

	// Get domain color
	const domainColor = thesis.domain
		? DOMAIN_COLOR_MAP[thesis.domain] || 'default'
		: 'default';

	// Process skills for display (max 1 line, show extra count if needed)
	const maxVisibleSkills = 3;
	const visibleSkills =
		thesis.thesisRequiredSkills?.slice(0, maxVisibleSkills) || [];
	const extraSkillsCount =
		(thesis.thesisRequiredSkills?.length || 0) - maxVisibleSkills;

	// Check if thesis is already taken by another group
	const isThesisTaken = thesis.groupId !== null;

	// Determine if register button should be enabled
	const canRegister = studentRole === 'leader' && hasGroup && !isThesisTaken;

	// Handle view details navigation
	const handleViewDetails = () => {
		router.push(`/student/list-thesis/${thesis.id}`);
	};

	// Get button tooltip message based on current state
	const getButtonTooltip = (): string => {
		if (isThesisTaken) {
			return 'This thesis is already taken by another group';
		}
		if (!hasGroup) {
			return 'You need to be in a group to register';
		}
		if (studentRole !== 'leader') {
			return 'Only group leaders can register for thesis';
		}
		return 'Register for this thesis';
	};

	return (
		<Card
			title={null}
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				borderRadius: 12,
			}}
			bodyStyle={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
		>
			<Space
				direction="vertical"
				size="middle"
				style={{ width: '100%', flexGrow: 1 }}
			>
				<Typography.Title
					level={5}
					style={{
						marginBottom: 0,
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						lineHeight: '1.4',
						minHeight: '2.8em', // Always maintain 2 lines height
						maxHeight: '2.8em', // 2 lines * 1.4 line-height
					}}
				>
					{thesis.englishName}
				</Typography.Title>

				<Typography.Text
					type="secondary"
					style={{
						display: '-webkit-box',
						WebkitLineClamp: 4,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						lineHeight: '1.4',
						minHeight: '5.6em', // Always maintain 4 lines height
						maxHeight: '5.6em', // 4 lines * 1.4 line-height
					}}
				>
					{thesis.description}
				</Typography.Text>

				<Space align="center">
					<Avatar size="small" icon={<UserOutlined />} />
					<Typography.Text strong>
						{thesis.lecturer.user.fullName}
					</Typography.Text>
				</Space>

				{thesis.domain && (
					<Tag color={domainColor} style={{ borderRadius: 6 }}>
						{thesis.domain}
					</Tag>
				)}

				<Space
					wrap
					size={[8, 8]}
					style={{
						minHeight: '2em', // Always maintain consistent height
						maxHeight: '2em',
						overflow: 'hidden',
					}}
				>
					{visibleSkills.map((trs) => (
						<Tag
							key={trs.skill.id}
							color="processing"
							style={{ borderRadius: 6, border: '1px solid #91d5ff' }}
						>
							{trs.skill.name}
						</Tag>
					))}
					{extraSkillsCount > 0 && (
						<Tag
							color="default"
							style={{ borderRadius: 6, border: '1px solid #d9d9d9' }}
						>
							+{extraSkillsCount} more
						</Tag>
					)}
					{visibleSkills.length === 0 && (
						<Typography.Text type="secondary">
							No skills specified
						</Typography.Text>
					)}
				</Space>
			</Space>

			<Row gutter={8} style={{ marginTop: 24 }}>
				<Col span={12}>
					<Button type="primary" block onClick={handleViewDetails}>
						View Details
					</Button>
				</Col>
				<Col span={12}>
					<Button block disabled={!canRegister} title={getButtonTooltip()}>
						{isThesisTaken ? 'Taken' : 'Register'}
					</Button>
				</Col>
			</Row>
		</Card>
	);
}
