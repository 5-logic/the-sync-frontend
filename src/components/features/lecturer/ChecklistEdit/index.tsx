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
		fetchChecklists,
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

	// Sync state when data loads - separate from editing logic
	useEffect(() => {
		if (!currentChecklist) return;

		// Always update basic info from server data
		setName(currentChecklist.name);
		setDescription(currentChecklist.description ?? '');
		setMilestoneId(currentChecklist.milestoneId || '');

		// Process checklist items efficiently
		const serverItems: ChecklistItem[] = (
			currentChecklist.checklistItems || []
		).map((item) => ({
			...item,
			acceptance: 'NotAvailable' as const,
		}));

		// Use Map for O(1) deduplication
		const uniqueItemsMap = new Map<string, ChecklistItem>();
		serverItems.forEach((item) => {
			uniqueItemsMap.set(item.id, item);
		});

		setChecklistItems((prevItems) => {
			// If we're currently saving, preserve the current state to avoid UI glitches
			if (isSaving) {
				return prevItems;
			}

			// Preserve temporary items (user is adding new items)
			const tempItems = prevItems.filter((item) => item.id.startsWith('temp-'));

			// Merge server items with preserved temp items
			const finalItems = [...Array.from(uniqueItemsMap.values()), ...tempItems];

			// Only update if there's actual difference to prevent unnecessary re-renders
			if (
				finalItems.length !== prevItems.length ||
				!finalItems.every((item, index) => prevItems[index]?.id === item.id)
			) {
				return finalItems;
			}

			return prevItems;
		});
	}, [currentChecklist, isSaving]);

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

	// Optimized memoized change detection with stable references
	const detectChanges = useCallback(() => {
		if (!currentChecklist) {
			return {
				hasBasicChanges: false,
				hasExistingItemChanges: false,
				hasDeletedItems: false,
				hasNewItems: false,
				hasAnyChanges: false,
				existingItems: [],
				temporaryItems: [],
				originalItems: [],
			};
		}

		const originalItems = currentChecklist.checklistItems || [];

		// Use single pass to separate items for better performance
		const temporaryItems: ChecklistItem[] = [];
		const existingItems: ChecklistItem[] = [];

		for (const item of checklistItems) {
			if (item.id.startsWith('temp-')) {
				temporaryItems.push(item);
			} else {
				existingItems.push(item);
			}
		}

		// Check basic info changes (early return optimization)
		const hasBasicChanges = Boolean(
			name !== currentChecklist.name ||
				description !== (currentChecklist.description || '') ||
				milestoneId !== currentChecklist.milestoneId,
		);

		// Check for new items (early check)
		const hasNewItems = temporaryItems.length > 0;

		// Build maps for efficient lookups
		const originalItemsMap = new Map(
			originalItems.map((item) => [item.id, item]),
		);
		const existingItemIds = new Set(existingItems.map((item) => item.id));

		// Check existing items for changes with early termination
		let hasExistingItemChanges = false;
		for (const item of existingItems) {
			const original = originalItemsMap.get(item.id);
			if (!original || hasItemChanged(original, item)) {
				hasExistingItemChanges = true;
				break;
			}
		}

		// Check for deleted items with early termination
		let hasDeletedItems = false;
		for (const orig of originalItems) {
			if (!existingItemIds.has(orig.id)) {
				hasDeletedItems = true;
				break;
			}
		}

		const hasAnyChanges =
			hasBasicChanges ||
			hasExistingItemChanges ||
			hasDeletedItems ||
			hasNewItems;

		return {
			hasBasicChanges,
			hasExistingItemChanges,
			hasDeletedItems,
			hasNewItems,
			hasAnyChanges,
			existingItems,
			temporaryItems,
			originalItems,
		};
	}, [
		checklistItems,
		currentChecklist,
		name,
		description,
		milestoneId,
		hasItemChanged,
	]);

	// Track changes to enable/disable save button and show warnings
	useEffect(() => {
		// Don't recalculate changes while saving to prevent UI glitches
		if (isSaving) return;

		const changes = detectChanges();
		setHasUnsavedChanges(changes.hasAnyChanges);
	}, [detectChanges, isSaving]);

	// Event handlers - defined before early returns for proper hook order
	const handleAddItem = useCallback(() => {
		// Don't add items while saving to prevent UI glitches
		if (isSaving) return;

		// Generate a unique temporary ID using crypto.randomUUID for better randomness
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
	}, [checklistId, isSaving]);

	const handleChangeField = useCallback(
		(id: string, field: keyof ChecklistItem, value: string | boolean) => {
			// Don't update fields while saving to prevent UI glitches
			if (isSaving) return;

			setChecklistItems((prev) =>
				prev.map((item) =>
					item.id === id ? { ...item, [field]: value } : item,
				),
			);
		},
		[isSaving],
	);

	const handleConfirmedDelete = useCallback(
		async (itemId: string) => {
			try {
				const success = await deleteChecklistItem(itemId);
				if (!success) {
					showNotification.error(
						'Delete Failed',
						'Failed to delete checklist item',
					);
					return;
				}

				// Update local state immediately for better UX
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
		},
		[deleteChecklistItem],
	);

	const handleDeleteItem = useCallback(
		async (item: ChecklistItem) => {
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
		},
		[handleConfirmedDelete],
	);

	const handleBack = useCallback(() => {
		navigateWithLoading('/lecturer/checklist-management');
	}, [navigateWithLoading]);

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
	): Promise<boolean> => {
		if (!changes.hasBasicChanges) return true;

		const success = await updateChecklist(checklistId, {
			name,
			description,
			milestoneId,
		});

		if (!success) {
			throw new Error('Failed to update checklist basic information');
		}

		return true;
	};

	const createNewItems = async (
		changes: ReturnType<typeof detectChanges>,
	): Promise<ChecklistItem[]> => {
		if (!changes.hasNewItems || changes.temporaryItems.length === 0) {
			return [];
		}

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
			throw new Error('Failed to create new checklist items');
		}

		// Don't update local state here - let the final refresh handle it
		// This prevents duplicate items and UI glitches during save process
		return createdItems;
	};

	const updateExistingItems = async (
		changes: ReturnType<typeof detectChanges>,
	): Promise<boolean> => {
		if (!changes.hasExistingItemChanges || changes.existingItems.length === 0) {
			return true;
		}

		const existingItemsPayload = changes.existingItems.map(
			({ id, name, description, isRequired }) => ({
				id,
				name,
				description: description || '',
				isRequired,
			}),
		);

		const success = await updateChecklistItems(
			checklistId,
			existingItemsPayload,
		);

		if (!success) {
			throw new Error('Failed to update existing checklist items');
		}

		return true;
	};

	const handleSave = async () => {
		setIsSaving(true);

		try {
			// Validate form data first
			if (!validateFormData()) {
				return;
			}

			// Get changes once to avoid multiple calculations
			const changes = detectChanges();
			if (!changes.hasAnyChanges) {
				showNotification.info('No Changes', 'No changes detected to save');
				return;
			}

			// Batch operations for better performance and UX
			const operations: Promise<boolean | ChecklistItem[]>[] = [];

			// 1. Update basic info if needed
			if (changes.hasBasicChanges) {
				operations.push(updateBasicInfo(changes));
			}

			// 2. Update existing items if needed
			if (changes.hasExistingItemChanges) {
				operations.push(updateExistingItems(changes));
			}

			// 3. Create new items if needed
			if (changes.hasNewItems) {
				operations.push(createNewItems(changes));
			}

			// Execute all operations in parallel for better performance
			await Promise.all(operations);

			// Success feedback
			showNotification.success('Success', 'Checklist updated successfully');

			// Force refresh checklists to ensure data consistency
			fetchChecklists(true);

			// Navigate immediately after success without cleaning up state
			// This prevents UI glitches from state updates during navigation
			navigateWithLoading('/lecturer/checklist-management');
		} catch (error: unknown) {
			console.error('Save error:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Update failed';
			showNotification.error('Error', errorMessage);
		} finally {
			setIsSaving(false);
		}
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
