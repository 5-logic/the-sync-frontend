'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Row, Space, Typography } from 'antd';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Header } from '@/components/common/Header';
import ChecklistInfoCard from '@/components/features/lecturer/ChecklistDetail/ChecklistInfoCard';
import ChecklistItemsTable from '@/components/features/lecturer/ChecklistDetail/ChecklistItemTable';
import { useChecklistDetail } from '@/hooks/checklist/useChecklistDetail';
import { useNavigationLoader } from '@/hooks/ux/useNavigationLoader';
import { showNotification } from '@/lib/utils/notification';
import { ChecklistItem } from '@/schemas/checklist';
import { useChecklistStore } from '@/store';

export default function ChecklistEditPage() {
	const params = useParams();
	const checklistId = params?.id as string;
	const { navigateWithLoading } = useNavigationLoader();
	const {
		updateChecklist,
		updateChecklistItems,
		updating,
		creating,
		deleting,
		currentChecklist,
	} = useChecklistStore();

	const { isLoading, error } = useChecklistDetail(checklistId || '');

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
	const isUpdating = updating || creating || deleting;

	// Sync state when data loads
	useEffect(() => {
		if (currentChecklist) {
			setName(currentChecklist.name);
			setDescription(currentChecklist.description ?? '');

			// Add default acceptance for items
			const itemsWithAcceptance: ChecklistItem[] = (
				currentChecklist.checklistItems || []
			).map((item) => ({
				...item,
				acceptance: 'NotAvailable' as const,
			}));
			setChecklistItems(itemsWithAcceptance);
		}
	}, [currentChecklist]);

	// Validate checklist ID
	if (!checklistId || checklistId.trim() === '') {
		return (
			<div style={{ padding: '20px', textAlign: 'center' }}>
				<Typography.Text type="danger">
					Invalid or missing checklist ID
				</Typography.Text>
			</div>
		);
	}

	const handleAddItem = async () => {
		// Temporary disable API call to fix the auto-POST issue
		// TODO: Re-enable when backend supports POST /checklist-items
		const newItem: ChecklistItem = {
			id: `temp_${Date.now()}`,
			name: '',
			description: '',
			isRequired: false,
			checklistId: checklistId,
			createdAt: new Date(),
			updatedAt: new Date(),
			acceptance: 'NotAvailable' as const,
		};
		setChecklistItems((prev) => [...prev, newItem]);

		// const newItemData = {
		// 	name: '',
		// 	description: '',
		// 	isRequired: false,
		// 	checklistId: checklistId,
		// };
		// const success = await createChecklistItem(newItemData);
		// if (!success) {
		// 	showNotification.error('Failed to add item');
		// }
	};

	const handleDeleteItem = async (item: ChecklistItem) => {
		// Always remove from local state for now
		setChecklistItems((prev) => prev.filter((i) => i.id !== item.id));

		// Only call API for real items (not temp ones)
		if (!item.id.startsWith('temp_')) {
			// TODO: Re-enable when backend API is stable
			// const success = await deleteChecklistItem(item.id);
			// if (!success) {
			// 	showNotification.error('Failed to delete item');
			// }
		}
	};

	const handleChangeField = (
		id: string,
		field: keyof ChecklistItem,
		value: string | boolean,
	) => {
		setChecklistItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
		);
	};

	const handleSave = async () => {
		let errorMsg = '';
		try {
			// 1. Update checklist basic info
			const checklistUpdateSuccess = await updateChecklist(checklistId, {
				name,
				description,
				milestoneId: currentChecklist?.milestoneId,
			});

			if (!checklistUpdateSuccess) {
				errorMsg = 'Failed to update checklist';
			}
			if (!errorMsg) {
				// 2. Update checklist items (only existing items, not temp ones)
				const existingItems = checklistItems.filter(
					(item) => !item.id.startsWith('temp_'),
				);
				if (existingItems.length > 0) {
					const itemsPayload = existingItems.map(
						({ id, name, description, isRequired }) => ({
							id,
							name,
							description: description || '',
							isRequired,
						}),
					);

					const itemsUpdateSuccess = await updateChecklistItems(
						checklistId,
						itemsPayload,
					);

					if (!itemsUpdateSuccess) {
						errorMsg = 'Failed to update checklist items';
					}
				}
			}
			if (!errorMsg) {
				showNotification.success('Checklist updated successfully!');
				// Navigate back to checklist management
				navigateWithLoading('/lecturer/checklist-management');
			} else {
				showNotification.error(errorMsg);
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : 'Update failed';
			showNotification.error(errorMessage);
		}
	};

	const handleBack = () => {
		navigateWithLoading('/lecturer/checklist-management');
	};

	if (isLoading) {
		return <Typography.Text>Loading checklist...</Typography.Text>;
	}

	if (error) {
		return (
			<Typography.Text type="danger">Error: {error.message}</Typography.Text>
		);
	}

	if (!currentChecklist) {
		return <Typography.Text type="danger">Checklist not found</Typography.Text>;
	}

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Edit Checklist"
				description="Update checklist content, including name, description, and required evaluation items."
				badgeText="Moderator Only"
			/>

			<ChecklistInfoCard
				name={name}
				description={description}
				milestone={currentChecklist.milestone?.name}
				editable
				onNameChange={setName}
				onDescriptionChange={setDescription}
			/>

			<Card
				title="Checklist Items"
				extra={
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={handleAddItem}
						loading={creating}
						disabled={isUpdating}
					>
						Add New Item
					</Button>
				}
			>
				<ChecklistItemsTable
					items={checklistItems}
					editable
					onDelete={handleDeleteItem}
					onChangeField={handleChangeField}
				/>
			</Card>

			<Row justify="end">
				<Space>
					<Button onClick={handleBack} disabled={isUpdating}>
						Back
					</Button>
					<Button type="primary" onClick={handleSave} loading={isUpdating}>
						Save Checklist
					</Button>
				</Space>
			</Row>
		</Space>
	);
}
