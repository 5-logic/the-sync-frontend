'use client';

import { Card, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import GroupAssignTable from '@/components/features/lecturer/AssignStudent/GroupAssignTable';
import StudentFilterBar from '@/components/features/lecturer/AssignStudent/StudentFilterBar';
import StudentTable from '@/components/features/lecturer/AssignStudent/StudentTable';
import { useMajorStore } from '@/store/useMajorStore';
import { useSemesterStore } from '@/store/useSemesterStore';
import { useStudentStore } from '@/store/useStudentStore';

export default function AssignStudentPage() {
	const { students, fetchStudentsWithoutGroup, loading } = useStudentStore();
	const { majors, fetchMajors, loading: majorLoading } = useMajorStore();
	const { semesters, fetchSemesters } = useSemesterStore();

	const [studentSearch, setStudentSearch] = useState('');
	const [studentMajor, setStudentMajor] = useState('All');

	// Find preparing semester
	const preparingSemester = useMemo(() => {
		return semesters.find((semester) => semester.status === 'Preparing');
	}, [semesters]);

	// Fetch data on component mount
	useEffect(() => {
		const initializeData = async () => {
			// Fetch semesters first to find preparing semester
			await fetchSemesters();
			// Fetch majors for filter
			await fetchMajors();
		};

		initializeData();
	}, [fetchSemesters, fetchMajors]);

	// Fetch students when preparing semester is found
	useEffect(() => {
		if (preparingSemester) {
			fetchStudentsWithoutGroup(preparingSemester.id);
		}
	}, [preparingSemester, fetchStudentsWithoutGroup]);

	// Handle refresh
	const handleRefresh = () => {
		if (preparingSemester) {
			fetchStudentsWithoutGroup(preparingSemester.id);
		}
	};

	// Major options for filter (with names displayed)
	const majorOptions = useMemo(() => {
		const options = ['All'];
		majors.forEach((major) => {
			options.push(major.id);
		});
		return options;
	}, [majors]);

	// Create a mapping for major names
	const majorNamesMap = useMemo(() => {
		const map: Record<string, string> = { All: 'All' };
		majors.forEach((major) => {
			map[major.id] = major.name;
		});
		return map;
	}, [majors]);

	// Filtered students
	const filteredStudents = useMemo(() => {
		return students.filter((student) => {
			const fullNameMatch = student.fullName
				.toLowerCase()
				.includes(studentSearch.toLowerCase());
			const emailMatch = student.email
				.toLowerCase()
				.includes(studentSearch.toLowerCase());
			const matchSearch = fullNameMatch || emailMatch;
			const matchMajor =
				studentMajor === 'All' || student.majorId === studentMajor;
			return matchSearch && matchMajor;
		});
	}, [students, studentSearch, studentMajor]);

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Assign Student"
				description="Manage student assignments for thesis groups"
				badgeText="Moderator Only"
			/>

			<GroupAssignTable onView={(group) => console.log('View group:', group)} />

			<Card title="Ungrouped Students">
				<div style={{ marginBottom: 16 }}>
					<StudentFilterBar
						search={studentSearch}
						onSearchChange={setStudentSearch}
						major={studentMajor}
						onMajorChange={setStudentMajor}
						majorOptions={majorOptions}
						majorNamesMap={majorNamesMap}
						onRefresh={handleRefresh}
						loading={loading}
					/>
				</div>
				<StudentTable
					data={filteredStudents}
					majorNamesMap={majorNamesMap}
					loading={loading || majorLoading}
				/>
			</Card>
		</Space>
	);
}
