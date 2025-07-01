'use client';

import { Input, Radio, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';

interface ChecklistItem {
	question: string;
	priority: 'High' | 'Medium' | 'Low';
}

interface ChecklistResponse {
	response?: string;
	notes?: string;
}

interface Props {
	phase: string;
}

const defaultChecklist: ChecklistItem[] = [
	{ question: 'Has the code been peer reviewed?', priority: 'High' },
	{ question: 'Are all tests passing?', priority: 'High' },
	{ question: 'Is documentation updated?', priority: 'Medium' },
	{ question: 'Are there any security concerns?', priority: 'High' },
	{ question: 'Is the performance impact acceptable?', priority: 'Medium' },
	{ question: 'Have accessibility requirements been met?', priority: 'Medium' },
	{ question: 'Is the code properly commented?', priority: 'Low' },
	{ question: 'Are there any breaking changes?', priority: 'High' },
];

const mockChecklistByPhase: Record<string, ChecklistItem[]> = {
	'Submit Thesis': defaultChecklist,
	'Review 1': defaultChecklist,
	'Review 2': defaultChecklist,
	'Review 3': defaultChecklist,
	'Final Report': defaultChecklist,
};

const priorityColor = {
	High: 'red',
	Medium: 'gold',
	Low: 'blue',
};

export default function ReviewChecklistTable({ phase }: Props) {
	const checklist = useMemo(() => mockChecklistByPhase[phase] || [], [phase]);

	const [answers, setAnswers] = useState<Record<string, ChecklistResponse>>({});

	const handleResponseChange = (question: string, value: string) => {
		setAnswers((prev) => ({
			...prev,
			[question]: { ...prev[question], response: value },
		}));
	};

	const handleNotesChange = (question: string, value: string) => {
		setAnswers((prev) => ({
			...prev,
			[question]: { ...prev[question], notes: value },
		}));
	};

	const columns = [
		{
			title: 'Question',
			dataIndex: 'question',
			key: 'question',
		},
		{
			title: 'Response',
			key: 'response',
			render: (_: unknown, record: ChecklistItem) => (
				<Radio.Group
					value={answers[record.question]?.response}
					onChange={(e) =>
						handleResponseChange(record.question, e.target.value)
					}
				>
					<Radio value="yes">Yes</Radio>
					<Radio value="no">No</Radio>
					<Radio value="na">N/A</Radio>
				</Radio.Group>
			),
		},
		{
			title: 'Notes',
			key: 'notes',
			render: (_: unknown, record: ChecklistItem) => (
				<Input
					placeholder="Add notes..."
					value={answers[record.question]?.notes}
					onChange={(e) => handleNotesChange(record.question, e.target.value)}
				/>
			),
		},
		{
			title: 'Priority',
			dataIndex: 'priority',
			key: 'priority',
			render: (priority: string) => (
				<Tag color={priorityColor[priority as keyof typeof priorityColor]}>
					{priority}
				</Tag>
			),
		},
	];

	return (
		<Table
			rowKey="question"
			dataSource={checklist}
			columns={columns}
			pagination={false}
		/>
	);
}
