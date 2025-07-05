'use client';

import { EditOutlined } from '@ant-design/icons';
import { Card, Space, Switch, Table, Tooltip, Typography } from 'antd';

import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import { mockChecklistItems } from '@/data/ChecklistItems';
import { mockChecklists } from '@/data/checklist';
import { ChecklistItem } from '@/schemas/checklist';

export default function ChecklistDetailPage() {
	const checklistId = 'c1';

	const checklist = mockChecklists.find((cl) => cl.id === checklistId);
	const checklistItems = mockChecklistItems.filter(
		(item) => item.checklistId === checklistId,
	);

	if (!checklist) {
		return <Typography.Text type="danger">Checklist not found</Typography.Text>;
	}

	const columns = [
		{
			title: 'Item Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			render: (text: string | null) => text || <i>No description</i>,
		},
		{
			title: 'Required',
			dataIndex: 'isRequired',
			key: 'isRequired',
			render: (required: boolean) => (
				<Switch
					checked={required}
					disabled
					checkedChildren="Mandatory"
					unCheckedChildren="Optional"
				/>
			),
		},
		{
			title: 'Action',
			key: 'action',
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			render: (_: unknown) => (
				<Tooltip title="Edit">
					<EditOutlined style={{ color: '#52c41a', cursor: 'pointer' }} />
				</Tooltip>
			),
		},
	];

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="View Checklist Detail"
				description="Inspect checklist content for a specific milestone and semester, including required fields and criteria."
				badgeText="Moderator Only"
			/>

			<Card>
				<Typography.Title level={3}>{checklist.name}</Typography.Title>
				<Typography.Paragraph>{checklist.description}</Typography.Paragraph>
				<Typography.Paragraph type="secondary">
					<b>Semester:</b> {checklist.semester} &nbsp;&nbsp;|&nbsp;&nbsp;{' '}
					<b>Milestone:</b> {checklist.milestone}
				</Typography.Paragraph>
			</Card>

			<Card title="Checklist Items">
				<Table<ChecklistItem>
					rowKey="id"
					dataSource={checklistItems}
					columns={columns}
					pagination={false}
				/>
			</Card>
		</Space>
	);
}
