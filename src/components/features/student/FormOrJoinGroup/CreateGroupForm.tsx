import { Button, Col, Form, Row } from 'antd';
import { useCallback, useState } from 'react';

import groupService, { type GroupCreate } from '@/lib/services/groups.service';
import requestService from '@/lib/services/requests.service';
import { showNotification } from '@/lib/utils/notification';
import type { Student } from '@/schemas/student';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

import GroupFormFields from './GroupFormFields';
import InviteTeamMembers from './InviteTeamMembers';

interface CreateGroupFormValues {
	name: string;
	area?: string;
	skills?: string[];
	responsibility?: string[];
}

export default function CreateGroupForm() {
	const [form] = Form.useForm<CreateGroupFormValues>();
	const [members, setMembers] = useState<Student[]>([]);
	const [loading, setLoading] = useState(false);
	const { refreshGroup } = useGroupDashboardStore();

	const handleMembersChange = useCallback((newMembers: Student[]) => {
		setMembers(newMembers);
	}, []);

	const handleFinish = useCallback(
		async (values: CreateGroupFormValues) => {
			try {
				setLoading(true);

				// Prepare group data for API
				const groupData: GroupCreate = {
					name: values.name,
					projectDirection: values.area,
					skillIds: values.skills || [],
					responsibilityIds: values.responsibility || [],
				};

				// Step 1: Create group
				const groupResponse = await groupService.create(groupData);

				if (!groupResponse.success) {
					throw new Error(groupResponse.error || 'Failed to create group');
				}

				const createdGroup = groupResponse.data;
				showNotification.success('Group created successfully!');

				// Step 2: Invite members if any
				if (members.length > 0) {
					try {
						const studentIds = members.map((member) => member.id);
						const inviteResults = await requestService.inviteMultipleStudents(
							createdGroup.id,
							studentIds,
						);

						if (inviteResults.length > 0) {
							showNotification.success(
								`Successfully invited ${inviteResults.length}/${members.length} members`,
							);
						}

						if (inviteResults.length < members.length) {
							showNotification.warning(
								`Some invitations failed. ${inviteResults.length}/${members.length} members invited successfully.`,
							);
						}
					} catch (inviteError) {
						console.error('Error inviting members:', inviteError);
						showNotification.warning(
							'Group created successfully, but failed to send some invitations.',
						);
					}
				}

				// Reset form and trigger group status update
				form.resetFields();
				setMembers([]);

				// Fetch updated group status to trigger redirect
				await refreshGroup();
			} catch (error) {
				console.error('Error creating group:', error);
				showNotification.error(
					error instanceof Error ? error.message : 'Failed to create group',
				);
			} finally {
				setLoading(false);
			}
		},
		[members, form, refreshGroup],
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
						loading={loading}
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
