'use client';

import { DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useEffect } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { Milestone, MilestoneUpdate } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';
import { useMilestoneStore } from '@/store/useMilestoneStore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

type Props = Readonly<{
	open: boolean;
	milestone: Milestone | null;
	semesters: Semester[];
	existingMilestones: Milestone[];
	onClose: () => void;
}>;

export default function EditMilestoneDialog({
	open,
	milestone,
	semesters,
	existingMilestones,
	onClose,
}: Props) {
	const [form] = Form.useForm();
	const { updating, updateMilestone } = useMilestoneStore();

	// Validation function to check date overlap (excluding current milestone)
	const checkDateOverlap = (
		startDate: Dayjs,
		endDate: Dayjs,
		semesterId: string,
	): boolean => {
		const sameSemesterMilestones = existingMilestones.filter(
			(m) => m.semesterId === semesterId && m.id !== milestone?.id,
		);

		return sameSemesterMilestones.some((m) => {
			const existingStart = dayjs(m.startDate);
			const existingEnd = dayjs(m.endDate);

			// Check if dates overlap
			return (
				(startDate.isBefore(existingEnd) && endDate.isAfter(existingStart)) ||
				startDate.isSame(existingStart) ||
				endDate.isSame(existingEnd)
			);
		});
	}; // Custom validator for semester selection
	const validateSemester = (_: unknown, semesterId: string | undefined) => {
		if (!semesterId) {
			return Promise.reject(new Error('Please select semester'));
		}

		const selectedSemester = semesters.find((s) => s.id === semesterId);
		if (!selectedSemester) {
			return Promise.reject(new Error('Invalid semester selected'));
		}

		// Check if semester status allows milestone creation/editing
		if (
			selectedSemester.status === 'NotYet' ||
			selectedSemester.status === 'End'
		) {
			return Promise.reject(
				new Error(
					`Cannot modify milestone in semester with status: ${selectedSemester.status}`,
				),
			);
		}

		return Promise.resolve();
	};

	// Custom validator for date range
	const validateDateRange = (_: unknown, value: [Dayjs, Dayjs] | undefined) => {
		if (!value?.[0] || !value?.[1]) {
			return Promise.reject(new Error('Please select duration'));
		}

		const [startDate, endDate] = value;
		const selectedSemesterId = form.getFieldValue('semesterId');

		// Check if milestone has already started (cannot update milestones that have passed start date)
		if (milestone && dayjs(milestone.startDate).isBefore(dayjs(), 'day')) {
			return Promise.reject(
				new Error('Cannot update milestone that has already started'),
			);
		}

		// For edit, allow current start date even if it's in the past
		// But new start date should not be in the past
		const currentStartDate = milestone ? dayjs(milestone.startDate) : null;
		if (!currentStartDate || !startDate.isSame(currentStartDate, 'day')) {
			if (startDate.isBefore(dayjs(), 'day')) {
				return Promise.reject(new Error('Start date cannot be in the past'));
			}
		}

		// Check if end date is before start date
		if (endDate.isBefore(startDate)) {
			return Promise.reject(new Error('End date must be after start date'));
		}

		// Check for overlap with existing milestones in the same semester
		if (
			selectedSemesterId &&
			checkDateOverlap(startDate, endDate, selectedSemesterId)
		) {
			return Promise.reject(
				new Error(
					'Date range overlaps with existing milestone in this semester',
				),
			);
		}

		return Promise.resolve();
	};
	// Set form values when milestone changes and dialog is open
	useEffect(() => {
		if (open && milestone) {
			form.setFieldsValue({
				milestoneName: milestone.name,
				semesterId: milestone.semesterId,
				duration: [dayjs(milestone.startDate), dayjs(milestone.endDate)],
			});
		}
	}, [open, milestone, form]);

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			form.resetFields();
		}
	}, [open, form]);
	const handleSubmit = async () => {
		if (!milestone) return;

		// Check if milestone has already started
		if (dayjs(milestone.startDate).isBefore(dayjs(), 'day')) {
			return;
		}

		try {
			const values = await form.validateFields();

			// Convert date range to individual dates
			const duration = values.duration ?? [];
			const [startDate, endDate] = duration;

			const milestoneData: MilestoneUpdate = {
				name: values.milestoneName,
				startDate: startDate?.toDate(),
				endDate: endDate?.toDate(),
				semesterId: values.semesterId,
			};

			const success = await updateMilestone(milestone.id, milestoneData);
			if (success) {
				onClose();
			}
		} catch (error) {
			console.error('Form validation failed:', error);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		onClose();
	};
	// Check if milestone has started
	const milestoneHasStarted = milestone
		? dayjs(milestone.startDate).isBefore(dayjs(), 'day')
		: false;

	return (
		<Modal
			title="Edit Milestone"
			open={open}
			onOk={handleSubmit}
			onCancel={handleCancel}
			confirmLoading={updating}
			okText="Update"
			cancelText="Cancel"
			width={600}
			destroyOnClose
			okButtonProps={{
				disabled: milestoneHasStarted,
			}}
		>
			{milestoneHasStarted && (
				<div
					style={{
						padding: '12px',
						marginBottom: '16px',
						backgroundColor: '#fff7e6',
						border: '1px solid #ffd591',
						borderRadius: '6px',
						color: '#d46b08',
					}}
				>
					⚠️ This milestone has already started and cannot be edited.
				</div>
			)}
			<Form
				form={form}
				layout="vertical"
				requiredMark={false}
				style={{ marginTop: 16 }}
				disabled={milestoneHasStarted}
			>
				{' '}
				<Form.Item
					label={<FormLabel text="Milestone Name" isRequired />}
					name="milestoneName"
					rules={[{ required: true, message: 'Please enter milestone name' }]}
				>
					<Input placeholder="Enter milestone name" />
				</Form.Item>{' '}
				<Form.Item
					label={<FormLabel text="Semester" isRequired />}
					name="semesterId"
					rules={[{ validator: validateSemester }]}
				>
					<Select
						placeholder="Select semester"
						allowClear
						onChange={() => {
							// Revalidate duration when semester changes
							form.validateFields(['duration']);
						}}
						options={semesters.map((semester) => ({
							value: semester.id,
							label: `${semester.name} (${semester.code}) - ${semester.status}`,
							disabled:
								semester.status === 'NotYet' || semester.status === 'End',
						}))}
					/>
				</Form.Item>{' '}
				<Form.Item
					label={<FormLabel text="Duration" isRequired />}
					name="duration"
					rules={[{ validator: validateDateRange }]}
				>
					<RangePicker
						style={{ width: '100%' }}
						disabledDate={(current) => {
							// For edit, allow current dates even if in past
							if (milestone) {
								const currentStart = dayjs(milestone.startDate);
								const currentEnd = dayjs(milestone.endDate);
								// Allow current date range
								if (
									current.isSameOrAfter(currentStart, 'day') &&
									current.isSameOrBefore(currentEnd, 'day')
								) {
									return false;
								}
							}
							// Disable past dates for new selections
							return current && current < dayjs().startOf('day');
						}}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
}
