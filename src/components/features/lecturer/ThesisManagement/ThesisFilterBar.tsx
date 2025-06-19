'use client';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';

const { Option } = Select;

type Props = Readonly<{
	statusFilter: 'all' | 'approved' | 'rejected' | 'pending';
	setStatusFilter: (value: 'all' | 'approved' | 'rejected' | 'pending') => void;
	searchText: string;
	setSearchText: (value: string) => void;
	selectedSemester: string;
	setSelectedSemester: (value: string) => void;
	onCreateThesis: () => void;
}>;

export default function ThesisFilterBar({
	statusFilter,
	setStatusFilter,
	searchText,
	setSearchText,
	selectedSemester,
	setSelectedSemester,
	onCreateThesis,
}: Props) {
	return (
		<Row
			gutter={[8, 16]}
			align="middle"
			justify="space-between"
			style={{ marginBottom: 16 }}
		>
			<Col xs={24} md={18}>
				<Row gutter={[8, 8]} wrap>
					<Col>
						<Select
							value={statusFilter}
							onChange={setStatusFilter}
							style={{ width: 140 }}
							placeholder="Select Status"
						>
							<Option value="all">All Status</Option>
							<Option value="approved">Approved</Option>
							<Option value="rejected">Rejected</Option>
							<Option value="pending">Pending</Option>
						</Select>
					</Col>

					<Col>
						<Select
							value={selectedSemester}
							onChange={setSelectedSemester}
							style={{ width: 140 }}
							placeholder="Semester"
						>
							<Option value="all">All Semesters</Option>
							<Option value="Spring 2025">Spring 2025</Option>
							<Option value="Summer 2024">Summer 2024</Option>
							<Option value="Summer 2025">Summer 2025</Option>
						</Select>
					</Col>

					<Col flex="auto">
						<Input
							placeholder="Search topics"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							prefix={<SearchOutlined style={{ color: '#aaa' }} />}
						/>
					</Col>
				</Row>
			</Col>

			<Col xs={24} md={6} style={{ textAlign: 'right' }}>
				<Button
					icon={<PlusOutlined />}
					type="primary"
					onClick={onCreateThesis}
					block
				>
					Create Thesis
				</Button>
			</Col>
		</Row>
	);
}
