import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { mockStudents } from '@/data/student';
import { showNotification } from '@/lib/utils/notification';
import type { Student } from '@/schemas/student';

interface Member {
	id: string;
	name: string;
	email: string;
	studentId: string;
}

interface InviteTeamMembersProps {
	members: Member[];
	onMembersChange: (members: Member[]) => void;
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
			const filtered = mockStudents.filter(
				(student) =>
					student.email.toLowerCase().includes(searchText.toLowerCase()) ||
					student.studentCode
						.toLowerCase()
						.includes(searchText.toLowerCase()) ||
					student.fullName.toLowerCase().includes(searchText.toLowerCase()),
			);

			setSearchResults(filtered);
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchText]);

	const handleAddMember = useCallback(
		(student?: Student) => {
			let targetStudent = student;

			if (!targetStudent) {
				if (!searchText.trim()) return;

				targetStudent = mockStudents.find(
					(s) =>
						s.email.toLowerCase() === searchText.toLowerCase() ||
						s.studentCode.toLowerCase() === searchText.toLowerCase(),
				);
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

			const MAX_MEMBERS = 5;
			if (members.length >= MAX_MEMBERS) {
				showNotification.error(`Group can have maximum ${MAX_MEMBERS} members`);
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
								fontSize: 14,
								height: 40,
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
					<div
						style={{
							border: '1px solid #d9d9d9',
							borderRadius: 6,
							marginTop: 4,
							maxHeight: 200,
							overflowY: 'auto',
							backgroundColor: '#fff',
							zIndex: 1000,
						}}
					>
						{searchResults.map((student) => {
							const isAlreadyAdded = members.some(
								(member) => member.id === student.id,
							);
							return (
								<div
									key={student.id}
									style={{
										padding: '8px 12px',
										cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
										borderBottom: '1px solid #f0f0f0',
										backgroundColor: isAlreadyAdded ? '#f5f5f5' : '#fff',
										opacity: isAlreadyAdded ? 0.6 : 1,
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
								</div>
							);
						})}
					</div>
				)}

				{searchText.trim() && searchResults.length === 0 && (
					<div
						style={{
							padding: '12px',
							textAlign: 'center',
							color: '#999',
							backgroundColor: '#f9f9f9',
							borderRadius: 6,
							marginTop: 4,
						}}
					>
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
			<div
				style={{
					color: '#1890ff',
					marginBottom: 24,
					padding: '8px 12px',
					background: '#f0f8ff',
					borderRadius: '4px',
					fontSize: '14px',
				}}
			>
				💡 Each group must have 4-5 members (Current: {members.length} members)
			</div>
		</div>
	);
}

export type { Member };
