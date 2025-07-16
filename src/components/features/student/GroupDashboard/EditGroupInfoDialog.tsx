'use client';

import { Button, Form, Modal, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';

import GroupFormFields from '@/components/features/student/FormOrJoinGroup/CreateGroup/GroupFormFields';
import groupService, { GroupUpdate } from '@/lib/services/groups.service';
import { showNotification } from '@/lib/utils/notification';
import { GroupDashboard } from '@/schemas/group';

interface EditGroupInfoDialogProps {
	readonly visible: boolean;
	readonly onCancel: () => void;
	readonly onSuccess: () => void;
	readonly group: GroupDashboard;
}

export default function EditGroupInfoDialog({
	visible,
	onCancel,
	onSuccess,
	group,
}: EditGroupInfoDialogProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	// Reset form when dialog opens with current group data
	useEffect(() => {
		if (visible && group) {
			form.setFieldsValue({
				name: group.name,
				area: group.projectDirection || '',
				skills: group.skills?.map((skill) => skill.id) || [],
				responsibility: group.responsibilities?.map((resp) => resp.id) || [],
			});
		}
	}, [visible, group, form]);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			const updateData: GroupUpdate = {
				name: values.name,
				projectDirection: values.area || '',
				skillIds: values.skills || [],
				responsibilityIds: values.responsibility || [],
			};

			const response = await groupService.update(group.id, updateData);

			if (response.success) {
				showNotification.success(
					'Success',
					'Group information updated successfully!',
				);
				onSuccess();
			} else {
				showNotification.error(
					'Error',
					response.error || 'Failed to update group information.',
				);
			}
		} catch (error) {
			console.error('Error updating group:', error);
			showNotification.error(
				'Error',
				'An unexpected error occurred while updating group information.',
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		onCancel();
	};

	return (
		<Modal
			title="Edit Group Information"
			open={visible}
			onCancel={handleCancel}
			width={800}
			centered
			footer={[
				<Button key="cancel" onClick={handleCancel} disabled={loading}>
					Cancel
				</Button>,
				<Popconfirm
					key="submit"
					title="Update Group Information"
					description="Are you sure you want to update the group information?"
					onConfirm={handleSubmit}
					okText="Yes, Update"
					cancelText="Cancel"
					okButtonProps={{ loading }}
					disabled={loading}
				>
					<Button type="primary" loading={loading}>
						Update Group
					</Button>
				</Popconfirm>,
			]}
		>
			<Form
				form={form}
				layout="vertical"
				requiredMark={false}
				style={{ marginTop: '20px' }}
			>
				<GroupFormFields />
			</Form>
		</Modal>
	);
}
