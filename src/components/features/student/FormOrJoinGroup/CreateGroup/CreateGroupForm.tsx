import { Button, Col, Form, Row } from 'antd';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useState } from 'react';

import CreateGroupInviteMembersSimple from '@/components/features/student/FormOrJoinGroup/CreateGroup/CreateGroupInviteMembersSimple';
import GroupFormFields from '@/components/features/student/FormOrJoinGroup/CreateGroup/GroupFormFields';
import groupService from '@/lib/services/groups.service';
import requestService from '@/lib/services/requests.service';
import { showNotification } from '@/lib/utils/notification';
import { GroupCreateService as GroupCreate } from '@/schemas/group';
import type { Student } from '@/schemas/student';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

interface CreateGroupFormValues {
	name: string;
	area?: string;
	skills?: string[];
	responsibility?: string[];
}

function CreateGroupForm() {
	const router = useRouter();
	const [form] = Form.useForm<CreateGroupFormValues>();
	const [members, setMembers] = useState<Student[]>([]);
	const [loading, setLoading] = useState(false);

	// Use simple, stable selector to prevent re-renders
	const refreshGroup = useGroupDashboardStore((state) => state.refreshGroup);

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
				showNotification.success('Success', 'Group created successfully!');

				// Reset form immediately after successful creation
				form.resetFields();

				// Trigger group status update
				refreshGroup();

				// Navigate to dashboard immediately after group creation
				router.push('/student/group-dashboard');

				// Step 2: Invite members in background (if any)
				if (members.length > 0) {
					// Show loading notification for invite process
					const inviteLoadingKey = `invite-${Date.now()}`;
					showNotification.loading(
						'Sending invitations...',
						`Inviting ${members.length} members to your group`,
						{ key: inviteLoadingKey, duration: 0 },
					);

					// Don't await this - let it run in background
					const inviteMembers = async () => {
						try {
							const studentIds = members.map((member) => member.id);
							const inviteResponse =
								await requestService.inviteMultipleStudents(
									createdGroup.id,
									studentIds,
								);

							// Dismiss loading notification
							showNotification.destroy(inviteLoadingKey);

							if (inviteResponse.success && inviteResponse.data.length > 0) {
								showNotification.success(
									'Invitations sent successfully!',
									`Successfully invited ${inviteResponse.data.length}/${members.length} members`,
									4.5,
								);
							} else if (
								inviteResponse.success &&
								inviteResponse.data.length === 0
							) {
								showNotification.warning(
									'No invitations sent',
									'No invitations were sent.',
									4.5,
								);
							} else {
								showNotification.warning(
									'Partial invitation failure',
									'Failed to send some invitations. You can invite members later from the group dashboard.',
									6,
								);
							}
						} catch (inviteError) {
							console.error('Error inviting members:', inviteError);

							// Dismiss loading notification
							showNotification.destroy(inviteLoadingKey);

							showNotification.warning(
								'Invitation failed',
								'Failed to send invitations. You can invite members later from the group dashboard.',
								6,
							);
						}
					};

					// Run invites in background
					inviteMembers();
				}

				// Reset members state
				setMembers([]);
			} catch (error) {
				console.error('Error creating group:', error);
				showNotification.error(
					'Failed to Create Group',
					error instanceof Error ? error.message : 'Failed to create group',
				);
			} finally {
				setLoading(false);
			}
		},
		[members, form, refreshGroup, router],
	);

	return (
		<Form
			form={form}
			layout="vertical"
			onFinish={handleFinish}
			requiredMark={false}
		>
			<GroupFormFields />

			{/* Using simple component for create group */}
			<CreateGroupInviteMembersSimple
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
						}}
					>
						Create Group
					</Button>
				</Col>
			</Row>
		</Form>
	);
}

export default memo(CreateGroupForm);
