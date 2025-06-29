'use client';

import { Col, Input, Row, Select } from 'antd';
import { useEffect, useState } from 'react';

interface Props {
	domains: string[];
	groupIds: string[];
	onFilterChange: (filters: {
		keyword?: string;
		domain?: string;
		group?: string;
		semester?: string;
	}) => void;
}

export default function ThesisFilterBar({
	domains,
	groupIds,
	onFilterChange,
}: Props) {
	const [keyword, setKeyword] = useState('');
	const [domain, setDomain] = useState<string | undefined>();
	const [group, setGroup] = useState<string | undefined>();
	const [semester, setSemester] = useState<string | undefined>();

	useEffect(() => {
		onFilterChange({ keyword, domain, group, semester });
	}, [keyword, domain, group, semester, onFilterChange]);

	return (
		<Row gutter={[16, 16]} className="mb-4">
			<Col xs={24} md={6}>
				<Input
					placeholder="Search thesis by name..."
					allowClear
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
				/>
			</Col>
			<Col xs={24} md={6}>
				<Select
					placeholder="Select Domain"
					allowClear
					style={{ width: '100%' }}
					value={domain}
					onChange={(val) => setDomain(val)}
				>
					{domains.map((d) => (
						<Select.Option key={d} value={d}>
							{d}
						</Select.Option>
					))}
				</Select>
			</Col>
			<Col xs={24} md={6}>
				<Select
					placeholder="Select Group"
					allowClear
					style={{ width: '100%' }}
					value={group}
					onChange={(val) => setGroup(val)}
				>
					{groupIds.map((g) => (
						<Select.Option key={g} value={g}>
							{g}
						</Select.Option>
					))}
				</Select>
			</Col>
			<Col xs={24} md={6}>
				<Select
					placeholder="Select Semester"
					allowClear
					style={{ width: '100%' }}
					value={semester}
					onChange={(val) => setSemester(val)}
				>
					<Select.Option value="Spring">Spring</Select.Option>
					<Select.Option value="Fall">Fall</Select.Option>
				</Select>
			</Col>
		</Row>
	);
}
