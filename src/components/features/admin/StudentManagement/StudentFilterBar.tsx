'use client';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';

const { Option } = Select;

type Props = Readonly<{
	statusFilter: string;
	setStatusFilter: (value: string) => void;
	majorFilter: string;
	setMajorFilter: (value: string) => void;
	searchText: string;
	setSearchText: (value: string) => void;
	onCreateStudent: () => void;
}>;

export default function StudentFilterBar({
	statusFilter,
	setStatusFilter,
	majorFilter,
	setMajorFilter,
	searchText,
	setSearchText,
	onCreateStudent,
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
							style={{ width: 120 }}
							size="middle"
						>
							<Option value="All">All Status</Option>
							<Option value="Active">Active</Option>
							<Option value="Inactive">Inactive</Option>
						</Select>
					</Col>

					<Col>
						<Select
							value={majorFilter}
							onChange={setMajorFilter}
							style={{ width: 120 }}
							size="middle"
						>
							<Option value="All">All Majors</Option>
							<Option value="SE">SE</Option>
							<Option value="AI">AI</Option>
						</Select>
					</Col>

					<Col flex="auto">
						<Input
							placeholder="Search by name, email, ID"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							prefix={<SearchOutlined />}
							size="middle"
						/>
					</Col>
				</Row>
			</Col>

			<Col xs={24} md={6} style={{ textAlign: 'right' }}>
				<Button
					icon={<PlusOutlined />}
					type="primary"
					block
					onClick={onCreateStudent}
				>
					Create New Student
				</Button>
			</Col>
		</Row>
	);
}
