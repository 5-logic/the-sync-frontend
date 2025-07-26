import { DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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

// Helper for creating table columns configuration
export function createStudentTableColumns(
	handleRemoveMember: (memberId: string) => void,
	variant: 'create' | 'invite' = 'create',
): ColumnsType<Student> {
	const baseColumns: ColumnsType<Student> = [
		{
			title: 'Name',
			dataIndex: 'fullName',
			key: 'fullName',
			width: '30%',
			responsive: ['sm'],
		},
	];

	// Add email column with different configurations based on variant
	if (variant === 'create') {
		baseColumns.push({
			title: 'Student Code',
			dataIndex: 'studentCode',
			key: 'studentCode',
			width: '20%',
			responsive: ['md'],
		});
		baseColumns.push({
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: '35%',
			responsive: ['lg'],
			render: (email: string) => (
				<div style={{ wordBreak: 'break-word' }}>{email}</div>
			),
		});
	} else {
		// invite variant
		baseColumns.push({
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: '40%',
			ellipsis: true,
		});
		baseColumns.push({
			title: 'Student ID',
			dataIndex: 'studentCode',
			key: 'studentCode',
			width: '20%',
			responsive: ['md'],
		});
	}

	// Add action column
	baseColumns.push({
		title: 'Action',
		key: 'action',
		width: variant === 'create' ? '15%' : '10%',
		render: (_: unknown, record: Student) => (
			<Button
				type="text"
				danger
				size="small"
				icon={<DeleteOutlined />}
				onClick={() => handleRemoveMember(record.id)}
				aria-label={`Remove ${record.fullName}`}
			>
				{variant === 'create' ? 'Remove' : undefined}
			</Button>
		),
	});

	return baseColumns;
}

/**
 * Creates notFoundContent for AutoComplete components
 * Shared utility to prevent code duplication between student invite components
 */
export function createNotFoundContent(
	searchText: string,
	loading: boolean,
	isSearching: boolean,
	searchResultsLength: number,
): React.ReactNode {
	if (!searchText.trim()) {
		return null;
	}

	if (loading || isSearching) {
		return (
			<div
				style={{
					padding: '8px',
					textAlign: 'center',
					color: '#999',
				}}
			>
				Searching students...
			</div>
		);
	}

	if (searchResultsLength === 0) {
		return (
			<div
				style={{
					padding: '8px',
					textAlign: 'center',
					color: '#999',
				}}
			>
				No students found with &ldquo;{searchText}&rdquo;
			</div>
		);
	}

	return null;
}
