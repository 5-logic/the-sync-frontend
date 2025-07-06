import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { useSessionData } from '@/hooks/auth/useAuth';
import { TEAM_CONFIG, TEAM_STYLES } from '@/lib/constants';
import { showNotification } from '@/lib/utils/notification';
import type { Student } from '@/schemas/student';
import { useStudentStore } from '@/store';

interface InviteTeamMembersProps {
	readonly members: Student[];
	readonly onMembersChange: (members: Student[]) => void;
}

export default function InviteTeamMembers({
	members,
	onMembersChange,
}: InviteTeamMembersProps) {
	const [searchText, setSearchText] = useState('');
	const [searchResults, setSearchResults] = useState<Student[]>([]);

	// Fetch students from store
	const { students, fetchStudents } = useStudentStore();

	// Get current user session to exclude self from search
	const { session } = useSessionData();
	const currentUserId = session?.user?.id;

	// Fetch students on component mount
	useEffect(() => {
		fetchStudents();
	}, [fetchStudents]);

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
	}, [searchText, students, currentUserId]);

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

			if (members.length >= TEAM_CONFIG.MAX_MEMBERS) {
				showNotification.error(
					`Group can have maximum ${TEAM_CONFIG.MAX_MEMBERS} members`,
				);
				return;
			}

			const newMember: Student = targetStudent;

			onMembersChange([...members, newMember]);
			showNotification.success(`${targetStudent.fullName} added successfully!`);
			setSearchText('');
		},
		[searchText, members, onMembersChange, students, currentUserId],
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
						<Input
							placeholder="Enter student email, Student ID"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							prefix={<SearchOutlined />}
							onPressEnter={() => {
								if (searchResults.length === 1) {
									handleAddMember(searchResults[0]);
								}
							}}
						/>
					</Col>
				</Row>

				{searchText.trim() && searchResults.length > 0 && (
					<div style={TEAM_STYLES.searchResultsContainer}>
						{searchResults.map((student) => {
							const isAlreadyAdded = members.some(
								(member) => member.id === student.id,
							);
							const itemStyle = {
								...TEAM_STYLES.searchResultItem,
								cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
								backgroundColor: isAlreadyAdded ? '#f5f5f5' : '#fff',
								opacity: isAlreadyAdded ? 0.6 : 1,
							};

							return (
								<button
									key={student.id}
									type="button"
									disabled={isAlreadyAdded}
									style={{
										...itemStyle,
										border: 'none',
										background: 'transparent',
										width: '100%',
										textAlign: 'left',
									}}
									onClick={() => !isAlreadyAdded && handleAddMember(student)}
									onMouseEnter={(e) => {
										if (!isAlreadyAdded) {
											e.currentTarget.style.backgroundColor = '#f5f5f5';
										}
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = isAlreadyAdded
											? '#f5f5f5'
											: '#fff';
									}}
									aria-label={`${isAlreadyAdded ? 'Already added:' : 'Add'} ${student.fullName}`}
								>
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
											<span style={{ fontSize: '12px', color: '#999' }}>
												(Added)
											</span>
										)}
									</div>
									<div style={{ fontSize: '12px', color: '#666' }}>
										{student.email} • {student.studentCode}
									</div>
								</button>
							);
						})}
					</div>
				)}

				{searchText.trim() && searchResults.length === 0 && (
					<div style={TEAM_STYLES.noResultsContainer}>
						No students found with &ldquo;{searchText}&rdquo;
					</div>
				)}
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
			<div style={TEAM_STYLES.infoContainer}>
				💡 Each group must have {TEAM_CONFIG.MIN_MEMBERS}-
				{TEAM_CONFIG.MAX_MEMBERS} members (Current: {members.length} members)
			</div>
		</div>
	);
}
