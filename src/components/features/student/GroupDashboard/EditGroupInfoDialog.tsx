import { Button, Form, Modal, Popconfirm, Spin } from "antd";
import { useEffect, useState } from "react";

import GroupFormFields from "@/components/features/student/FormOrJoinGroup/CreateGroup/GroupFormFields";
import groupService, { GroupUpdate } from "@/lib/services/groups.service";
import { showNotification } from "@/lib/utils/notification";
import { GroupDashboard } from "@/schemas/group";

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
	const [hasChanges, setHasChanges] = useState(false);
	const [initialValues, setInitialValues] = useState<{
		name: string;
		area: string;
	} | null>(null);

	// Reset form when dialog opens with current group data
	useEffect(() => {
		if (visible && group) {
			const formValues = {
				name: group.name,
				area: group.projectDirection || "",
			};

			form.setFieldsValue(formValues);
			setInitialValues(formValues); // Store initial values for comparison
			setHasChanges(false); // Reset changes state
		}
	}, [visible, group, form]);

	// Helper function to get only changed fields
	const getChangedFields = (
		currentValues: {
			name: string;
			area: string;
		},
		initialValues: {
			name: string;
			area: string;
		},
	): Partial<GroupUpdate> => {
		const changes: Partial<GroupUpdate> = {};

		// Check name
		if (currentValues.name !== initialValues.name) {
			changes.name = currentValues.name;
		}

		// Check project direction/area
		if (currentValues.area !== initialValues.area) {
			changes.projectDirection = currentValues.area || "";
		}

		return changes;
	};

	// Function to check if there are any changes
	const checkForChanges = () => {
		if (!initialValues) return false;

		const currentValues = form.getFieldsValue();
		const changedFields = getChangedFields(currentValues, initialValues);
		return Object.keys(changedFields).length > 0;
	};

	// Update hasChanges when form values change
	const handleFormChange = () => {
		const hasFormChanges = checkForChanges();
		setHasChanges(hasFormChanges);
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			// Check if we have initial values to compare with
			if (!initialValues) {
				showNotification.error(
					"Error",
					"Unable to determine changes. Please close and reopen the dialog.",
				);
				return;
			}

			// Get only the changed fields
			const changedFields = getChangedFields(values, initialValues);

			// Log changes in development mode
			if (process.env.NODE_ENV === "development") {
				console.log("Changed fields:", changedFields);
			}

			setLoading(true);

			const response = await groupService.update(group.id, changedFields);

			if (response.success) {
				showNotification.success(
					"Success",
					"Group information updated successfully!",
				);
				// Update initial values to current values after successful update
				setInitialValues(values);
				setHasChanges(false); // Reset changes state after successful update
				onSuccess();
			} else {
				showNotification.error(
					"Error",
					response.error || "Failed to update group information.",
				);
			}
		} catch (error) {
			console.error("Error updating group:", error);
			showNotification.error(
				"Error",
				"An unexpected error occurred while updating group information.",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		setInitialValues(null); // Reset initial values
		setHasChanges(false); // Reset changes state
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
					disabled={loading || !hasChanges}
				>
					<Button type="primary" loading={loading} disabled={!hasChanges}>
						Update Group
					</Button>
				</Popconfirm>,
			]}
		>
			{loading ? (
				<div style={{ textAlign: "center", padding: "40px 0" }}>
					<Spin size="large" />
					<div style={{ marginTop: 16, color: "#666" }}>
						Loading responsibilities...
					</div>
				</div>
			) : (
				<Form
					form={form}
					layout="vertical"
					requiredMark={false}
					style={{ marginTop: "20px" }}
					onValuesChange={handleFormChange}
				>
					<GroupFormFields />
				</Form>
			)}
		</Modal>
	);
}
