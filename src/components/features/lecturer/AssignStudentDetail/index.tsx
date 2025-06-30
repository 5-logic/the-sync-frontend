'use client';

import { Button, Card, Col, Input, Row, Space, Typography } from 'antd';
import { useState } from 'react';

import StudentFilterBar from '@/components/features/lecturer/AssignStudent/StudentFilterBar';
import StudentTable from '@/components/features/lecturer/AssignStudent/StudentTable';
import GroupInfoCard from '@/components/features/lecturer/AssignStudentDetail/GroupInfoCard';
import TeamMembers from '@/components/features/lecturer/ViewThesisDetail/TeamMembers';
import { mockStudents } from '@/data/student';
import { mockTheses } from '@/data/thesis';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export default function AssignStudentsDetailPage() {
	const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
	const [filters, setFilters] = useState({
		keyword: '',
		major: 'All',
		status: 'All',
	});
	const [note, setNote] = useState('');

	// 👇 Giả sử đang thao tác với đề tài đầu tiên
	const thesis = mockTheses.find((t) => t.id === 't1');
	if (!thesis) return <div>Thesis not found</div>;

	const filteredStudents = mockStudents.filter((student) => {
		const keywordMatch =
			student.fullName.toLowerCase().includes(filters.keyword.toLowerCase()) ||
			student.email.toLowerCase().includes(filters.keyword.toLowerCase());

		const majorMatch =
			filters.major === 'All' || student.majorId === filters.major;
		const statusMatch =
			filters.status === 'All' ||
			(filters.status === 'InGroup' && student.isActive) ||
			(filters.status === 'NoGroup' && !student.isActive);

		return keywordMatch && majorMatch && statusMatch;
	});

	const handleAssign = () => {
		console.log('Assign:', selectedStudentIds, 'Note:', note);
		// TODO: call API to assign students to thesis.group.id
	};

	return (
		<Space
			direction="vertical"
			size={24}
			style={{ width: '100%', padding: 24 }}
		>
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Assign Students Detail
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 24 }}>
					Facilitate the grouping process by assigning ungrouped students to
					available project groups.
				</Paragraph>
			</div>

			{/* Group Info */}
			<GroupInfoCard thesis={thesis} />

			{/* Team Members */}
			<Card>
				<TeamMembers thesis={thesis} />
			</Card>

			{/* Assign Student(s) to Group */}
			<Card title="Assign Student(s) to Group">
				<StudentFilterBar
					search={filters.keyword}
					onSearchChange={(val) =>
						setFilters((prev) => ({ ...prev, keyword: val }))
					}
					major={filters.major}
					onMajorChange={(val) =>
						setFilters((prev) => ({ ...prev, major: val }))
					}
					status={filters.status}
					onStatusChange={(val) =>
						setFilters((prev) => ({ ...prev, status: val }))
					}
					majorOptions={['SE', 'AI']}
				/>

				{/* Student Table */}
				<StudentTable
					data={filteredStudents}
					selectedRowKeys={selectedStudentIds}
					onSelectionChange={setSelectedStudentIds}
				/>

				{/* Note & Actions */}
				<Row gutter={[16, 16]} className="mt-4">
					<Col span={24}>
						<TextArea
							rows={2}
							placeholder="Add a note about why you want to add these students..."
							value={note}
							onChange={(e) => setNote(e.target.value)}
						/>
					</Col>
					<Col span={24}>
						<Row justify="space-between">
							<Button type="default">Back</Button>
							<Button
								type="primary"
								disabled={selectedStudentIds.length === 0}
								onClick={handleAssign}
							>
								Assign To Group
							</Button>
						</Row>
					</Col>
				</Row>
			</Card>
		</Space>
	);
}
