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
		createChecklistItem,
		deleteChecklistItem,
		updating,
		creating,
		deleting,
		currentChecklist,
	} = useChecklistStore();

	const { isLoading, error } = useChecklistDetail(checklistId || '');

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const isUpdating = updating || creating || deleting || isSaving;

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
		// Create a temporary item with temp_ prefix for immediate UI feedback
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
	};

	const handleDeleteItem = async (item: ChecklistItem) => {
		// Always remove from local state for now
		setChecklistItems((prev) => prev.filter((i) => i.id !== item.id));

		// Only call API for real items (not temp ones)
		if (!item.id.startsWith('temp_')) {
			const success = await deleteChecklistItem(item.id);
			if (!success) {
				showNotification.error('Failed to delete item');
				// Restore item if API call failed
				setChecklistItems((prev) => [...prev, item]);
			}
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
		let hasChanges = false;
		setIsSaving(true);

		try {
			// Validate all items have names
			const invalidItems = checklistItems.filter((item) => !item.name.trim());
			if (invalidItems.length > 0) {
				showNotification.warning('Please fill in all item names before saving');
				setIsSaving(false);
				return;
			}

			// Check if basic info has changed
			const hasBasicInfoChanged =
				name !== currentChecklist?.name ||
				description !== (currentChecklist?.description || '');

			// 1. Update checklist basic info if changed
			if (hasBasicInfoChanged) {
				hasChanges = true;
				const checklistUpdateSuccess = await updateChecklist(checklistId, {
					name,
					description,
					milestoneId: currentChecklist?.milestoneId,
				});

				if (!checklistUpdateSuccess) {
					errorMsg = 'Failed to update checklist';
				}
			}

			if (!errorMsg) {
				// 2. Handle items - separate new items from existing items
				const originalItems = currentChecklist?.checklistItems || [];
				const existingItems = checklistItems.filter(
					(item) => !item.id.startsWith('temp_'),
				);
				const newItems = checklistItems.filter((item) =>
					item.id.startsWith('temp_'),
				);

				// Check if there are any changes in existing items
				const hasExistingItemChanges = existingItems.some((item) => {
					const original = originalItems.find((orig) => orig.id === item.id);
					return (
						!original ||
						original.name !== item.name ||
						original.description !== item.description ||
						original.isRequired !== item.isRequired
					);
				});

				const hasNewItems = newItems.length > 0;
				const hasDeletedItems = originalItems.length > existingItems.length;

				if (hasExistingItemChanges || hasNewItems || hasDeletedItems) {
					hasChanges = true;
					console.log('Items changes detected:', {
						existingChanges: hasExistingItemChanges,
						newItems: newItems.length,
						deletedItems: hasDeletedItems,
					});

					// First update existing items if there are changes
					if (hasExistingItemChanges && existingItems.length > 0) {
						const existingItemsPayload = existingItems.map(
							({ id, name, description, isRequired }) => ({
								id,
								name,
								description: description || '',
								isRequired,
							}),
						);

						const existingItemsUpdateSuccess = await updateChecklistItems(
							checklistId,
							existingItemsPayload,
						);

						if (!existingItemsUpdateSuccess) {
							errorMsg = 'Failed to update existing checklist items';
						}
					}

					// For new items, try to create them individually
					// If the endpoint doesn't exist, we'll show a warning but continue
					if (!errorMsg && newItems.length > 0) {
						console.log('Attempting to create new items:', newItems.length);

						let newItemsCreated = 0;
						for (const item of newItems) {
							const newItemData = {
								name: item.name,
								description: item.description || '',
								isRequired: item.isRequired,
								checklistId: checklistId,
							};

							try {
								const success = await createChecklistItem(newItemData);
								if (success) {
									newItemsCreated++;
								}
							} catch (error) {
								console.warn('Failed to create item:', item.name, error);
								// Continue with other items, don't break the entire operation
							}
						}

						if (newItemsCreated > 0) {
							console.log(`Successfully created ${newItemsCreated} new items`);
						}

						if (newItemsCreated < newItems.length) {
							// Some items failed to create
							const failedCount = newItems.length - newItemsCreated;
							showNotification.warning(
								`${failedCount} new items could not be created. This might be due to missing backend endpoints.`,
							);
						}
					}
				}
			}

			if (!errorMsg) {
				if (hasChanges) {
					showNotification.success('Checklist updated successfully!');
				} else {
					showNotification.info('No changes detected');
				}
				// Navigate back to checklist management
				navigateWithLoading('/lecturer/checklist-management');
			} else {
				showNotification.error(errorMsg);
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : 'Update failed';
			showNotification.error(errorMessage);
		} finally {
			setIsSaving(false);
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
