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
	notification,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';

import semesterService from '@/lib/services/semesters.service';
import { SemesterStatus } from '@/schemas/_enums';
import { Semester } from '@/schemas/semester';

const { Option } = Select;

export interface SemesterTableRef {
	refresh: () => Promise<void>;
}

const STATUS_ORDER: SemesterStatus[] = [
	'NotYet',
	'Preparing',
	'Picking',
	'Ongoing',
	'End',
];

const STATUS_TAG: Record<SemesterStatus, JSX.Element> = {
	NotYet: <Tag color="blue">Not Yet</Tag>,
	Preparing: <Tag color="orange">Preparing</Tag>,
	Picking: <Tag color="purple">Picking</Tag>,
	Ongoing: <Tag color="green">Ongoing</Tag>,
	End: <Tag color="gray">End</Tag>,
};

const STATUS_LABELS: Record<SemesterStatus, string> = {
	NotYet: 'Not Yet',
	Preparing: 'Preparing',
	Picking: 'Picking',
	Ongoing: 'Ongoing',
	End: 'End',
};

const SemesterTable = forwardRef<
	SemesterTableRef,
	{
		statusFilter: SemesterStatus | 'All';
		searchText: string;
	}
>(({ statusFilter, searchText }, ref) => {
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<Semester | null>(null);
	const [form] = Form.useForm();
	const [selectedStatus, setSelectedStatus] = useState<
		SemesterStatus | undefined
	>();
	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [loading, setLoading] = useState(false);
	const [updateLoading, setUpdateLoading] = useState(false);
	const [isFormChanged, setIsFormChanged] = useState(false);

	const fetchSemesters = useCallback(async () => {
		try {
			setLoading(true);
			const response = await semesterService.findAll();
			if (response.success && response.data) {
				setSemesters(response.data);
			} else {
				notification.error({
					message: 'Error',
					description: 'Failed to fetch semesters',
					placement: 'bottomRight',
				});
			}
		} catch (error) {
			console.error('Error fetching semesters:', error);
			notification.error({
				message: 'Error',
				description: 'Error fetching semesters',
				placement: 'bottomRight',
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useImperativeHandle(
		ref,
		() => ({
			refresh: fetchSemesters,
		}),
		[fetchSemesters],
	);

	useEffect(() => {
		fetchSemesters();
	}, [fetchSemesters]);

	const getAvailableStatuses = useCallback(
		(currentStatus: SemesterStatus): SemesterStatus[] => {
			const currentIndex = STATUS_ORDER.indexOf(currentStatus);
			if (currentIndex === -1) return STATUS_ORDER;
			const availableStatuses: SemesterStatus[] = [currentStatus];
			if (currentIndex < STATUS_ORDER.length - 1) {
				availableStatuses.push(STATUS_ORDER[currentIndex + 1]);
			}
			return availableStatuses;
		},
		[],
	);

	const filteredData = useMemo(() => {
		if (!semesters.length) return [];

		const searchLower = searchText.toLowerCase();
		return semesters
			.filter((item) => {
				const matchStatus =
					statusFilter === 'All' || item.status === statusFilter;
				const matchSearch =
					!searchText || item.name.toLowerCase().includes(searchLower);
				return matchStatus && matchSearch;
			})
			.reverse();
	}, [semesters, statusFilter, searchText]);

	const handleEdit = useCallback(
		(record: Semester) => {
			setEditingRecord(record);
			setSelectedStatus(record.status);
			form.setFieldsValue({
				name: record.name,
				code: record.code,
				maxGroup: record.maxGroup,
				status: record.status,
				ongoingPhase: record.ongoingPhase,
			});
			setIsFormChanged(false);
			setIsEditModalOpen(true);
		},
		[form],
	);

	const handleEditSubmit = useCallback(async () => {
		setUpdateLoading(true);
		try {
			const values = await form.validateFields();
			if (editingRecord) {
				const payload = {
					name: values.name,
					code: values.code,
					maxGroup: values.maxGroup ? parseInt(values.maxGroup, 10) : undefined,
					status: values.status,
					ongoingPhase: values.ongoingPhase,
				};

				const response = await semesterService.update(
					editingRecord.id,
					payload,
				);
				if (response.success) {
					notification.success({
						message: 'Success',
						description: 'Semester updated successfully',
						placement: 'bottomRight',
					});
					setIsEditModalOpen(false);
					setEditingRecord(null);
					setSelectedStatus(undefined);
					form.resetFields();
					await fetchSemesters();
				} else {
					notification.error({
						message: 'Error',
						description: 'Failed to update semester',
						placement: 'bottomRight',
					});
				}
			}
		} catch (error) {
			console.error('Error updating semester:', error);
			notification.error({
				message: 'Error',
				description: 'Error updating semester',
				placement: 'bottomRight',
			});
		} finally {
			setUpdateLoading(false);
		}
	}, [form, editingRecord, fetchSemesters]);

	const handleCancel = useCallback(() => {
		setIsEditModalOpen(false);
		setEditingRecord(null);
		setSelectedStatus(undefined);
		form.resetFields();
	}, [form]);

	const handleStatusChange = useCallback(
		(value: SemesterStatus) => {
			setSelectedStatus(value);
			if (value !== 'Ongoing') {
				form.setFieldValue('ongoingPhase', undefined);
			}
		},
		[form],
	);

	const handleDelete = useCallback(
		(record: Semester) => {
			Modal.confirm({
				title: 'Delete Semester',
				content: (
					<span>
						Are you sure want to delete{' '}
						<strong>&quot;{record.name}&quot;</strong>?
					</span>
				),
				okText: 'Delete',
				okType: 'danger',
				cancelText: 'Cancel',
				centered: true,
				async onOk() {
					try {
						const response = await semesterService.delete(record.id);
						if (response.success) {
							notification.success({
								message: 'Success',
								description: 'Semester deleted successfully',
								placement: 'bottomRight',
							});
							await fetchSemesters();
						} else {
							notification.error({
								message: 'Error',
								description: 'Failed to delete semester',
								placement: 'bottomRight',
							});
						}
					} catch (error) {
						console.error('Error deleting semester:', error);
						notification.error({
							message: 'Error',
							description: 'Error deleting semester',
							placement: 'bottomRight',
						});
					}
				},
			});
		},
		[fetchSemesters],
	);

	const handleFormChange = useCallback(() => {
		if (!editingRecord) return;
		const current = form.getFieldsValue();
		const original = {
			name: editingRecord.name,
			code: editingRecord.code,
			maxGroup: editingRecord.maxGroup,
			status: editingRecord.status,
			ongoingPhase: editingRecord.ongoingPhase,
		};

		const changed = Object.keys(original).some(
			(key) => current[key] !== original[key as keyof typeof original],
		);
		setIsFormChanged(changed);
	}, [form, editingRecord]);

	const columns: ColumnsType<Semester> = useMemo(
		() => [
			{
				title: 'Semester Name',
				dataIndex: 'name',
				key: 'name',
				width: 200,
			},
			{
				title: 'Semester Code',
				dataIndex: 'code',
				key: 'code',
				width: 150,
			},
			{
				title: 'Max group',
				dataIndex: 'maxGroup',
				key: 'maxGroup',
				width: 120,
			},
			{
				title: 'Status',
				dataIndex: 'status',
				key: 'status',
				width: 120,
				render: (status: SemesterStatus) => STATUS_TAG[status] ?? status,
			},
			{
				title: 'Actions',
				key: 'actions',
				width: 100,
				render: (_: unknown, record: Semester) => (
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
		],
		[handleEdit, handleDelete],
	);

	const availableStatuses = useMemo(() => {
		return editingRecord
			? getAvailableStatuses(editingRecord.status)
			: STATUS_ORDER;
	}, [editingRecord, getAvailableStatuses]);

	return (
		<>
			<Table
				columns={columns}
				dataSource={filteredData}
				loading={loading}
				rowKey="id"
				pagination={{
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} of ${total} items`,
					showSizeChanger: true,
					pageSizeOptions: ['5', '10', '20', '50'],
					showQuickJumper: true,
				}}
				scroll={{ x: 'max-content' }}
				size="middle"
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
				okButtonProps={{
					disabled: !isFormChanged,
					loading: updateLoading,
				}}
				cancelButtonProps={{
					disabled: updateLoading,
				}}
				closable={!updateLoading}
				maskClosable={!updateLoading}
			>
				<Form
					form={form}
					layout="vertical"
					style={{ marginTop: '16px' }}
					onValuesChange={handleFormChange}
				>
					<Row gutter={16}>
						<Col xs={24} md={12}>
							<Form.Item
								name="name"
								label="Semester Name"
								rules={[
									{ required: true, message: 'Semester name is required' },
								]}
							>
								<Input
									placeholder="Enter semester name (e.g., Spring 2025)"
									disabled={updateLoading}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								name="code"
								label="Semester Code"
								rules={[
									{ required: true, message: 'Semester code is required' },
								]}
							>
								<Input
									placeholder="Enter semester code (e.g., SP25)"
									disabled={updateLoading}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Form.Item name="maxGroup" label="Max Group">
						<Input
							placeholder="Enter maximum number of groups"
							type="number"
							disabled={updateLoading}
						/>
					</Form.Item>

					<Form.Item name="status" label="Status">
						<Select
							placeholder="Select status"
							onChange={handleStatusChange}
							disabled={updateLoading}
						>
							{availableStatuses.map((status) => (
								<Option key={status} value={status}>
									{STATUS_LABELS[status]}
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
							<Select
								placeholder="Select ongoing phase"
								disabled={updateLoading}
							>
								<Option value="ScopeAdjustable">Scope Adjustable</Option>
								<Option value="ScopeLocked">Scope Locked</Option>
							</Select>
						</Form.Item>
					)}
				</Form>
			</Modal>
		</>
	);
});

SemesterTable.displayName = 'SemesterTable';

export default SemesterTable;
