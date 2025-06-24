'use client';

import { EditOutlined } from '@ant-design/icons';
import {
	Alert,
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
import type { ColumnsType } from 'antd/es/table';
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { SemesterStatus } from '@/schemas/_enums';
import { Semester, SemesterUpdate } from '@/schemas/semester';
import { useSemesterStore } from '@/store';

const { Option } = Select;
const { Text } = Typography;

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
	// Use Semester Store
	const {
		semesters,
		loading,
		updating,
		deleting,
		fetchSemesters,
		updateSemester,
		clearError,
	} = useSemesterStore();

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<Semester | null>(null);
	const [form] = Form.useForm();
	const [selectedStatus, setSelectedStatus] = useState<
		SemesterStatus | undefined
	>();
	const [isFormChanged, setIsFormChanged] = useState(false);

	// Clear errors when component mounts
	useEffect(() => {
		clearError();
		return () => clearError();
	}, [clearError]);

	// Fetch semesters on component mount
	useEffect(() => {
		fetchSemesters();
	}, [fetchSemesters]);

	// Expose refresh method to parent component
	useImperativeHandle(
		ref,
		() => ({
			refresh: fetchSemesters,
		}),
		[fetchSemesters],
	);

	// Check if there's another semester with active status (not NotYet or End)
	const hasActiveSemester = useCallback(
		(excludeId?: string): Semester | null => {
			const activeSemester = semesters.find(
				(semester) =>
					semester.id !== excludeId &&
					semester.status !== 'NotYet' &&
					semester.status !== 'End',
			);
			return activeSemester ?? null;
		},
		[semesters],
	);

	// Check if status change is allowed based on business rules
	const isStatusChangeAllowed = useCallback(
		(
			currentSemester: Semester,
			newStatus: SemesterStatus,
		): { allowed: boolean; reason?: string; activeSemester?: Semester } => {
			// If changing to NotYet or End, always allow
			if (newStatus === 'NotYet' || newStatus === 'End') {
				return { allowed: true };
			}

			// If current status is already not NotYet/End, allow (same semester progression)
			if (
				currentSemester.status !== 'NotYet' &&
				currentSemester.status !== 'End'
			) {
				return { allowed: true };
			}

			// If changing from NotYet/End to active status, check if other semesters are active
			const activeSemester = hasActiveSemester(currentSemester.id);
			if (activeSemester) {
				return {
					allowed: false,
					reason: `Cannot change status. Another semester "${activeSemester.name}" is currently in ${activeSemester.status} status.`,
					activeSemester,
				};
			}

			return { allowed: true };
		},
		[hasActiveSemester],
	);

	// Check if semester can be edited (End status cannot be edited)
	const canEditSemester = useCallback(
		(semester: Semester): { canEdit: boolean; reason?: string } => {
			if (semester.status === 'End') {
				return {
					canEdit: false,
					reason: 'Cannot edit semester with End status',
				};
			}
			return { canEdit: true };
		},
		[],
	);

	const getAvailableStatuses = useCallback(
		(
			currentStatus: SemesterStatus,
			currentPhase?: string,
		): SemesterStatus[] => {
			const currentIndex = STATUS_ORDER.indexOf(currentStatus);
			if (currentIndex === -1) return STATUS_ORDER;

			const availableStatuses: SemesterStatus[] = [currentStatus];

			if (currentIndex < STATUS_ORDER.length - 1) {
				const nextStatus = STATUS_ORDER[currentIndex + 1];

				// Rule: If current status is Ongoing and next status is End,
				// only allow if current phase is ScopeLocked
				if (currentStatus === 'Ongoing' && nextStatus === 'End') {
					if (currentPhase === 'ScopeLocked') {
						availableStatuses.push(nextStatus);
					}
				} else {
					// For other transitions, allow normal progression
					availableStatuses.push(nextStatus);
				}
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
			.sort((a, b) => {
				// Sort by createdAt descending (newest first)
				const dateA = new Date(a.createdAt);
				const dateB = new Date(b.createdAt);
				return dateB.getTime() - dateA.getTime();
			});
	}, [semesters, statusFilter, searchText]);

	const handleEdit = useCallback(
		(record: Semester) => {
			// Check if semester can be edited
			const editCheck = canEditSemester(record);
			if (!editCheck.canEdit) {
				// Show notification or modal instead of opening edit form
				Modal.info({
					title: 'Cannot Edit Semester',
					content: editCheck.reason,
					centered: true,
				});
				return;
			}

			setEditingRecord(record);
			setSelectedStatus(record.status);
			form.setFieldsValue({
				name: record.name,
				code: record.code,
				maxGroup: record.maxGroup,
				status: record.status,
				ongoingPhase: record.ongoingPhase ?? undefined,
			});
			setIsFormChanged(false);
			setIsEditModalOpen(true);
		},
		[form, canEditSemester],
	);
	// Helper function to validate edit permissions
	const validateEditPermissions = useCallback((record: Semester): boolean => {
		if (record.status === 'End') {
			Modal.error({
				title: 'Edit Not Allowed',
				content: 'Cannot edit semester with End status',
				centered: true,
			});
			return false;
		}
		return true;
	}, []);
	// Helper function to validate status transition rules
	const validateStatusTransition = useCallback(
		(
			record: Semester,
			values: {
				status: SemesterStatus;
				maxGroup?: number;
				ongoingPhase?: string;
			},
		): boolean => {
			// Rule 1: Ongoing -> End requires ScopeLocked phase
			if (record.status === 'Ongoing' && values.status === 'End') {
				const currentPhase =
					form.getFieldValue('ongoingPhase') ?? record.ongoingPhase;
				if (currentPhase !== 'ScopeLocked') {
					form.setFields([
						{
							name: 'status',
							errors: [
								'Cannot change status to End. Phase must be ScopeLocked first.',
							],
						},
					]);
					return false;
				}
			}

			// Rule 2: Max Group required when status is Picking
			if (values.status === 'Picking' && !values.maxGroup) {
				form.setFields([
					{
						name: 'maxGroup',
						errors: [
							'Maximum number of groups is required when status is Picking.',
						],
					},
				]);
				return false;
			}

			// Rule 3: Only one semester can have active status at a time
			const statusCheck = isStatusChangeAllowed(record, values.status);
			if (!statusCheck.allowed) {
				form.setFields([
					{
						name: 'status',
						errors: [statusCheck.reason ?? 'Status change not allowed'],
					},
				]);
				return false;
			}

			return true;
		},
		[form, isStatusChangeAllowed],
	);

	// Helper function to handle successful update
	const handleUpdateSuccess = useCallback(() => {
		setIsEditModalOpen(false);
		setEditingRecord(null);
		setSelectedStatus(undefined);
		form.resetFields();
		setIsFormChanged(false);
	}, [form]);

	const handleEditSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields();
			if (!editingRecord) return;

			// Validate edit permissions
			if (!validateEditPermissions(editingRecord)) return;

			// Validate status transition rules
			if (!validateStatusTransition(editingRecord, values)) return;

			// Prepare payload
			const payload: SemesterUpdate = {
				name: values.name,
				code: values.code,
				maxGroup: values.maxGroup ? parseInt(values.maxGroup, 10) : undefined,
				status: values.status,
				ongoingPhase:
					values.status === 'Ongoing' ? values.ongoingPhase : undefined,
			};

			// Update semester
			const success = await updateSemester(editingRecord.id, payload);
			if (success) {
				handleUpdateSuccess();
			}
		} catch (error) {
			console.error('Form validation error:', error);
		}
	}, [
		form,
		editingRecord,
		updateSemester,
		validateEditPermissions,
		validateStatusTransition,
		handleUpdateSuccess,
	]);

	const handleCancel = useCallback(() => {
		clearError();
		setIsEditModalOpen(false);
		setEditingRecord(null);
		setSelectedStatus(undefined);
		form.resetFields();
		setIsFormChanged(false);
	}, [form, clearError]);

	const handleStatusChange = useCallback(
		(value: SemesterStatus) => {
			setSelectedStatus(value);

			// Clear ongoing phase if status is not Ongoing
			if (value !== 'Ongoing') {
				form.setFieldValue('ongoingPhase', undefined);
			}

			// Clear max group if status is not Picking and it's empty
			if (value !== 'Picking' && !form.getFieldValue('maxGroup')) {
				form.setFieldValue('maxGroup', undefined);
			}

			// Clear status field error when user changes status
			form.setFields([
				{
					name: 'status',
					errors: [],
				},
			]);

			// Clear maxGroup field error when status changes
			form.setFields([
				{
					name: 'maxGroup',
					errors: [],
				},
			]);

			// Trigger form validation to update maxGroup field requirement
			form.validateFields(['maxGroup']).catch(() => {
				// Ignore validation errors, they will be shown in the form
			});
		},
		[form],
	);

	const handlePhaseChange = useCallback(
		(value: string) => {
			// When phase changes, recalculate available statuses
			setIsFormChanged(true);
			form.setFieldValue('ongoingPhase', value);

			// Clear status field error when phase changes
			form.setFields([
				{
					name: 'status',
					errors: [],
				},
			]);

			// Force re-render to update available statuses
			setSelectedStatus((prev) => prev);
		},
		[form],
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
				title: 'Max Groups',
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
				render: (_: unknown, record: Semester) => {
					const editCheck = canEditSemester(record);
					return (
						<Space size="middle">
							<Tooltip
								title={
									editCheck.canEdit
										? 'Edit'
										: (editCheck.reason ?? 'Cannot edit this semester')
								}
							>
								<Button
									icon={<EditOutlined />}
									size="small"
									type="text"
									onClick={() => handleEdit(record)}
									disabled={
										Boolean(!editCheck.canEdit) ||
										Boolean(updating) ||
										Boolean(deleting)
									}
									style={{
										opacity: editCheck.canEdit ? 1 : 0.5,
										cursor: editCheck.canEdit ? 'pointer' : 'not-allowed',
									}}
								/>
							</Tooltip>
						</Space>
					);
				},
			},
		],
		[handleEdit, updating, deleting, canEditSemester],
	);

	// Update available statuses calculation to include current phase
	const availableStatuses = useMemo(() => {
		if (!editingRecord) return STATUS_ORDER;

		// Ưu tiên lấy giá trị từ form trước, sau đó mới lấy từ record
		const formPhase = form.getFieldValue('ongoingPhase');
		const currentPhase =
			formPhase !== undefined ? formPhase : editingRecord.ongoingPhase;
		return getAvailableStatuses(editingRecord.status, currentPhase);
	}, [editingRecord, getAvailableStatuses, form]);

	// Check if status option should be disabled with helpful message
	const getStatusOptionProps = useCallback(
		(status: SemesterStatus) => {
			if (!editingRecord) return {};

			// Ưu tiên lấy giá trị từ form trước
			const formPhase = form.getFieldValue('ongoingPhase');
			const currentPhase =
				formPhase !== undefined ? formPhase : editingRecord.ongoingPhase;

			// Rule 1: Ongoing -> End requires ScopeLocked phase
			if (
				editingRecord.status === 'Ongoing' &&
				status === 'End' &&
				currentPhase !== 'ScopeLocked'
			) {
				return {
					disabled: true,
					title: 'Phase must be ScopeLocked to change status to End',
				};
			}

			// Rule 2: Check if status change is allowed (only for active statuses)
			if (status !== 'NotYet' && status !== 'End') {
				const statusCheck = isStatusChangeAllowed(editingRecord, status);
				if (!statusCheck.allowed) {
					return {
						disabled: true,
						title: statusCheck.reason ?? 'Status change not allowed',
					};
				}
			}

			return {};
		},
		[editingRecord, form, isStatusChangeAllowed],
	);

	// Show warning if there's an active semester
	const activeSemesterWarning = useMemo(() => {
		if (!editingRecord) return null;

		const activeSemester = hasActiveSemester(editingRecord.id);
		if (
			activeSemester &&
			(editingRecord.status === 'NotYet' || editingRecord.status === 'End')
		) {
			return (
				<div
					style={{
						background: '#fff7e6',
						border: '1px solid #ffd591',
						borderRadius: '6px',
						padding: '8px 12px',
						marginBottom: '16px',
						fontSize: '14px',
						color: '#d48806',
					}}
				>
					<strong>Notice:</strong> Semester
					<strong>{activeSemester.name}</strong> is currently in
					<strong>{activeSemester.status}</strong> status. You cannot change
					status for this semester.
				</div>
			);
		}

		return null;
	}, [editingRecord, hasActiveSemester]);

	// Show End status warning
	const endStatusWarning = useMemo(() => {
		if (!editingRecord || editingRecord.status !== 'End') return null;

		return (
			<Alert
				type="info"
				showIcon
				message={
					<Text>
						<strong>Info:</strong> This semester has ended and cannot be
						modified.
					</Text>
				}
				style={{ marginBottom: 16 }}
			/>
		);
	}, [editingRecord]);

	// Show End status selection warning when user selects End status
	const endStatusSelectionWarning = useMemo(() => {
		if (
			!editingRecord ||
			selectedStatus !== 'End' ||
			editingRecord.status === 'End'
		)
			return null;

		return (
			<Alert
				type="warning"
				message="Important Warning"
				description={
					<>
						<Text>
							Once you change the status to <Text strong>End</Text>, this
							semester will be marked as completed and
							<Text strong>cannot be edited anymore</Text>. This action is
							irreversible.
						</Text>
						<br />
						<Text type="secondary" italic>
							Please make sure all semester information is correct before
							proceeding.
						</Text>
					</>
				}
				showIcon
				style={{ marginBottom: 16 }}
			/>
		);
	}, [editingRecord, selectedStatus]);

	return (
		<>
			<Table
				columns={columns}
				dataSource={filteredData}
				loading={loading} // Use loading from store
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
					loading: updating, // Use updating from store
				}}
				cancelButtonProps={{
					disabled: updating, // Use updating from store
				}}
				closable={!updating} // Use updating from store
				maskClosable={!updating} // Use updating from store
			>
				{activeSemesterWarning}
				{endStatusWarning}
				{endStatusSelectionWarning}

				<Form
					form={form}
					layout="vertical"
					requiredMark={false}
					style={{ marginTop: '16px' }}
					onValuesChange={handleFormChange}
				>
					<Row gutter={16}>
						<Col xs={24} md={12}>
							<Form.Item
								name="name"
								label={FormLabel({
									text: 'Semester Name',
									isRequired: true,
									isBold: true,
								})}
								rules={[
									{ required: true, message: 'Semester name is required' },
								]}
							>
								<Input
									placeholder="Enter semester name (e.g., Spring 2025)"
									disabled={updating} // Use updating from store
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								name="code"
								label={FormLabel({
									text: 'Semester Code',
									isRequired: true,
									isBold: true,
								})}
								rules={[
									{ required: true, message: 'Semester code is required' },
								]}
							>
								<Input
									placeholder="Enter semester code (e.g., SP25)"
									disabled={updating} // Use updating from store
								/>
							</Form.Item>
						</Col>
					</Row>

					<Form.Item
						name="maxGroup"
						label={FormLabel({
							text: 'Maximum Number of Groups',
							isBold: true,
						})}
						rules={[
							{
								required: selectedStatus === 'Picking',
								message:
									'Maximum number of groups is required when status is Picking',
							},
							{
								type: 'number',
								min: 1,
								message: 'Maximum number of groups must be a positive integer',
								transform: (value) => (value ? Number(value) : undefined),
							},
						]}
					>
						<Input
							placeholder={
								selectedStatus === 'Picking'
									? 'Enter maximum number of groups (required for Picking status)'
									: 'Enter maximum number of groups (optional)'
							}
							type="number"
							min={1}
							step={1}
							disabled={updating}
						/>
					</Form.Item>

					<Form.Item
						name="status"
						label={FormLabel({
							text: 'Status',
							isRequired: true,
							isBold: true,
						})}
					>
						<Select
							placeholder="Select status"
							onChange={handleStatusChange}
							disabled={updating} // Use updating from store
						>
							{availableStatuses.map((status) => (
								<Option
									key={status}
									value={status}
									{...getStatusOptionProps(status)} // Add option props for disabled state
								>
									{STATUS_LABELS[status]}
								</Option>
							))}
						</Select>
					</Form.Item>

					{selectedStatus === 'Ongoing' && (
						<Form.Item
							name="ongoingPhase"
							label={FormLabel({
								text: 'Ongoing Phase',
								isRequired: true,
								isBold: true,
							})}
							rules={[
								{
									required: true,
									message: 'Ongoing phase is required when status is Ongoing',
								},
							]}
						>
							<Select
								placeholder="Select ongoing phase"
								disabled={updating} // Use updating from store
								onChange={handlePhaseChange} // Add phase change handler
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
