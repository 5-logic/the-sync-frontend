'use client';

import { Button, Card, Row, Space, Typography } from 'antd';
import { useParams } from 'next/navigation';

import { Header } from '@/components/common/Header';
import {
	CardLoadingSkeleton,
	TableLoadingSkeleton,
} from '@/components/common/loading';
import ChecklistInfoCard from '@/components/features/lecturer/ChecklistDetail/ChecklistInfoCard';
import ChecklistItemsTable from '@/components/features/lecturer/ChecklistDetail/ChecklistItemTable';
import { useChecklistDetail } from '@/hooks/checklist/useChecklistDetail';
import { useNavigationLoader } from '@/hooks/ux/useNavigationLoader';
import { ChecklistItem } from '@/schemas/checklist';

export default function ChecklistDetailPage() {
	const params = useParams();
	const checklistId = params?.id as string;
	const { navigateWithLoading } = useNavigationLoader();

	const { checklist, isLoading, error } = useChecklistDetail(checklistId || '');

	const handleBack = () => {
		navigateWithLoading('/lecturer/checklist-management');
	};

	const handleEdit = () => {
		navigateWithLoading(`/lecturer/checklist-management/${checklistId}/edit`);
	};

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

	if (isLoading) {
		return (
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Header
					title="Checklist Detail"
					description="Inspect checklist content for a specific milestone and semester, including required fields and criteria."
					badgeText="Moderator Only"
				/>

				<CardLoadingSkeleton />

				<Card title="Checklist Items">
					<TableLoadingSkeleton />
				</Card>

				<Row justify="end">
					<Space size="middle">
						<Button disabled>Back</Button>
						<Button type="primary" disabled>
							Edit
						</Button>
					</Space>
				</Row>
			</Space>
		);
	}

	if (error) {
		return (
			<Typography.Text type="danger">Error: {error.message}</Typography.Text>
		);
	}

	if (!checklist) {
		return <Typography.Text type="danger">Checklist not found</Typography.Text>;
	}

	// Get checklist items from the API response and add default acceptance
	const checklistItems: ChecklistItem[] = (checklist.checklistItems || []).map(
		(item) => ({
			...item,
			acceptance: 'NotAvailable' as const,
		}),
	);

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Checklist Detail"
				description="Inspect checklist content for a specific milestone and semester, including required fields and criteria."
				badgeText="Moderator Only"
			/>

			<ChecklistInfoCard
				name={checklist.name}
				description={checklist.description ?? undefined}
				milestone={checklist.milestone?.name}
			/>

			<Card title="Checklist Items">
				<ChecklistItemsTable items={checklistItems} />
			</Card>
			<Row justify="end">
				<Space size="middle">
					{' '}
					<Button onClick={handleBack}>Back</Button>
					<Button type="primary" onClick={handleEdit}>
						Edit
					</Button>
				</Space>
			</Row>
		</Space>
	);
}
