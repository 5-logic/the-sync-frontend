import { Button, Col, Form, Row } from 'antd';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useState } from 'react';

import CreateGroupInviteMembersSimple from '@/components/features/student/FormOrJoinGroup/CreateGroup/CreateGroupInviteMembersSimple';
import GroupFormFields from '@/components/features/student/FormOrJoinGroup/CreateGroup/GroupFormFields';
import groupService, { type GroupCreate } from '@/lib/services/groups.service';
import requestService from '@/lib/services/requests.service';
import { showNotification } from '@/lib/utils/notification';
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
				showNotification.success('Group created successfully!');

				// Step 2: Invite members if any
				if (members.length > 0) {
					try {
						const studentIds = members.map((member) => member.id);
						const inviteResponse = await requestService.inviteMultipleStudents(
							createdGroup.id,
							studentIds,
						);

						if (inviteResponse.success && inviteResponse.data.length > 0) {
							showNotification.success(
								`Successfully invited ${inviteResponse.data.length}/${members.length} members`,
							);
						} else if (
							inviteResponse.success &&
							inviteResponse.data.length === 0
						) {
							showNotification.warning('No invitations were sent.');
						} else {
							showNotification.warning(
								'Group created successfully, but failed to send invitations.',
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

				// Fetch updated group status - the GroupStatusGuard will handle redirect
				await refreshGroup();

				// Add a small delay to ensure API has processed the group creation
				await new Promise((resolve) => setTimeout(resolve, 1000));
				await refreshGroup();

				// Since the GroupStatusGuard will handle redirect when group is available,
				// we don't need to check group state here. Just redirect after delay.
				setTimeout(() => {
					router.push('/student/group-dashboard');
				}, 500);
			} catch (error) {
				console.error('Error creating group:', error);
				showNotification.error(
					error instanceof Error ? error.message : 'Failed to create group',
				);
			} finally {
				setLoading(false);
			}
		},
		[members, form, refreshGroup, router], // Removed group dependency since not used in callback
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
