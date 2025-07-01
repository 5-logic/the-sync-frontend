'use client';

import { Input, Radio, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

import { mockChecklistByPhase } from '@/data/checklist';
import { ChecklistReviewAcceptance } from '@/schemas/_enums';
import { ChecklistItem } from '@/schemas/checklist';

interface Props {
	phase: string;
}

interface ChecklistResponse {
	response?: ChecklistReviewAcceptance;
	notes?: string;
}

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
			render: (_value, record) => (
				<Tag color={record.isRequired ? 'red' : 'blue'}>
					{record.isRequired ? 'High' : 'Optional'}
				</Tag>
			),
		},
	];

	return (
		<Table
			rowKey="id"
			dataSource={checklist}
			columns={columns}
			pagination={false}
		/>
	);
}
