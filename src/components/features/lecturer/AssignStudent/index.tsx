'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Space, Tooltip } from 'antd';
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

	const filteredData = extendedGroups.filter((item) => {
		const searchText = groupSearch.toLowerCase();
		const matchesSearch = [item.name, item.thesisTitle].some((field) =>
			field.toLowerCase().includes(searchText),
		);
		return matchesSearch;
	});

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
			const matchSearch =
				student.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
				student.email.toLowerCase().includes(studentSearch.toLowerCase());

			const matchMajor =
				studentMajor === 'All' || student.majorId === studentMajor;

			const matchStatus =
				studentStatus === 'All' ||
				(studentStatus === 'InGroup' && student.isActive) ||
				(studentStatus === 'NoGroup' && !student.isActive);

			return matchSearch && matchMajor && matchStatus;
		});
	}, [studentSearch, studentMajor, studentStatus]);

	const groupColumns = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		function onView(_record: ExtendedGroup): void {
			throw new Error('Function not implemented.');
		}

		return [
			...supervisorBaseColumns.filter((col) => col.title !== 'Status'),
			{
				title: 'Action',
				render: (_: unknown, record) => (
					<Tooltip title="View detail">
						<Button
							type="link"
							icon={<EyeOutlined />}
							onClick={() => onView?.(record)}
						/>
					</Tooltip>
				),
			},
		];
	}, []);

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Assign Student"
				description="Manage student assignments for thesis groups"
				badgeText="Moderator Only"
			/>

			{/*Thesis Groups  */}
			<Card title="Thesis Groups">
				<div style={{ marginBottom: 16 }}>
					<GroupSearchBar value={groupSearch} onChange={setGroupSearch} />
				</div>

				<GroupOverviewTable data={filteredData} columns={groupColumns} />
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
