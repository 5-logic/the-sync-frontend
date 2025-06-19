'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Input, Select, Space } from 'antd';

interface Props {
	search: string;
	onSearchChange: (val: string) => void;
	status: 'all' | 'approved' | 'pending' | 'rejected';
	onStatusChange: (val: 'all' | 'approved' | 'pending' | 'rejected') => void;
	semester?: string;
	onSemesterChange: (val?: string) => void;
	semesterOptions: string[];
}

const statusOptions = [
	{ value: 'all', label: 'All Status' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'pending', label: 'Pending' },
	{ value: 'rejected', label: 'Rejected' },
];

export default function ThesisFilterBar({
	search,
	onSearchChange,
	status,
	onStatusChange,
	semester,
	onSemesterChange,
	semesterOptions,
}: Props) {
	return (
		<Space
			wrap
			style={{
				marginBottom: 16,
				width: '100%',
				justifyContent: 'space-between',
			}}
		>
			<Input
				allowClear
				prefix={<SearchOutlined />}
				placeholder="Search topics"
				value={search}
				onChange={(e) => onSearchChange(e.target.value)}
				style={{ width: 240 }}
			/>

			<Space wrap>
				<Select
					value={status}
					options={statusOptions}
					onChange={onStatusChange}
					style={{ width: 140 }}
				/>

				<Select
					allowClear
					placeholder="Semester"
					value={semester}
					onChange={onSemesterChange}
					style={{ width: 160 }}
					options={semesterOptions.map((id) => ({
						value: id,
						label: getSemesterLabel(id),
					}))}
				/>
			</Space>
		</Space>
	);
}

function getSemesterLabel(id: string) {
	const year = id.slice(0, 4);
	const term = id.slice(4);
	const termName =
		{ '1': 'Spring', '2': 'Summer', '3': 'Fall' }[term] || 'Unknown';
	return `${termName} ${year}`;
}
