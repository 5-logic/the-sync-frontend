'use client';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';

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
	function onCreateThesis(): void {
		throw new Error('Function not implemented.');
	}

	return (
		<Row
			gutter={[12, 12]}
			wrap
			align="middle"
			justify="start"
			style={{ marginBottom: 10 }}
		>
			<Col flex="auto" style={{ minWidth: 200 }}>
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="Search topics"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</Col>

			<Col style={{ width: 160 }}>
				<Select
					value={status}
					options={statusOptions}
					onChange={onStatusChange}
					style={{ width: '100%' }}
				/>
			</Col>

			<Col style={{ width: 160 }}>
				<Select
					allowClear
					placeholder="Semester"
					value={semester}
					onChange={onSemesterChange}
					style={{ width: '100%' }}
					options={semesterOptions.map((id) => ({
						value: id,
						label: getSemesterLabel(id),
					}))}
				/>
			</Col>

			<Col style={{ width: 160 }}>
				<Button
					icon={<PlusOutlined />}
					type="primary"
					onClick={onCreateThesis}
					style={{ width: '100%' }}
				>
					Create Thesis
				</Button>
			</Col>
		</Row>
	);
}

function getSemesterLabel(id: string) {
	const year = id.slice(0, 4);
	const term = id.slice(4);
	const termName =
		{ '1': 'Spring', '2': 'Summer', '3': 'Fall' }[term] || 'Unknown';
	return `${termName} ${year}`;
}
