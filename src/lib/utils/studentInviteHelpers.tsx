import React from 'react';

import type { Student } from '@/schemas/student';

/**
 * Common helper functions for student invite components to reduce code duplication
 */

// Helper for creating AutoComplete options
export function createStudentAutoCompleteOptions(
	searchResults: Student[],
	currentUserId: string | undefined,
	members: Student[],
	searchText: string,
	excludeUserIds: string[] = [],
) {
	if (!searchText.trim() || searchResults.length === 0) return [];

	return searchResults
		.filter((student) => {
			// Exclude current logged-in student
			if (currentUserId && student.id === currentUserId) {
				return false;
			}
			// Exclude users from excludeUserIds list if provided
			if (excludeUserIds.length > 0 && excludeUserIds.includes(student.id)) {
				return false;
			}
			return true;
		})
		.map((student) => {
			const isAlreadyAdded = members.some((member) => member.id === student.id);
			return {
				value: student.id,
				label: createStudentOptionLabel(student, isAlreadyAdded),
				disabled: isAlreadyAdded,
				student,
			};
		});
}

// Helper for creating option label JSX
function createStudentOptionLabel(student: Student, isAlreadyAdded: boolean) {
	return (
		<div style={{ opacity: isAlreadyAdded ? 0.6 : 1 }}>
			<div
				style={{
					fontWeight: 500,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<span>{student.fullName}</span>
				{isAlreadyAdded && (
					<span style={{ fontSize: '12px', color: '#999' }}>Already added</span>
				)}
			</div>
			<div style={{ fontSize: '12px', color: '#666' }}>
				{student.studentCode} • {student.email}
			</div>
		</div>
	);
}

// Helper for common student select handler
export function createStudentSelectHandler(
	students: Student[],
	handleAddMember: (student: Student) => void,
) {
	return (value: string) => {
		const selectedStudent = students.find((s) => s.id === value);
		if (selectedStudent) {
			handleAddMember(selectedStudent);
		}
	};
}

// Helper for common remove member handler
export function createRemoveMemberHandler(
	members: Student[],
	onMembersChange: (members: Student[]) => void,
	showNotification: { success: (message: string) => void },
) {
	return (memberId: string) => {
		const updatedMembers = members.filter((m) => m.id !== memberId);
		onMembersChange(updatedMembers);
		showNotification.success('Member removed successfully!');
	};
}
