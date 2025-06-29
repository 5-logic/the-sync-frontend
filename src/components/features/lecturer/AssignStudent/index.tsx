'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Space, TableProps, Tooltip } from 'antd';
import { useMemo, useState } from 'react';

import StudentFilterBar from '@/components/features/lecturer/AssignStudent/StudentFilterBar';
import StudentTable from '@/components/features/lecturer/AssignStudent/StudentTable';
import GroupOverviewTable from '@/components/features/lecturer/AssignSupervisor/GroupOverviewTable';
import GroupSearchBar from '@/components/features/lecturer/AssignSupervisor/GroupSearchBar';
import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import { baseColumns as supervisorBaseColumns } from '@/components/features/lecturer/AssignSupervisor/SupervisorColumns';
import { ExtendedGroup, extendedGroups } from '@/data/group';
import { mockStudents } from '@/data/student';

export default function AssignStudentPage() {
	const [groupSearch, setGroupSearch] = useState('');
	const [sortedInfo, setSortedInfo] = useState<{
		columnKey: string;
		order: 'ascend' | 'descend' | null;
	}>({
		columnKey: 'members',
		order: 'ascend',
	});

	const filteredData = useMemo(() => {
		const searchText = groupSearch.toLowerCase();
		return extendedGroups.filter((item) =>
			[item.name, item.thesisTitle].some((field) =>
				field.toLowerCase().includes(searchText),
			),
		);
	}, [groupSearch]);

	const [studentSearch, setStudentSearch] = useState('');
	const [studentMajor, setStudentMajor] = useState('All');
	const [studentStatus, setStudentStatus] = useState<
		'All' | 'InGroup' | 'NoGroup'
	>('All');

	const majorOptions = useMemo(() => {
		const majors = mockStudents.map((s) => s.majorId);
		return Array.from(new Set(majors));
	}, []);

	const filteredStudents = useMemo(() => {
		return mockStudents.filter((student) => {
			const fullNameMatch = student.fullName
				.toLowerCase()
				.includes(studentSearch.toLowerCase());
			const emailMatch = student.email
				.toLowerCase()
				.includes(studentSearch.toLowerCase());
			const matchSearch = fullNameMatch || emailMatch;
			const matchMajor =
				studentMajor === 'All' || student.majorId === studentMajor;
			const matchStatus =
				studentStatus === 'All' ||
				(studentStatus === 'InGroup' && student.isActive) ||
				(studentStatus === 'NoGroup' && !student.isActive);
			return matchSearch && matchMajor && matchStatus;
		});
	}, [studentSearch, studentMajor, studentStatus]);

	const handleTableChange: TableProps<ExtendedGroup>['onChange'] = (
		_,
		__,
		sorter,
	) => {
		if (!Array.isArray(sorter)) {
			setSortedInfo({
				columnKey: sorter.columnKey as string,
				order: sorter.order ?? null,
			});
		}
	};

	const groupColumns = useMemo(() => {
		return [
			...supervisorBaseColumns.map((col) => {
				if (!('dataIndex' in col)) return col;
				if (col.dataIndex === 'members') {
					return {
						...col,
						sortOrder:
							sortedInfo.columnKey === 'members' ? sortedInfo.order : null,
					};
				}
				return col;
			}),
			{
				title: 'Action',
				key: 'action',
				render: (_: unknown, record: ExtendedGroup) => (
					<Tooltip title="View detail">
						<Button
							type="link"
							icon={<EyeOutlined />}
							onClick={() => console.log('View group:', record)}
						/>
					</Tooltip>
				),
			},
		];
	}, [sortedInfo]);

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Assign Student"
				description="Manage student assignments for thesis groups"
				badgeText="Moderator Only"
			/>

			<Card title="Thesis Groups">
				<div style={{ marginBottom: 16 }}>
					<GroupSearchBar value={groupSearch} onChange={setGroupSearch} />
				</div>
				<GroupOverviewTable
					data={filteredData}
					columns={groupColumns}
					onChange={handleTableChange}
				/>
			</Card>

			<Card title="Student List">
				<StudentFilterBar
					search={studentSearch}
					onSearchChange={setStudentSearch}
					major={studentMajor}
					onMajorChange={setStudentMajor}
					status={studentStatus}
					onStatusChange={(val: string) =>
						setStudentStatus(val as 'All' | 'InGroup' | 'NoGroup')
					}
					majorOptions={majorOptions}
				/>
				<StudentTable data={filteredStudents} />
			</Card>
		</Space>
	);
}
