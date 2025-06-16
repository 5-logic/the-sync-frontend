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
	message,
} from 'antd';
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
	const [isFormChanged, setIsFormChanged] = useState(false);

	const statusOrder: SemesterStatus[] = useMemo(
		() => ['NotYet', 'Preparing', 'Picking', 'Ongoing', 'End'],
		[],
	);

	const statusTag: Record<SemesterStatus, JSX.Element> = useMemo(
		() => ({
			NotYet: <Tag color="blue">Not Yet</Tag>,
			Preparing: <Tag color="orange">Preparing</Tag>,
			Picking: <Tag color="purple">Picking</Tag>,
			Ongoing: <Tag color="green">Ongoing</Tag>,
			End: <Tag color="gray">End</Tag>,
		}),
		[],
	);

	const statusLabels: Record<SemesterStatus, string> = useMemo(
		() => ({
			NotYet: 'Not Yet',
			Preparing: 'Preparing',
			Picking: 'Picking',
			Ongoing: 'Ongoing',
			End: 'End',
		}),
		[],
	);

	const fetchSemesters = useCallback(async () => {
		try {
			setLoading(true);
			const response = await semesterService.findAll();
			if (response.success && response.data) {
				setSemesters(response.data);
			} else {
				message.error('Failed to fetch semesters');
			}
		} catch (error) {
			console.error('Error fetching semesters:', error);
			message.error('Error fetching semesters');
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
			const currentIndex = statusOrder.indexOf(currentStatus);
			if (currentIndex === -1) return statusOrder;
			const availableStatuses: SemesterStatus[] = [];
			availableStatuses.push(currentStatus);
			if (currentIndex < statusOrder.length - 1) {
				availableStatuses.push(statusOrder[currentIndex + 1]);
			}
			return availableStatuses;
		},
		[statusOrder],
	);

	const filteredData = useMemo(() => {
		return semesters
			.filter((item) => {
				const matchStatus =
					statusFilter === 'All' || item.status === statusFilter;
				const matchSearch = item.name
					.toLowerCase()
					.includes(searchText.toLowerCase());
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
					message.success('Semester updated successfully');
					setIsEditModalOpen(false);
					setEditingRecord(null);
					setSelectedStatus(undefined);
					form.resetFields();
					await fetchSemesters();
				} else {
					message.error('Failed to update semester');
				}
			}
		} catch (error) {
			console.error('Error updating semester:', error);
			message.error('Error updating semester');
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
							message.success('Semester deleted successfully');
							await fetchSemesters();
						} else {
							message.error('Failed to delete semester');
						}
					} catch (error) {
						console.error('Error deleting semester:', error);
						message.error('Error deleting semester');
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
		type FieldKey = keyof typeof original;
		const changed = (Object.keys(original) as FieldKey[]).some(
			(key) => current[key] !== original[key],
		);
		setIsFormChanged(changed);
	}, [form, editingRecord]);

	const columns = useMemo(
		() => [
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
		[statusTag, handleEdit, handleDelete],
	);

	const availableStatuses = useMemo(() => {
		return editingRecord
			? getAvailableStatuses(editingRecord.status)
			: statusOrder;
	}, [editingRecord, getAvailableStatuses, statusOrder]);

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
				okButtonProps={{ disabled: !isFormChanged }}
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
								label={<span>Semester Name</span>}
								rules={[
									{ required: true, message: 'Semester name is required' },
								]}
							>
								<Input placeholder="Enter semester name (e.g., Spring 2025)" />
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								name="code"
								label={<span>Semester Code</span>}
								rules={[
									{ required: true, message: 'Semester code is required' },
								]}
							>
								<Input placeholder="Enter semester code (e.g., SP25)" />
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
});

SemesterTable.displayName = 'SemesterTable';

export default SemesterTable;
