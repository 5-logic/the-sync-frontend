'use client';

import { Button, Input, Select, Space, Table, Tag } from 'antd';
import { useState } from 'react';

import { mockStudents } from '@/data/student';

const { Option } = Select;

export const StudentTable = () => {
	const [searchText, setSearchText] = useState('');
	const [selectedMajor, setSelectedMajor] = useState<string | null>(null);

	const filteredStudents = mockStudents.filter((student) => {
		const matchesSearch = student.fullName
			.toLowerCase()
			.includes(searchText.toLowerCase());
		const matchesMajor = selectedMajor
			? student.majorId === selectedMajor
			: true;
		return matchesSearch && matchesMajor;
	});

	const columns = [
		{
			title: 'Name',
			dataIndex: 'fullName',
			key: 'name',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
		},
		{
			title: 'Major',
			dataIndex: 'majorId',
			key: 'major',
		},
		{
			title: 'Skills',
			dataIndex: 'studentSkills',
			key: 'skills',
			render: (skills: { skillId: string; name: string }[]) => (
				<Space wrap>
					{skills.map((s) => (
						<Tag color="geekblue" key={s.skillId}>
							{s.name}
						</Tag>
					))}
				</Space>
			),
		},
		{
			title: 'Role',
			dataIndex: 'studentExpectedResponsibilities',
			key: 'role',
			render: (roles: { responsibilityId: string; name: string }[]) => (
				<Space wrap>
					{roles.map((r) => (
						<Tag color="green" key={r.responsibilityId}>
							{r.name}
						</Tag>
					))}
				</Space>
			),
		},

		{
			title: 'Action',
			key: 'action',
			render: () => <Button type="primary">Invite</Button>,
		},
	];

	return (
		<>
			<Space style={{ marginBottom: 16 }}>
				<Input.Search
					placeholder="Search by name"
					onSearch={(value) => setSearchText(value)}
					style={{ width: 200 }}
				/>
				<Select
					placeholder="Filter by Major"
					style={{ width: 200 }}
					allowClear
					onChange={(value) => setSelectedMajor(value)}
				>
					<Option value="SE">Software Engineering</Option>
					<Option value="AI">Artificial Intelligence</Option>
				</Select>
			</Space>
			<Table
				columns={columns}
				dataSource={filteredStudents}
				rowKey="id"
				pagination={{ pageSize: 5 }}
			/>
		</>
	);
};
