'use client';

import { Button, Input, Radio, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

import { mockChecklistByPhase } from '@/data/checklist';
import { ChecklistReviewAcceptance } from '@/schemas/_enums';
import { ChecklistItem } from '@/schemas/checklist';

interface Props {
	readonly phase: string;
}

interface ChecklistResponse {
	response?: ChecklistReviewAcceptance;
	notes?: string;
}

const priorityColorMap = {
	Mandatory: 'red',
	Optional: 'blue',
};

export default function ReviewChecklistTable({ phase }: Props) {
	const checklist: ChecklistItem[] = useMemo(
		() => mockChecklistByPhase[phase] || [],
		[phase],
	);

	const [answers, setAnswers] = useState<Record<string, ChecklistResponse>>({});

	const handleResponseChange = (
		id: string,
		value: ChecklistReviewAcceptance,
	) => {
		setAnswers((prev) => ({
			...prev,
			[id]: { ...prev[id], response: value },
		}));
	};

	const handleNotesChange = (id: string, value: string) => {
		setAnswers((prev) => ({
			...prev,
			[id]: { ...prev[id], notes: value },
		}));
	};

	const handleSaveChecklist = () => {
		console.log('Checklist saved:', answers);
		// Bạn có thể thay console.log bằng API call hoặc callback truyền từ props
	};

	const columns: ColumnsType<ChecklistItem> = [
		{
			title: 'Question',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Response',
			key: 'response',
			render: (_value, record) => (
				<Radio.Group
					value={answers[record.id]?.response}
					onChange={(e) => handleResponseChange(record.id, e.target.value)}
				>
					<Radio value="Yes">Yes</Radio>
					<Radio value="No">No</Radio>
					<Radio value="NotAvailable">N/A</Radio>
				</Radio.Group>
			),
		},
		{
			title: 'Notes',
			key: 'notes',
			render: (_value, record) => (
				<Input
					placeholder="Add notes..."
					value={answers[record.id]?.notes}
					onChange={(e) => handleNotesChange(record.id, e.target.value)}
				/>
			),
		},
		{
			title: 'Priority',
			key: 'priority',
			render: (_value, record) => {
				const label = record.isRequired ? 'Mandatory' : 'Optional';
				const color = priorityColorMap[label];
				return <Tag color={color}>{label}</Tag>;
			},
		},
	];

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Table
				rowKey="id"
				dataSource={checklist}
				columns={columns}
				pagination={false}
			/>
			<div style={{ textAlign: 'end' }}>
				<Button type="primary" onClick={handleSaveChecklist}>
					Save Checklist
				</Button>
			</div>
		</Space>
	);
}
