import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Input,
	Row,
	Select,
	Spin,
	Table,
	Tooltip,
} from 'antd';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { useLecturerSemesterFilter } from '@/hooks/lecturer/useLecturerSemesterFilter';
import groupsService, {
	type SupervisedGroup,
} from '@/lib/services/groups.service';
import { handleApiResponse } from '@/lib/utils/handleApi';

const { Option } = Select;

const AssignedGroupsTable: React.FC = () => {
	const [groups, setGroups] = useState<SupervisedGroup[]>([]);
	const [searchText, setSearchText] = useState('');
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Use custom hook for semester filter logic
	const {
		semesters,
		selectedSemester,
		setSelectedSemester,
		semestersLoading,
		session,
	} = useLecturerSemesterFilter();

	// Fetch assigned groups
	useEffect(() => {
		const fetchGroups = async () => {
			if (!session?.user?.id || selectedSemester === 'all') {
				setGroups([]);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const response =
					await groupsService.findSuperviseGroupsBySemester(selectedSemester);
				const result = handleApiResponse(response);
				if (result.success) {
					setGroups(result.data || []);
				}
			} catch (error) {
				console.error('Error fetching assigned groups:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchGroups();
	}, [session?.user?.id, selectedSemester]);

	// Filter data by search text
	const filteredData = groups.filter((group) => {
		const lowerSearch = searchText.toLowerCase();
		const leaderName =
			group.studentGroupParticipations.find((p) => p.isLeader)?.student.user
				.fullName || '';
		const thesisTitle =
			group.thesis?.englishName || group.thesis?.vietnameseName || '';

		return (
			group.name?.toLowerCase().includes(lowerSearch) ||
			leaderName.toLowerCase().includes(lowerSearch) ||
			thesisTitle.toLowerCase().includes(lowerSearch) ||
			group.studentGroupParticipations.some((member) =>
				member.student.user.fullName?.toLowerCase().includes(lowerSearch),
			)
		);
	});

	// Check if all data is ready for display
	const isDataReady = !loading && !semestersLoading && semesters.length > 0;

	// Helper function to get semester name
	const getSemesterName = (semesterId: string) => {
		return (
			semesters.find((s) => s.id === semesterId)?.name || 'Unknown Semester'
		);
	};

	// Helper function to get group leader name
	const getLeaderName = (group: SupervisedGroup) => {
		const leader = group.studentGroupParticipations.find((p) => p.isLeader);
		return leader?.student.user.fullName || 'No Leader';
	};

	// Helper function to get thesis title
	const getThesisTitle = (group: SupervisedGroup) => {
		return (
			group.thesis?.englishName || group.thesis?.vietnameseName || 'No Thesis'
		);
	};

	// Refresh data function
	const handleRefresh = async () => {
		if (selectedSemester === 'all') {
			setGroups([]);
			return;
		}

		try {
			setLoading(true);
			const response =
				await groupsService.findSuperviseGroupsBySemester(selectedSemester);
			const result = handleApiResponse(response);
			if (result.success) {
				setGroups(result.data || []);
			}
		} catch (error) {
			console.error('Error refreshing assigned groups:', error);
		} finally {
			setLoading(false);
		}
	};

	// Table columns
	const columns = [
		{
			title: 'Group Name',
			dataIndex: 'name',
			key: 'name',
			render: (name: string) => name || 'Unnamed Group',
		},
		{
			title: 'Group Leader',
			key: 'leader',
			render: (_: unknown, record: SupervisedGroup) => getLeaderName(record),
		},
		{
			title: 'Thesis Title',
			key: 'thesis',
			render: (_: unknown, record: SupervisedGroup) => (
				<div style={{ maxWidth: '300px' }}>{getThesisTitle(record)}</div>
			),
		},
		{
			title: 'Semester',
			key: 'semester',
			render: (_: unknown, record: SupervisedGroup) =>
				getSemesterName(record.semesterId),
		},
		{
			title: 'Members',
			key: 'members',
			render: (_: unknown, record: SupervisedGroup) =>
				record.studentGroupParticipations.length,
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_: unknown, record: SupervisedGroup) => (
				<Tooltip title="View Details">
					<Button
						type="link"
						icon={<EyeOutlined />}
						onClick={() => {
							// Navigate to group progress page with group ID as query param
							router.push(`/lecturer/group-progress?groupId=${record.id}`);
						}}
					/>
				</Tooltip>
			),
		},
	];

	return (
		<Card title="Assigned Groups">
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col flex="auto">
					<Input
						allowClear
						prefix={<SearchOutlined />}
						placeholder="Search thesis, group, leader, or member"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
					/>
				</Col>
				<Col flex="200px">
					<Select
						value={selectedSemester}
						onChange={setSelectedSemester}
						style={{ width: '100%' }}
						placeholder="Filter by semester"
						allowClear
						onClear={() => setSelectedSemester('all')}
						loading={semestersLoading}
					>
						<Option value="all">All Semesters</Option>
						{semesters.map((semester) => (
							<Option key={semester.id} value={semester.id}>
								{semester.name}
							</Option>
						))}
					</Select>
				</Col>
				<Col>
					<Tooltip title="Refresh data">
						<Button
							icon={<ReloadOutlined />}
							onClick={handleRefresh}
							loading={loading}
							disabled={selectedSemester === 'all'}
						>
							Refresh
						</Button>
					</Tooltip>
				</Col>
			</Row>

			{!isDataReady ? (
				<div style={{ textAlign: 'center', padding: '40px 0' }}>
					<Spin size="large" />
				</div>
			) : (
				<Table
					columns={columns}
					dataSource={filteredData}
					rowKey="id"
					pagination={TablePagination}
					scroll={{ x: 'max-content' }}
					locale={{
						emptyText:
							selectedSemester === 'all'
								? 'No assigned groups found'
								: 'No assigned groups found for selected semester',
					}}
				/>
			)}
		</Card>
	);
};

export default AssignedGroupsTable;
