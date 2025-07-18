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
import { ChecklistItem } from '@/schemas/checklist';

export default function ChecklistEditPage() {
	const params = useParams();
	const checklistId = params?.id as string;
	const { navigateWithLoading } = useNavigationLoader();

	const {
		checklist: originalChecklist,
		isLoading,
		error,
	} = useChecklistDetail(checklistId || '');

	const [name, setName] = useState(originalChecklist?.name ?? '');
	const [description, setDescription] = useState(
		originalChecklist?.description ?? '',
	);

	const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

	// Sync state when data loads
	useEffect(() => {
		if (originalChecklist) {
			setName(originalChecklist.name);
			setDescription(originalChecklist.description ?? '');

			// Add default acceptance for items
			const itemsWithAcceptance: ChecklistItem[] = (
				originalChecklist.checklistItems || []
			).map((item) => ({
				...item,
				acceptance: 'NotAvailable' as const,
			}));
			setChecklistItems(itemsWithAcceptance);
		}
	}, [originalChecklist]);

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
		const newItem: ChecklistItem = {
			id: Date.now().toString(),
			name: '',
			description: '',
			isRequired: false,
			checklistId: checklistId,
			createdAt: new Date(),
			updatedAt: new Date(),
			acceptance: 'Yes',
		};
		setChecklistItems((prev) => [...prev, newItem]);
	};

	const handleDeleteItem = (item: ChecklistItem) => {
		setChecklistItems((prev) => prev.filter((i) => i.id !== item.id));
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

	const handleSave = () => {
		console.log('Saving checklist...', {
			name,
			description,
			items: checklistItems,
		});
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

	if (!originalChecklist) {
		return <Typography.Text type="danger">Checklist not found</Typography.Text>;
	}

	if (!originalChecklist) {
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
				milestone={originalChecklist.milestone?.name}
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
					<Button onClick={handleBack}>Back</Button>
					<Button type="primary" onClick={handleSave}>
						Save Checklist
					</Button>
				</Space>
			</Row>
		</Space>
	);
}
