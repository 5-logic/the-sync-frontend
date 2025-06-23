'use client';

import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Space } from 'antd';
import { useMemo, useState } from 'react';

import StudentFilterBar from '@/components/features/lecturer/AssignStudent/StudentFilterBar';
import StudentTable from '@/components/features/lecturer/AssignStudent/StudentTable';
import GroupOverviewTable from '@/components/features/lecturer/AssignSupervisor/GroupOverviewTable';
import Header from '@/components/features/lecturer/AssignSupervisor/Header';
import { baseColumns as supervisorBaseColumns } from '@/components/features/lecturer/AssignSupervisor/SupervisorColumns';
import { extendedGroups } from '@/data/group';
import { mockStudents } from '@/data/student';

export default function AssignStudentPage() {
	const [groupSearch] = useState('');

	const filteredGroups = useMemo(() => {
		return extendedGroups.filter((group) => {
			const searchText = groupSearch.toLowerCase();
			return (
				group.name.toLowerCase().includes(searchText) ||
				group.thesisTitle.toLowerCase().includes(searchText)
			);
		});
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
		return [
			...supervisorBaseColumns.filter((col) => col.title !== 'Status'),
			{
				title: 'Action',
				render: (_: unknown, record) => (
					<Button
						type="link"
						icon={<EyeOutlined />}
						onClick={() => console.log('View group:', record)}
					>
						View
					</Button>
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

			<Card title="Thesis Groups">
				<GroupOverviewTable data={filteredGroups} columns={groupColumns} />
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
