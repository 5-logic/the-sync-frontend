import { DeleteOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Col, Row, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { useSessionData } from '@/hooks/auth/useAuth';
import { TEAM_CONFIG, TEAM_STYLES } from '@/lib/constants';
import { showNotification } from '@/lib/utils/notification';
import type { Student } from '@/schemas/student';
import { useStudentStore } from '@/store';

const { Text } = Typography;

interface InviteTeamMembersProps {
	readonly members: Student[];
	readonly onMembersChange: (members: Student[]) => void;
	readonly excludeUserIds?: string[]; // Optional: IDs to exclude from search (e.g., existing group members)
	readonly currentMemberCount?: number; // Optional: Current total members (for invite existing group context)
}

export default function InviteTeamMembers({
	members,
	onMembersChange,
	excludeUserIds = [],
	currentMemberCount,
}: InviteTeamMembersProps) {
	const [searchText, setSearchText] = useState('');
	const [searchResults, setSearchResults] = useState<Student[]>([]);

	// Fetch students from store
	const { students, fetchStudentsWithoutGroupAuto } = useStudentStore();

	// Get current user session to exclude self from search
	const { session } = useSessionData();
	const currentUserId = session?.user?.id;

	// Fetch students without group on component mount
	useEffect(() => {
		fetchStudentsWithoutGroupAuto();
	}, [fetchStudentsWithoutGroupAuto]);

	// Filter students based on search text
	useEffect(() => {
		if (!searchText.trim()) {
			setSearchResults([]);
			return;
		}

		const timeoutId = setTimeout(() => {
			const searchLower = searchText.toLowerCase();
			const filtered = students.filter((student) => {
				// Exclude current logged-in student
				if (currentUserId && student.id === currentUserId) {
					return false;
				}

				// Exclude users from excludeUserIds list (e.g., existing group members)
				if (excludeUserIds.includes(student.id)) {
					return false;
				}

				const emailMatch = (student.email ?? '')
					.toLowerCase()
					.includes(searchLower);
				const codeMatch = (student.studentCode ?? '')
					.toLowerCase()
					.includes(searchLower);
				const nameMatch = (student.fullName ?? '')
					.toLowerCase()
					.includes(searchLower);

				// Use explicit boolean logic to avoid SonarQube warnings
				if (emailMatch) return true;
				if (codeMatch) return true;
				if (nameMatch) return true;
				return false;
			});

			setSearchResults(filtered);
		}, TEAM_CONFIG.SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(timeoutId);
	}, [searchText, students, currentUserId, excludeUserIds]);

	// Build options for AutoComplete
	const studentOptions = useMemo(() => {
		if (!searchText.trim()) return [];

		return searchResults
			.filter((student) => {
				// Exclude current logged-in student
				if (currentUserId && student.id === currentUserId) {
					return false;
				}
				// Exclude users from excludeUserIds list
				if (excludeUserIds.includes(student.id)) {
					return false;
				}
				return true;
			})
			.map((student) => {
				const isAlreadyAdded = members.some(
					(member) => member.id === student.id,
				);
				return {
					value: student.id,
					label: (
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
									<Text type="secondary" style={{ fontSize: '12px' }}>
										(Added)
									</Text>
								)}
							</div>
							<Text type="secondary" style={{ fontSize: '12px' }}>
								{student.email} • {student.studentCode}
							</Text>
						</div>
					),
					disabled: isAlreadyAdded,
					student: student,
				};
			});
	}, [searchResults, currentUserId, members, searchText, excludeUserIds]);

	const handleAddMember = useCallback(
		(student?: Student) => {
			let targetStudent = student ?? null;

			// Prevent adding current logged-in student
			if (
				targetStudent &&
				currentUserId &&
				targetStudent.id === currentUserId
			) {
				showNotification.warning('You cannot add yourself to the group.');
				return;
			}

			// Prevent adding excluded users
			if (targetStudent && excludeUserIds.includes(targetStudent.id)) {
				showNotification.warning('This student is already a group member.');
				return;
			}

			if (!targetStudent) {
				if (!searchText.trim()) {
					return;
				}

				const searchLower = searchText.toLowerCase();
				targetStudent =
					students.find((s) => {
						// Exclude current logged-in student
						if (currentUserId && s.id === currentUserId) {
							return false;
						}

						// Exclude users from excludeUserIds list
						if (excludeUserIds.includes(s.id)) {
							return false;
						}

						const emailMatch = (s.email ?? '').toLowerCase() === searchLower;
						const codeMatch =
							(s.studentCode ?? '').toLowerCase() === searchLower;

						return emailMatch || codeMatch;
					}) ?? null;
			}

			if (!targetStudent) {
				showNotification.error(
					'Student not found. Please check email or Student ID.',
				);
				return;
			}

			const isAlreadyMember = members.some(
				(member) => member.id === targetStudent.id,
			);
			if (isAlreadyMember) {
				showNotification.warning('This student is already in the group.');
				return;
			}

			// Check member limit based on context
			const totalMembersAfterAdd =
				currentMemberCount !== undefined
					? currentMemberCount + members.length + 1 // Existing group: current + selected + new one
					: members.length + 1 + 1; // New group: selected + leader + new one

			if (totalMembersAfterAdd > TEAM_CONFIG.MAX_MEMBERS) {
				const contextMessage =
					currentMemberCount !== undefined
						? `Group would have ${totalMembersAfterAdd} members, exceeding limit of ${TEAM_CONFIG.MAX_MEMBERS}`
						: `Group can have maximum ${TEAM_CONFIG.MAX_MEMBERS} members`;

				showNotification.error(contextMessage);
				return;
			}

			const newMember: Student = targetStudent;

			onMembersChange([...members, newMember]);
			showNotification.success(`${targetStudent.fullName} added successfully!`);
			setSearchText('');
		},
		[
			searchText,
			members,
			onMembersChange,
			students,
			currentUserId,
			excludeUserIds,
			currentMemberCount,
		],
	);

	const handleStudentSelect = useCallback(
		(value: string) => {
			const selectedStudent = students.find((s) => s.id === value);
			if (selectedStudent) {
				handleAddMember(selectedStudent);
			}
		},
		[students, handleAddMember],
	);

	const handleRemoveMember = useCallback(
		(memberId: string) => {
			const updatedMembers = members.filter((m) => m.id !== memberId);
			onMembersChange(updatedMembers);
			showNotification.success('Member removed successfully!');
		},
		[members, onMembersChange],
	);

	const columns: ColumnsType<Student> = useMemo(
		() => [
			{
				title: 'Name',
				dataIndex: 'fullName',
				key: 'fullName',
				width: '30%',
				responsive: ['sm'],
			},
			{
				title: 'Email',
				dataIndex: 'email',
				key: 'email',
				width: '40%',
				ellipsis: true,
			},
			{
				title: 'Student ID',
				dataIndex: 'studentCode',
				key: 'studentCode',
				width: '20%',
				responsive: ['md'],
			},
			{
				title: 'Action',
				key: 'action',
				width: '10%',
				render: (_: unknown, record: Student) => (
					<Button
						type="text"
						danger
						icon={<DeleteOutlined />}
						onClick={() => handleRemoveMember(record.id)}
						aria-label={`Remove ${record.fullName}`}
						size="small"
					/>
				),
			},
		],
		[handleRemoveMember],
	);

	return (
		<div style={{ marginTop: 24 }}>
			<FormLabel text="Invite Team Members" isBold />
			<div style={{ marginTop: 8, marginBottom: 16 }}>
				<Row gutter={[8, 8]} align="middle">
					<Col flex="auto">
						<AutoComplete
							placeholder="Enter student email, Student ID"
							value={searchText}
							options={studentOptions}
							onSearch={setSearchText}
							onSelect={handleStudentSelect}
							notFoundContent={
								searchText.trim() && searchResults.length === 0 ? (
									<div
										style={{
											padding: '8px',
											textAlign: 'center',
											color: '#999',
										}}
									>
										No students found with &ldquo;{searchText}&rdquo;
									</div>
								) : null
							}
							style={{ width: '100%' }}
							filterOption={false}
							allowClear
						/>
					</Col>
				</Row>
			</div>

			<Table
				dataSource={members}
				columns={columns}
				rowKey="id"
				pagination={false}
				size="middle"
				scroll={{ x: true }}
				style={{ marginBottom: 16 }}
				locale={{
					emptyText: 'Search and add students to form your team',
				}}
			/>
			<Typography.Text type="secondary" style={TEAM_STYLES.infoContainer}>
				{currentMemberCount !== undefined ? (
					// Invite to existing group context
					<>
						💡 Current group has {currentMemberCount} members. Select students
						to invite (Selected: {members.length} to invite)
					</>
				) : (
					// Create new group context
					<>
						💡 Each group must have {TEAM_CONFIG.MIN_MEMBERS}-
						{TEAM_CONFIG.MAX_MEMBERS} members (Current: {members.length + 1}{' '}
						members including you)
					</>
				)}
			</Typography.Text>
		</div>
	);
}
