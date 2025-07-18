'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Row, Space, Typography } from 'antd';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import { Header } from '@/components/common/Header';
import {
	CardLoadingSkeleton,
	TableLoadingSkeleton,
} from '@/components/common/loading';
import ChecklistInfoCard from '@/components/features/lecturer/ChecklistDetail/ChecklistInfoCard';
import ChecklistItemsTable from '@/components/features/lecturer/ChecklistDetail/ChecklistItemTable';
import { useChecklistDetail } from '@/hooks/checklist/useChecklistDetail';
import { useNavigationLoader } from '@/hooks/ux/useNavigationLoader';
import { showNotification } from '@/lib/utils/notification';
import { ChecklistItem } from '@/schemas/checklist';
import { useChecklistStore } from '@/store';
import { useMilestoneStore } from '@/store/useMilestoneStore';

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
	const { milestones, fetchMilestones } = useMilestoneStore();

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [milestoneId, setMilestoneId] = useState('');
	const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const isUpdating = updating || creating || deleting || isSaving;

	// Fetch milestones on mount
	useEffect(() => {
		fetchMilestones();
	}, [fetchMilestones]);

	// Sync state when data loads
	useEffect(() => {
		if (currentChecklist) {
			setName(currentChecklist.name);
			setDescription(currentChecklist.description ?? '');
			setMilestoneId(currentChecklist.milestoneId || '');

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

	// Helper function to check if basic info has changed
	const hasBasicInfoChanged = useCallback(() => {
		return (
			name !== currentChecklist?.name ||
			description !== (currentChecklist?.description || '') ||
			milestoneId !== currentChecklist?.milestoneId
		);
	}, [name, description, milestoneId, currentChecklist]);

	// Helper function to check if two items are different (only compare relevant fields)
	const hasItemChanged = useCallback(
		(
			original: {
				name: string;
				description?: string | null;
				isRequired: boolean;
			},
			current: {
				name: string;
				description?: string | null;
				isRequired: boolean;
			},
		) => {
			return (
				original.name !== current.name ||
				(original.description || '') !== (current.description || '') ||
				original.isRequired !== current.isRequired
			);
		},
		[],
	);

	// Helper function to detect all changes
	const detectChanges = useCallback(() => {
		const originalItems = currentChecklist?.checklistItems || [];

		// Separate temporary and existing items
		const temporaryItems = checklistItems.filter((item) =>
			item.id.startsWith('temp-'),
		);
		const existingItems = checklistItems.filter(
			(item) => !item.id.startsWith('temp-'),
		);

		// Check existing items for changes
		const hasExistingItemChanges = existingItems.some((item) => {
			const original = originalItems.find((orig) => orig.id === item.id);
			return !original || hasItemChanged(original, item);
		});

		// Check for deleted items (original items not in current existing items)
		const existingItemIds = existingItems.map((item) => item.id);
		const hasDeletedItems = originalItems.some(
			(orig) => !existingItemIds.includes(orig.id),
		);

		// Check if there are new items to create
		const hasNewItems = temporaryItems.length > 0;

		// Check basic info changes
		const hasBasicChanges = hasBasicInfoChanged();

		return {
			hasBasicChanges,
			hasExistingItemChanges,
			hasDeletedItems,
			hasNewItems,
			hasAnyChanges:
				hasBasicChanges ||
				hasExistingItemChanges ||
				hasDeletedItems ||
				hasNewItems,
			existingItems,
			temporaryItems,
			originalItems,
		};
	}, [checklistItems, currentChecklist, hasBasicInfoChanged, hasItemChanged]);

	// Track changes to enable/disable save button and show warnings
	useEffect(() => {
		const changes = detectChanges();
		setHasUnsavedChanges(changes.hasAnyChanges);
	}, [detectChanges]);

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

	const handleAddItem = () => {
		// Generate a temporary ID for new items using crypto.randomUUID for better uniqueness
		const tempId = `temp-${crypto.randomUUID()}`;

		const newItem: ChecklistItem = {
			id: tempId,
			name: '',
			description: '',
			isRequired: false,
			acceptance: 'NotAvailable' as const,
			checklistId: checklistId,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		setChecklistItems((prev) => [...prev, newItem]);
	};

	const handleDeleteItem = async (item: ChecklistItem) => {
		// Check if it's a temporary item (starts with 'temp-')
		const isTemporaryItem = item.id.startsWith('temp-');

		if (isTemporaryItem) {
			// For temporary items, just remove from local state
			setChecklistItems((prev) => prev.filter((i) => i.id !== item.id));
			showNotification.success('Success', 'Item removed successfully');
			return;
		}

		// Show confirmation modal for real items before deleting
		ConfirmationModal.show({
			title: 'Delete Checklist Item',
			message: 'Are you sure you want to delete this checklist item?',
			details: item.name || 'Unnamed item',
			note: 'This action cannot be undone.',
			noteType: 'danger',
			okText: 'Yes, Delete',
			cancelText: 'Cancel',
			okType: 'danger',
			onOk: () => handleConfirmedDelete(item.id),
		});
	};

	const handleConfirmedDelete = async (itemId: string) => {
		try {
			const success = await deleteChecklistItem(itemId);
			if (!success) {
				showNotification.error(
					'Delete Failed',
					'Failed to delete checklist item',
				);
				return;
			}

			// Remove from local state after successful API call
			setChecklistItems((prev) => prev.filter((i) => i.id !== itemId));
			showNotification.success(
				'Success',
				'Checklist item deleted successfully',
			);
		} catch (error) {
			console.error('Error deleting item:', error);
			showNotification.error(
				'Delete Failed',
				'Failed to delete checklist item',
			);
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

	const validateFormData = (): boolean => {
		if (!name.trim()) {
			showNotification.warning(
				'Validation Error',
				'Please enter a checklist name',
			);
			return false;
		}

		if (!milestoneId) {
			showNotification.warning('Validation Error', 'Please select a milestone');
			return false;
		}

		const invalidItems = checklistItems.filter(
			(item) => !item.name || item.name.trim() === '',
		);
		if (invalidItems.length > 0) {
			showNotification.warning(
				'Validation Error',
				'Please fill in all item names before saving',
			);
			return false;
		}

		return true;
	};

	const updateBasicInfo = async (
		changes: ReturnType<typeof detectChanges>,
	): Promise<string> => {
		if (!changes.hasBasicChanges) return '';

		const checklistUpdateSuccess = await updateChecklist(checklistId, {
			name,
			description,
			milestoneId,
		});

		return checklistUpdateSuccess
			? ''
			: 'Failed to update checklist basic information';
	};

	const createNewItems = async (
		changes: ReturnType<typeof detectChanges>,
	): Promise<string> => {
		if (!changes.hasNewItems || changes.temporaryItems.length === 0) return '';

		const newItemsPayload = changes.temporaryItems.map(
			({ name, description, isRequired }) => ({
				name,
				description: description || '',
				isRequired,
			}),
		);

		const createdItems = await createChecklistItems(
			checklistId,
			newItemsPayload,
		);

		if (!createdItems || createdItems.length === 0) {
			return 'Failed to create new checklist items';
		}

		// Update local state with real IDs from API response
		setChecklistItems((prev) => {
			const withoutTempItems = prev.filter(
				(item) => !item.id.startsWith('temp-'),
			);
			return [...withoutTempItems, ...createdItems];
		});

		return '';
	};

	const updateExistingItems = async (
		changes: ReturnType<typeof detectChanges>,
	): Promise<string> => {
		if (!changes.hasExistingItemChanges || changes.existingItems.length === 0)
			return '';

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

		return existingItemsUpdateSuccess
			? ''
			: 'Failed to update existing checklist items';
	};

	const handleSave = async () => {
		setIsSaving(true);

		try {
			// Validate form data
			if (!validateFormData()) {
				setIsSaving(false);
				return;
			}

			// Check for changes
			const changes = detectChanges();
			if (!changes.hasAnyChanges) {
				showNotification.info('No Changes', 'No changes detected to save');
				setIsSaving(false);
				return;
			}

			// Update basic info
			let errorMsg = await updateBasicInfo(changes);

			// Create new items if no error so far
			if (!errorMsg) {
				errorMsg = await createNewItems(changes);
			}

			// Update existing items if no error so far
			if (!errorMsg) {
				errorMsg = await updateExistingItems(changes);
			}

			// Handle final result
			if (!errorMsg) {
				showNotification.success('Success', 'Checklist updated successfully');
				navigateWithLoading('/lecturer/checklist-management');
			} else {
				showNotification.error('Update Failed', errorMsg);
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : 'Update failed';
			showNotification.error('Error', errorMessage);
		} finally {
			setIsSaving(false);
		}
	};

	const handleBack = () => {
		navigateWithLoading('/lecturer/checklist-management');
	};

	if (error) {
		return (
			<Typography.Text type="danger">Error: {error.message}</Typography.Text>
		);
	}

	// Show skeleton when first loading (no data yet)
	if (isLoading && !currentChecklist) {
		return (
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Header
					title="Edit Checklist"
					description="Update checklist content, including name, description, and required evaluation items."
					badgeText="Moderator Only"
				/>

				<CardLoadingSkeleton />

				<Card title="Checklist Items">
					<TableLoadingSkeleton />

					<Row justify="space-between" style={{ marginTop: 16 }}>
						<Button type="primary" disabled>
							Add New Item
						</Button>
					</Row>
				</Card>

				<Row justify="end">
					<Space>
						<Button disabled>Back</Button>
						<Button type="primary" disabled>
							Save Checklist
						</Button>
					</Space>
				</Row>
			</Space>
		);
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
				milestone={currentChecklist?.milestone?.name}
				milestoneId={milestoneId}
				editable
				loading={isLoading || isSaving}
				availableMilestones={milestones}
				onNameChange={setName}
				onDescriptionChange={setDescription}
				onMilestoneChange={setMilestoneId}
			/>

			<Card title="Checklist Items">
				<ChecklistItemsTable
					items={checklistItems}
					editable
					loading={isLoading || isUpdating}
					onDelete={handleDeleteItem}
					onChangeField={handleChangeField}
				/>

				<Row justify="space-between" style={{ marginTop: 16 }}>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={handleAddItem}
						disabled={isLoading || isUpdating}
					>
						Add New Item
					</Button>
				</Row>
			</Card>

			<Row justify="end">
				<Space>
					<Button onClick={handleBack} disabled={isLoading || isUpdating}>
						Back
					</Button>
					<Button
						type="primary"
						onClick={handleSave}
						loading={isSaving}
						disabled={isLoading || deleting || updating || !hasUnsavedChanges}
					>
						{hasUnsavedChanges ? 'Save Changes' : 'Save Checklist'}
					</Button>
				</Space>
			</Row>
		</Space>
	);
}
