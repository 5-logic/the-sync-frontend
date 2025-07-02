import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { mockStudents } from '@/data/student';
import { showNotification } from '@/lib/utils/notification';
import type { Student } from '@/schemas/student';

const TEAM_CONFIG = {
	MAX_MEMBERS: 5,
	MIN_MEMBERS: 4,
	SEARCH_DEBOUNCE_MS: 300,
} as const;

const UI_CONFIG = {
	SEARCH_RESULTS_MAX_HEIGHT: 200,
	BUTTON_HEIGHT: 40,
	BUTTON_FONT_SIZE: 14,
} as const;

const STYLES = {
	searchResultsContainer: {
		border: '1px solid #d9d9d9',
		borderRadius: 6,
		marginTop: 4,
		maxHeight: UI_CONFIG.SEARCH_RESULTS_MAX_HEIGHT,
		overflowY: 'auto' as const,
		backgroundColor: '#fff',
		zIndex: 1000,
	},
	searchResultItem: {
		padding: '8px 12px',
		cursor: 'pointer' as const,
		borderBottom: '1px solid #f0f0f0',
	},
	noResultsContainer: {
		padding: '12px',
		textAlign: 'center' as const,
		color: '#999',
		backgroundColor: '#f9f9f9',
		borderRadius: 6,
		marginTop: 4,
	},
	infoContainer: {
		color: '#1890ff',
		marginBottom: 24,
		padding: '8px 12px',
		background: '#f0f8ff',
		borderRadius: '4px',
		fontSize: '14px',
	},
} as const;

interface Member {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly studentId: string;
}

interface InviteTeamMembersProps {
	readonly members: Member[];
	readonly onMembersChange: (members: Member[]) => void;
}

export default function InviteTeamMembers({
	members,
	onMembersChange,
}: InviteTeamMembersProps) {
	const [searchText, setSearchText] = useState('');
	const [searchResults, setSearchResults] = useState<Student[]>([]);

	useEffect(() => {
		if (!searchText.trim()) {
			setSearchResults([]);
			return;
		}

		const timeoutId = setTimeout(() => {
			const searchLower = searchText.toLowerCase();
			const filtered = mockStudents.filter((student) => {
				const emailMatch = (student.email ?? '')
					.toLowerCase()
					.includes(searchLower);
				const codeMatch = (student.studentCode ?? '')
					.toLowerCase()
					.includes(searchLower);
				const nameMatch = (student.fullName ?? '')
					.toLowerCase()
					.includes(searchLower);
				return emailMatch || codeMatch || nameMatch;
			});

			setSearchResults(filtered);
		}, TEAM_CONFIG.SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(timeoutId);
	}, [searchText]);

	const handleAddMember = useCallback(
		(student?: Student) => {
			let targetStudent = student ?? null;

			if (!targetStudent) {
				if (!searchText.trim()) {
					return;
				}

				const searchLower = searchText.toLowerCase();
				targetStudent =
					mockStudents.find((s) => {
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

			const newMember: Member = {
				id: targetStudent.id,
				name: targetStudent.fullName,
				email: targetStudent.email,
				studentId: targetStudent.studentCode,
			};

			onMembersChange([...members, newMember]);
			showNotification.success(`${targetStudent.fullName} added successfully!`);
			setSearchText('');
		},
		[searchText, members, onMembersChange],
	);

	const handleRemoveMember = useCallback(
		(memberId: string) => {
			const updatedMembers = members.filter((m) => m.id !== memberId);
			onMembersChange(updatedMembers);
			showNotification.success('Member removed successfully!');
		},
		[members, onMembersChange],
	);

	const columns: ColumnsType<Member> = useMemo(
		() => [
			{
				title: 'Name',
				dataIndex: 'name',
				key: 'name',
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
				dataIndex: 'studentId',
				key: 'studentId',
				width: '20%',
				responsive: ['md'],
			},
			{
				title: 'Action',
				key: 'action',
				width: '10%',
				render: (_: unknown, record: Member) => (
					<Button
						type="text"
						danger
						icon={<DeleteOutlined />}
						onClick={() => handleRemoveMember(record.id)}
						aria-label={`Remove ${record.name}`}
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
					<Col>
						<Button
							type="primary"
							onClick={() => {
								if (searchResults.length === 1) {
									handleAddMember(searchResults[0]);
								} else if (searchResults.length === 0 && searchText.trim()) {
									showNotification.warning(
										'No student found with this information',
									);
								} else if (searchResults.length > 1) {
									showNotification.info(
										'Multiple students found, please be more specific',
									);
								}
							}}
							disabled={!searchText.trim()}
							style={{
								fontSize: UI_CONFIG.BUTTON_FONT_SIZE,
								height: UI_CONFIG.BUTTON_HEIGHT,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							}}
						>
							Add Member
						</Button>
					</Col>
				</Row>

				{searchText.trim() && searchResults.length > 0 && (
					<div style={STYLES.searchResultsContainer}>
						{searchResults.map((student) => {
							const isAlreadyAdded = members.some(
								(member) => member.id === student.id,
							);
							const itemStyle = {
								...STYLES.searchResultItem,
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
					<div style={STYLES.noResultsContainer}>
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
					emptyText: 'No members added yet',
				}}
			/>
			<div style={STYLES.infoContainer}>
				💡 Each group must have {TEAM_CONFIG.MIN_MEMBERS}-
				{TEAM_CONFIG.MAX_MEMBERS} members (Current: {members.length} members)
			</div>
		</div>
	);
}

export type { Member };
