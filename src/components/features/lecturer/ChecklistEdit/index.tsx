'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Row, Space, Typography } from 'antd';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
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
		createChecklistItems,
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

			// Add default acceptance for items and ensure unique IDs
			const itemsWithAcceptance: ChecklistItem[] = (
				currentChecklist.checklistItems || []
			).map((item) => ({
				...item,
				acceptance: 'NotAvailable' as const,
			}));

			// Remove duplicates based on ID
			const uniqueItems = itemsWithAcceptance.filter(
				(item, index, self) =>
					index === self.findIndex((i) => i.id === item.id),
			);

			setChecklistItems(uniqueItems);
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
		try {
			// Create a real checklist item immediately via API
			const newItems = await createChecklistItems(checklistId, [
				{
					name: ' ',
					description: '',
					isRequired: false,
				},
			]);

			// The store should automatically update currentChecklist
			// Let the useEffect handle the sync instead of manually updating
			if (newItems && newItems.length > 0) {
				showNotification.success('New checklist item created successfully');
			} else {
				console.warn('No items returned from API');
				showNotification.warning('Item created but response was empty');
			}
		} catch (error) {
			console.error('Error creating checklist item:', error);
			showNotification.error('Failed to create checklist item');
		}
	};

	const handleDeleteItem = async (item: ChecklistItem) => {
		// Show confirmation modal before deleting
		ConfirmationModal.show({
			title: 'Delete Checklist Item',
			message: 'Are you sure you want to delete this checklist item?',
			details: item.name || 'Unnamed item',
			note: 'This action cannot be undone.',
			noteType: 'danger',
			okText: 'Yes, Delete',
			cancelText: 'Cancel',
			okType: 'danger',
			onOk: async () => {
				try {
					// Always call API since all items are real now
					const success = await deleteChecklistItem(item.id);
					if (!success) {
						showNotification.error('Failed to delete item');
						return;
					}

					// Remove from local state after successful API call
					setChecklistItems((prev) => prev.filter((i) => i.id !== item.id));
					showNotification.success('Checklist item deleted successfully');
				} catch (error) {
					console.error('Error deleting item:', error);
					showNotification.error('Failed to delete item');
				}
			},
		});
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

	// Helper function to check if two items are different (only compare relevant fields)
	const hasItemChanged = (
		original: {
			name: string;
			description?: string | null;
			isRequired: boolean;
		},
		current: { name: string; description?: string | null; isRequired: boolean },
	) => {
		return (
			original.name !== current.name ||
			(original.description || '') !== (current.description || '') ||
			original.isRequired !== current.isRequired
		);
	};

	// Helper function to check if basic info has changed
	const hasBasicInfoChanged = () => {
		return (
			name !== currentChecklist?.name ||
			description !== (currentChecklist?.description || '')
		);
	};

	// Helper function to detect all changes
	const detectChanges = () => {
		const originalItems = currentChecklist?.checklistItems || [];
		// All items are real now, no temp items
		const existingItems = checklistItems;

		// Check existing items for changes
		const hasExistingItemChanges = existingItems.some((item) => {
			const original = originalItems.find((orig) => orig.id === item.id);
			return !original || hasItemChanged(original, item);
		});

		// Check for deleted items
		const hasDeletedItems = originalItems.length > existingItems.length;

		// Check basic info changes
		const hasBasicChanges = hasBasicInfoChanged();

		return {
			hasBasicChanges,
			hasExistingItemChanges,
			hasDeletedItems,
			hasAnyChanges:
				hasBasicChanges || hasExistingItemChanges || hasDeletedItems,
			existingItems,
			originalItems,
		};
	};

	const handleSave = async () => {
		let errorMsg = '';
		setIsSaving(true);

		try {
			// Validate all items have meaningful names (not just whitespace)
			const invalidItems = checklistItems.filter(
				(item) => !item.name || item.name.trim() === '',
			);
			if (invalidItems.length > 0) {
				showNotification.warning('Please fill in all item names before saving');
				setIsSaving(false);
				return;
			}

			// Detect all changes
			const changes = detectChanges();

			// Early return if no changes detected
			if (!changes.hasAnyChanges) {
				showNotification.info('No changes detected');
				setIsSaving(false);
				return;
			}

			// 1. Update checklist basic info if changed
			if (changes.hasBasicChanges) {
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
				// 2. Handle existing items changes
				if (
					changes.hasExistingItemChanges &&
					changes.existingItems.length > 0
				) {
					const existingItemsPayload = changes.existingItems.map(
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

			<Card title="Checklist Items">
				<ChecklistItemsTable
					items={checklistItems}
					editable
					onDelete={handleDeleteItem}
					onChangeField={handleChangeField}
				/>

				<Row justify="space-between" style={{ marginTop: 16 }}>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={handleAddItem}
						loading={creating}
						disabled={isUpdating}
					>
						Add New Item
					</Button>
				</Row>
			</Card>

			<Row justify="end">
				<Space>
					<Button onClick={handleBack} disabled={isUpdating}>
						Back
					</Button>
					<Button
						type="primary"
						onClick={handleSave}
						loading={isSaving}
						disabled={creating || deleting || updating}
					>
						Save Checklist
					</Button>
				</Space>
			</Row>
		</Space>
	);
}
