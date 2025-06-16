'use client';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';

const { Option } = Select;

type Props = Readonly<{
	statusFilter: 'all' | 'active' | 'inactive';
	setStatusFilter: (value: 'all' | 'active' | 'inactive') => void;
	searchText: string;
	setSearchText: (value: string) => void;
	onCreateLecturer: () => void;
}>;

export default function LecturerFilterBar({
	statusFilter,
	setStatusFilter,
	searchText,
	setSearchText,
	onCreateLecturer,
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
							placeholder="Select Status"
						>
							<Option value="all">All Status</Option>
							<Option value="active">Active</Option>
							<Option value="inactive">Inactive</Option>
						</Select>
					</Col>
					<Col>
						<Input
							placeholder="Search by name, email"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							prefix={<SearchOutlined style={{ color: '#aaa' }} />}
							style={{ width: 200 }}
						/>
					</Col>
				</Row>
			</Col>

			<Col xs={24} md={6} style={{ textAlign: 'right' }}>
				<Button
					icon={<PlusOutlined />}
					type="primary"
					onClick={onCreateLecturer}
					block
				>
					Create New Lecturer
				</Button>
			</Col>
		</Row>
	);
}
