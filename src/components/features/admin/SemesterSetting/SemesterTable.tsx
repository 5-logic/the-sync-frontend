'use client';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	Form,
	Input,
	Modal,
	Row,
	Select,
	Space,
	Table,
	Tag,
	Tooltip,
	Typography,
} from 'antd';
import { useState } from 'react';

import { OngoingPhase, SemesterStatus } from '@/schemas/_enums';

const { Option } = Select;
const { Text } = Typography;

interface SemesterData {
	key: string;
	name: string;
	code: string;
	maxGroup: number;
	status: SemesterStatus;
	ongoingPhase?: OngoingPhase;
}

const SemesterTable = ({
	statusFilter,
	searchText,
}: {
	statusFilter: SemesterStatus | 'All';
	searchText: string;
}) => {
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<SemesterData | null>(null);
	const [form] = Form.useForm();
	const [selectedStatus, setSelectedStatus] = useState<
		SemesterStatus | undefined
	>();

	const statusOrder: SemesterStatus[] = [
		'NotYet',
		'Preparing',
		'Picking',
		'Ongoing',
		'End',
	];

	const getAvailableStatuses = (
		currentStatus: SemesterStatus,
	): SemesterStatus[] => {
		const currentIndex = statusOrder.indexOf(currentStatus);
		if (currentIndex === -1) return statusOrder;

		const availableStatuses: SemesterStatus[] = [];

		availableStatuses.push(currentStatus);

		if (currentIndex < statusOrder.length - 1) {
			availableStatuses.push(statusOrder[currentIndex + 1]);
		}

		return availableStatuses;
	};

	const data: SemesterData[] = [
		{
			key: '1',
			name: 'Fall 2025',
			code: 'FA25',
			maxGroup: 15,
			status: 'NotYet',
		},
		{
			key: '2',
			name: 'Summer 2025',
			code: 'SU25',
			maxGroup: 15,
			status: 'Ongoing',
			ongoingPhase: 'ScopeAdjustable',
		},
	];

	const statusTag: Record<SemesterStatus, JSX.Element> = {
		NotYet: <Tag color="blue">Not Yet</Tag>,
		Preparing: <Tag color="orange">Preparing</Tag>,
		Picking: <Tag color="purple">Picking</Tag>,
		Ongoing: <Tag color="green">Ongoing</Tag>,
		End: <Tag color="gray">End</Tag>,
	};

	const statusLabels: Record<SemesterStatus, string> = {
		NotYet: 'Not Yet',
		Preparing: 'Preparing',
		Picking: 'Picking',
		Ongoing: 'Ongoing',
		End: 'End',
	};

	const generateYearOptions = () => {
		const currentYear = new Date().getFullYear();
		const years = [];
		for (let i = 0; i <= 20; i++) {
			years.push(currentYear + i);
		}
		return years;
	};

	const yearOptions = generateYearOptions();

	const parseSemesterName = (name: string) => {
		const parts = name.split(' ');
		if (parts.length === 2) {
			return {
				season: parts[0],
				year: parts[1],
			};
		}
		return { season: '', year: '' };
	};

	const filteredData = data.filter((item) => {
		const matchStatus = statusFilter === 'All' || item.status === statusFilter;
		const matchSearch = item.name
			.toLowerCase()
			.includes(searchText.toLowerCase());
		return matchStatus && matchSearch;
	});

	const handleEdit = (record: SemesterData) => {
		setEditingRecord(record);
		const { season, year } = parseSemesterName(record.name);
		setSelectedStatus(record.status);
		form.setFieldsValue({
			season: season,
			year: year,
			maxGroup: record.maxGroup,
			status: record.status,
			ongoingPhase: record.ongoingPhase,
		});
		setIsEditModalOpen(true);
	};

	const handleEditSubmit = async () => {
		try {
			const values = await form.validateFields();
			console.log('Updated values:', values);
			setIsEditModalOpen(false);
			setEditingRecord(null);
			setSelectedStatus(undefined);
			console.log('Semester updated successfully', editingRecord?.key);
			form.resetFields();
		} catch (error) {
			console.error('Validation failed:', error);
		}
	};

	const handleCancel = () => {
		setIsEditModalOpen(false);
		setEditingRecord(null);
		setSelectedStatus(undefined);
		form.resetFields();
	};

	const handleStatusChange = (value: SemesterStatus) => {
		setSelectedStatus(value);

		if (value !== 'Ongoing') {
			form.setFieldValue('ongoingPhase', undefined);
		}
	};

	const handleDelete = (record: SemesterData) => {
		Modal.confirm({
			title: 'Delete Semester',
			content: (
				<span>
					Are you sure want to delete <strong>&quot;{record.name}&quot;</strong>
					?
				</span>
			),
			okText: 'Delete',
			okType: 'danger',
			cancelText: 'Cancel',
			centered: true,
			onOk() {
				console.log('Delete semester:', record.key);
			},
		});
	};

	const columns = [
		{ title: 'Semester Name', dataIndex: 'name', key: 'name' },
		{ title: 'Semester Code', dataIndex: 'code', key: 'code' },
		{ title: 'Max group', dataIndex: 'maxGroup', key: 'maxGroup' },
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status: SemesterStatus) => statusTag[status] ?? status,
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_: unknown, record: SemesterData) => (
				<Space size="middle">
					<Tooltip title="Edit">
						<Button
							icon={<EditOutlined />}
							size="small"
							type="text"
							onClick={() => handleEdit(record)}
						/>
					</Tooltip>
					<Tooltip title="Delete">
						<Button
							icon={<DeleteOutlined />}
							size="small"
							danger
							type="text"
							onClick={() => handleDelete(record)}
						/>
					</Tooltip>
				</Space>
			),
		},
	];

	const availableStatuses = editingRecord
		? getAvailableStatuses(editingRecord.status)
		: statusOrder;

	return (
		<>
			<Table
				columns={columns}
				dataSource={filteredData}
				pagination={{
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} of ${total} items`,
					showSizeChanger: true,
					pageSizeOptions: ['5', '10', '20', '50'],
				}}
				scroll={{ x: 'max-content' }}
			/>

			<Modal
				title="Edit Semester"
				open={isEditModalOpen}
				onOk={handleEditSubmit}
				onCancel={handleCancel}
				okText="Update"
				cancelText="Cancel"
				width={500}
				centered
			>
				<Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
					<Row gutter={16}>
						<Col xs={24} md={12}>
							<Form.Item
								name="season"
								label={
									<span>
										Season <Text type="danger">*</Text>
									</span>
								}
								rules={[
									{ required: true, message: 'Season of semester is required' },
								]}
								required={false}
							>
								<Select placeholder="Select the season of semester">
									<Option value="Spring">Spring</Option>
									<Option value="Summer">Summer</Option>
									<Option value="Fall">Fall</Option>
								</Select>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								name="year"
								label={
									<span>
										Year <Text type="danger">*</Text>
									</span>
								}
								rules={[
									{ required: true, message: 'Year for semester is required' },
								]}
								required={false}
							>
								<Select placeholder="Select the year for semester">
									{yearOptions.map((year) => (
										<Option key={year} value={year.toString()}>
											{year}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Form.Item name="maxGroup" label="Max Group">
						<Input placeholder="Enter maximum number of groups" type="number" />
					</Form.Item>

					<Form.Item name="status" label="Status">
						<Select placeholder="Select status" onChange={handleStatusChange}>
							{availableStatuses.map((status) => (
								<Option key={status} value={status}>
									{statusLabels[status]}
								</Option>
							))}
						</Select>
					</Form.Item>

					{selectedStatus === 'Ongoing' && (
						<Form.Item
							name="ongoingPhase"
							label="Ongoing Phase"
							rules={[
								{
									required: true,
									message: 'Ongoing phase is required when status is Ongoing',
								},
							]}
						>
							<Select placeholder="Select ongoing phase">
								<Option value="ScopeAdjustable">Scope Adjustable</Option>
								<Option value="ScopeLocked">Scope Locked</Option>
							</Select>
						</Form.Item>
					)}
				</Form>
			</Modal>
		</>
	);
};

export default SemesterTable;
