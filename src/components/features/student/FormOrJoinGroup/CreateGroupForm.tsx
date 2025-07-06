import { Button, Col, Form, Row } from 'antd';
import { useCallback, useState } from 'react';

import { showNotification } from '@/lib/utils/notification';
import type { Student } from '@/schemas/student';

import GroupFormFields from './GroupFormFields';
import InviteTeamMembers from './InviteTeamMembers';

interface CreateGroupFormValues {
	name: string;
	area?: string;
	skills?: string[];
	responsibility?: string;
}

export default function CreateGroupForm() {
	const [form] = Form.useForm<CreateGroupFormValues>();
	const [members, setMembers] = useState<Student[]>([]);

	const handleMembersChange = useCallback((newMembers: Student[]) => {
		setMembers(newMembers);
	}, []);

	const handleFinish = useCallback(
		(values: CreateGroupFormValues) => {
			console.log('Create group:', { ...values, members });
			showNotification.success('Group created successfully!');
			form.resetFields();
			setMembers([]);
		},
		[members, form],
	);

	return (
		<Form
			form={form}
			layout="vertical"
			onFinish={handleFinish}
			requiredMark={false}
		>
			<GroupFormFields />

			<InviteTeamMembers
				members={members}
				onMembersChange={handleMembersChange}
			/>

			<Row justify="end">
				<Col>
					<Button
						type="primary"
						htmlType="submit"
						style={{
							minWidth: 120,
							fontSize: 14,
							height: 40,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						Create Group
					</Button>
				</Col>
			</Row>
		</Form>
	);
}
