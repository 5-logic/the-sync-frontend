'use client';

import {
	PlusOutlined,
	ReloadOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';

import { useLecturerStore } from '@/store/useLecturerStore';

const { Option } = Select;

type Props = Readonly<{
	onCreateLecturer: () => void;
	onRefresh: () => void;
	loading?: boolean;
}>;

export default function LecturerFilterBar({
	onCreateLecturer,
	onRefresh,
	loading = false,
}: Props) {
	const { selectedStatus, searchText, setSelectedStatus, setSearchText } =
		useLecturerStore();
	return (
		<Row gutter={[8, 16]} align="middle" justify="space-between">
			<Col xs={24} md={18}>
				<Row gutter={[8, 8]} wrap>
					<Col>
						<Select
							value={selectedStatus}
							onChange={setSelectedStatus}
							style={{ width: 120 }}
							placeholder="Select Status"
							size="middle"
						>
							<Option value="All">All Status</Option>
							<Option value="Active">Active</Option>
							<Option value="Inactive">Inactive</Option>
						</Select>
					</Col>
					<Col flex="auto">
						<Input
							placeholder="Search by name, email"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							prefix={<SearchOutlined style={{ color: '#aaa' }} />}
							size="middle"
						/>
					</Col>
					<Col>
						<Button
							icon={<ReloadOutlined />}
							onClick={onRefresh}
							loading={loading}
							size="middle"
							title="Refresh data"
						>
							Refresh
						</Button>
					</Col>
				</Row>
			</Col>
			<Col xs={24} md={6} style={{ textAlign: 'right' }}>
				<Button
					icon={<PlusOutlined />}
					type="primary"
					onClick={onCreateLecturer}
					size="middle"
				>
					Create New Lecturer
				</Button>
			</Col>
		</Row>
	);
}
