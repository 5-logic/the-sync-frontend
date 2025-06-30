'use client';

import { Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { FormInstance } from 'antd/es/form';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useEffect } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { DATE_FORMAT } from '@/lib/utils/dateFormat';
import { Milestone } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

type Props = Readonly<{
	form: FormInstance;
	semesters: Semester[];
	loadingSemesters?: boolean;
	existingMilestones: Milestone[];
	milestone?: Milestone | null; // For edit mode
	disabled?: boolean;
}>;

export default function MilestoneForm({
	form,
	semesters,
	loadingSemesters = false,
	existingMilestones,
	milestone = null,
	disabled = false,
}: Props) {
	const isEditMode = !!milestone;

	// Validation function to check date overlap
	const checkDateOverlap = (
		startDate: Dayjs,
		endDate: Dayjs,
		semesterId: string,
	): boolean => {
		const sameSemesterMilestones = existingMilestones.filter(
			(m) =>
				m.semesterId === semesterId && (!isEditMode || m.id !== milestone?.id),
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
	};

	// Custom validator for semester selection
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
			const action = isEditMode ? 'modify' : 'create';
			return Promise.reject(
				new Error(
					`Cannot ${action} milestone in semester with status: ${selectedSemester.status}`,
				),
			);
		}

		return Promise.resolve();
	};
	// Helper function to check if milestone has started (for edit mode)
	const checkMilestoneStarted = (): string | null => {
		if (!isEditMode || !milestone) return null;

		if (dayjs(milestone.startDate).isBefore(dayjs(), 'day')) {
			return 'Cannot update milestone that has already started';
		}
		return null;
	};

	// Helper function to validate start date
	const validateStartDate = (startDate: Dayjs): string | null => {
		if (isEditMode && milestone) {
			const currentStartDate = dayjs(milestone.startDate);
			if (
				!startDate.isSame(currentStartDate, 'day') &&
				startDate.isBefore(dayjs(), 'day')
			) {
				return 'Start date cannot be in the past';
			}
		} else if (startDate.isBefore(dayjs(), 'day')) {
			return 'Start date cannot be in the past';
		}
		return null;
	};

	// Helper function to validate date range order
	const validateDateOrder = (
		startDate: Dayjs,
		endDate: Dayjs,
	): string | null => {
		if (endDate.isBefore(startDate)) {
			return 'End date must be after start date';
		}
		return null;
	};

	// Helper function to validate overlap
	const validateOverlap = (
		startDate: Dayjs,
		endDate: Dayjs,
		selectedSemesterId: string,
	): string | null => {
		if (
			selectedSemesterId &&
			checkDateOverlap(startDate, endDate, selectedSemesterId)
		) {
			return 'Date range overlaps with existing milestone in this semester';
		}
		return null;
	};

	// Custom validator for date range
	const validateDateRange = (_: unknown, value: [Dayjs, Dayjs] | undefined) => {
		if (!value?.[0] || !value?.[1]) {
			return Promise.reject(new Error('Please select duration'));
		}

		const [startDate, endDate] = value;
		const selectedSemesterId = form.getFieldValue('semesterId');

		// Check if milestone has already started (edit mode only)
		const startedError = checkMilestoneStarted();
		if (startedError) {
			return Promise.reject(new Error(startedError));
		}

		// Validate start date
		const startDateError = validateStartDate(startDate);
		if (startDateError) {
			return Promise.reject(new Error(startDateError));
		}

		// Validate date order
		const dateOrderError = validateDateOrder(startDate, endDate);
		if (dateOrderError) {
			return Promise.reject(new Error(dateOrderError));
		}

		// Validate overlap
		const overlapError = validateOverlap(
			startDate,
			endDate,
			selectedSemesterId,
		);
		if (overlapError) {
			return Promise.reject(new Error(overlapError));
		}

		return Promise.resolve();
	};

	// Set form values when milestone changes and in edit mode
	useEffect(() => {
		if (isEditMode && milestone) {
			form.setFieldsValue({
				milestoneName: milestone.name,
				semesterId: milestone.semesterId,
				duration: [dayjs(milestone.startDate), dayjs(milestone.endDate)],
			});
		}
	}, [isEditMode, milestone, form]);

	return (
		<Form
			form={form}
			layout="vertical"
			requiredMark={false}
			disabled={disabled}
		>
			<Row gutter={isEditMode ? [0, 16] : 16}>
				<Col xs={24} md={isEditMode ? 24 : 8}>
					<Form.Item
						label={<FormLabel text="Milestone Name" isRequired />}
						name="milestoneName"
						rules={[{ required: true, message: 'Please enter milestone name' }]}
					>
						<Input placeholder="Enter milestone name" />
					</Form.Item>
				</Col>
				<Col xs={24} md={isEditMode ? 24 : 8}>
					<Form.Item
						label={<FormLabel text="Semester" isRequired />}
						name="semesterId"
						rules={[{ validator: validateSemester }]}
					>
						<Select
							placeholder="Select semester"
							loading={loadingSemesters}
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
					</Form.Item>
				</Col>
				<Col xs={24} md={isEditMode ? 24 : 8}>
					{' '}
					<Form.Item
						label={<FormLabel text="Duration" isRequired />}
						name="duration"
						rules={[{ validator: validateDateRange }]}
					>
						<RangePicker
							style={{ width: '100%' }}
							className={!isEditMode ? 'w-full' : undefined}
							format={DATE_FORMAT}
							disabledDate={(current) => {
								// For edit mode, allow current dates even if in past
								if (isEditMode && milestone) {
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
				</Col>
			</Row>
		</Form>
	);
}
