'use client';

import { Card, Space } from 'antd';
import { useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import GroupAssignTable from '@/components/features/lecturer/AssignStudent/GroupAssignTable';
import StudentFilterBar from '@/components/features/lecturer/AssignStudent/StudentFilterBar';
import StudentTable from '@/components/features/lecturer/AssignStudent/StudentTable';
import GroupSearchBar from '@/components/features/lecturer/AssignSupervisor/GroupSearchBar';
import { extendedGroups } from '@/data/group';
import { mockStudents } from '@/data/student';

export default function AssignStudentPage() {
	const [groupSearch, setGroupSearch] = useState('');
	const [studentSearch, setStudentSearch] = useState('');
	const [studentMajor, setStudentMajor] = useState('All');

	const filteredGroups = useMemo(() => {
		const searchText = groupSearch.toLowerCase();
		return extendedGroups.filter((item) =>
			[item.name, item.thesisTitle].some((field) =>
				field.toLowerCase().includes(searchText),
			),
		);
	}, [groupSearch]);

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
			const matchSearch = fullNameMatch || emailMatch; //NOSONAR
			const matchMajor =
				studentMajor === 'All' || student.majorId === studentMajor;
			return matchSearch && matchMajor;
		});
	}, [studentSearch, studentMajor]);

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
				<GroupAssignTable
					data={filteredGroups}
					onView={(group) => console.log('View group:', group)}
				/>
			</Card>

			<Card title="Ungrouped Students">
				<StudentFilterBar
					search={studentSearch}
					onSearchChange={setStudentSearch}
					major={studentMajor}
					onMajorChange={setStudentMajor}
					majorOptions={majorOptions}
				/>
				<StudentTable data={filteredStudents} showOnlyUngrouped />
			</Card>
		</Space>
	);
}
