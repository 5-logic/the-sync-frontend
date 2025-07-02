'use client';

import { Button, List, Modal, Typography } from 'antd';

import { Student } from '@/schemas/student';

const { Title, Paragraph, Text } = Typography;

interface Props {
	open: boolean;
	onCancel: () => void;
	onConfirm: () => void;
	students: Student[];
	groupName: string;
}

export default function AssignConfirmModal({
	open,
	onCancel,
	onConfirm,
	students,
	groupName,
}: Readonly<Props>) {
	return (
		<Modal
			open={open}
			centered
			onCancel={onCancel}
			footer={null}
			destroyOnClose
			title={
				<Title level={4} style={{ marginBottom: 20 }}>
					Confirm Assignment
				</Title>
			}
		>
			<Paragraph style={{ marginBottom: 15 }}>
				<Text strong>Group Name:</Text> {groupName}
			</Paragraph>

			<Paragraph>Students list:</Paragraph>

			<List
				size="small"
				bordered
				dataSource={students}
				renderItem={(student) => (
					<List.Item key={student.id}>{student.fullName}</List.Item>
				)}
			/>

			<div style={{ textAlign: 'right', marginTop: 24 }}>
				<Button onClick={onCancel} style={{ marginRight: 8 }}>
					Cancel
				</Button>
				<Button type="primary" onClick={onConfirm}>
					Assign
				</Button>
			</div>
		</Modal>
	);
}
