import { DeleteOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Col, Row, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { useSessionData } from '@/hooks/auth/useAuth';
import { TEAM_CONFIG, TEAM_STYLES } from '@/lib/constants';
import { MemberManagementUtils } from '@/lib/utils/memberManagement';
import { showNotification } from '@/lib/utils/notification';
import {
	createRemoveMemberHandler,
	createStudentAutoCompleteOptions,
	createStudentSelectHandler,
} from '@/lib/utils/studentInviteHelpers';
import type { Student } from '@/schemas/student';
import { useStudentStore } from '@/store';

// Styles for table cell content
const CELL_STYLES = {
	email: {
		maxWidth: '100%',
	} as const,
};

interface CreateGroupInviteMembersSimpleProps {
	readonly members: Student[];
	readonly onMembersChange: (members: Student[]) => void;
}

function CreateGroupInviteMembersSimple({
	members,
	onMembersChange,
}: CreateGroupInviteMembersSimpleProps) {
	const [searchText, setSearchText] = useState('');
	const [searchResults, setSearchResults] = useState<Student[]>([]);

	// Get store data - simple selectors
	const students = useStudentStore((state) => state.students);
	const fetchStudentsWithoutGroupAuto = useStudentStore(
		(state) => state.fetchStudentsWithoutGroupAuto,
	);

	// Get current user session to exclude self from search
	const { session } = useSessionData();
	const currentUserId = useMemo(() => session?.user?.id, [session?.user?.id]);

	// Fetch students without group on component mount (only once)
	useEffect(() => {
		fetchStudentsWithoutGroupAuto();
	}, [fetchStudentsWithoutGroupAuto]);

	// Filter students based on search text
	useEffect(() => {
		if (!searchText.trim()) {
			setSearchResults([]);
			return;
		}

		// Debounce search to prevent excessive filtering
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

				return emailMatch || codeMatch || nameMatch;
			});

			setSearchResults(filtered);
		}, TEAM_CONFIG.SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(timeoutId);
	}, [searchText, students, currentUserId]);

	// Build options for AutoComplete
	const studentOptions = useMemo(() => {
		return createStudentAutoCompleteOptions(
			searchResults,
			currentUserId,
			members,
			searchText,
			[], // No excludeUserIds for create-group mode
		);
	}, [searchResults, currentUserId, members, searchText]);

	const handleAddMember = useCallback(
		(targetStudent: Student) => {
			// Use SIMPLE validation for create group only
			const validationResult =
				MemberManagementUtils.validateAddMemberCreateGroup(
					targetStudent,
					members,
					currentUserId,
				);

			if (!validationResult.isValid) {
				if (validationResult.errorMessage) {
					showNotification.warning(validationResult.errorMessage);
				}
				return;
			}

			onMembersChange([...members, targetStudent]);
			showNotification.success(`${targetStudent.fullName} added successfully!`);
			setSearchText('');
		},
		[members, onMembersChange, currentUserId],
	);

	const handleStudentSelect = useCallback(
		(value: string) => {
			const handler = createStudentSelectHandler(students, handleAddMember);
			handler(value);
		},
		[students, handleAddMember],
	);

	const handleRemoveMember = useCallback(
		(memberId: string) => {
			const handler = createRemoveMemberHandler(
				members,
				onMembersChange,
				showNotification,
			);
			handler(memberId);
		},
		[members, onMembersChange],
	);

	// Stable columns definition to prevent re-renders
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
				title: 'Student Code',
				dataIndex: 'studentCode',
				key: 'studentCode',
				width: '20%',
				responsive: ['md'],
			},
			{
				title: 'Email',
				dataIndex: 'email',
				key: 'email',
				width: '35%',
				responsive: ['lg'],
				render: (email: string) => <div style={CELL_STYLES.email}>{email}</div>,
			},
			{
				title: 'Action',
				key: 'action',
				width: '15%',
				render: (_: unknown, record: Student) => (
					<Button
						type="text"
						danger
						size="small"
						icon={<DeleteOutlined />}
						onClick={() => handleRemoveMember(record.id)}
						aria-label={`Remove ${record.fullName}`}
					>
						Remove
					</Button>
				),
			},
		],
		[handleRemoveMember],
	);

	// Use SIMPLE info text generator for create group
	const renderInfoText = useMemo(() => {
		return MemberManagementUtils.generateInfoTextCreateGroup(members);
	}, [members]);

	return (
		<div>
			<div style={{ marginBottom: 16 }}>
				<Row gutter={[16, 16]}>
					<Col xs={24}>
						<FormLabel text="Add Team Members (Optional)" isBold />
						<div style={{ marginTop: 8 }}>
							<AutoComplete
								value={searchText}
								options={studentOptions}
								onSearch={setSearchText}
								onSelect={handleStudentSelect}
								placeholder="Search by name, student code, or email..."
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
						</div>
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
			<div style={TEAM_STYLES.infoContainer}>{renderInfoText}</div>
		</div>
	);
}

export default memo(CreateGroupInviteMembersSimple);
