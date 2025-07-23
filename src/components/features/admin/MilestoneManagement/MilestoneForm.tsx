'use client';

import { Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { FormInstance } from 'antd/es/form';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useEffect, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { DocumentUploadSection } from '@/components/features/admin/MilestoneManagement/DocumentUploadSection';
import { SEMESTER_STATUS_TAGS } from '@/lib/constants/semester';
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
	showSemesterField?: boolean; // Control visibility of semester field
	files?: File[]; // For files state
	onFilesChange?: (files: File[]) => void; // Callback for files change
}>;

export default function MilestoneForm({
	form,
	semesters,
	loadingSemesters = false,
	existingMilestones,
	milestone = null,
	disabled = false,
	showSemesterField = true,
	files = [],
	onFilesChange,
}: Props) {
	const isEditMode = !!milestone;

	// State for managing files locally if no callback provided
	const [localFiles, setLocalFiles] = useState<File[]>(files);

	// Use provided callback or local state handler
	const handleFilesChange = onFilesChange || setLocalFiles;
	const currentFiles = onFilesChange ? files : localFiles;

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
	}; // Custom validator for semester selection
	const validateSemester = (_: unknown, semesterId: string | undefined) => {
		// Skip validation if semester field is hidden (edit mode)
		if (!showSemesterField) {
			return Promise.resolve();
		}

		if (!semesterId) {
			return Promise.reject(new Error('Please select semester'));
		}

		const selectedSemester = semesters.find((s) => s.id === semesterId);
		if (!selectedSemester) {
			return Promise.reject(new Error('Invalid semester selected'));
		}

		// Check if semester status allows milestone creation/editing - only Ongoing allowed
		if (selectedSemester.status !== 'Ongoing') {
			const action = isEditMode ? 'modify' : 'create';
			return Promise.reject(
				new Error(
					`Cannot ${action} milestone in semester with status: ${selectedSemester.status}. Only Ongoing semesters are allowed.`,
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
		// Start date cannot be in the past (applies to both create and edit)
		if (startDate.isBefore(dayjs(), 'day')) {
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
		// Get semester ID from form field or use existing milestone's semester ID if field is hidden
		const selectedSemesterId = showSemesterField
			? form.getFieldValue('semesterId')
			: milestone?.semesterId;

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

			// Note: For files, we can't restore File objects from milestone.documents
			// This would only be relevant for edit mode, which typically doesn't need file re-upload
		}
	}, [isEditMode, milestone, form]);

	// Helper functions to calculate grid spans (avoiding nested ternary)
	const getNameFieldSpan = (): number => {
		if (isEditMode) return 24;
		return showSemesterField ? 8 : 12;
	};

	const getDurationFieldSpan = (): number => {
		if (isEditMode) return 24;
		return showSemesterField ? 8 : 12;
	};

	return (
		<Form
			form={form}
			layout="vertical"
			requiredMark={false}
			disabled={disabled}
		>
			<Row gutter={isEditMode ? [0, 16] : 16}>
				<Col xs={24} md={getNameFieldSpan()}>
					<Form.Item
						label={<FormLabel text="Milestone Name" isRequired />}
						name="milestoneName"
						rules={[{ required: true, message: 'Please enter milestone name' }]}
					>
						<Input placeholder="Enter milestone name" />
					</Form.Item>
				</Col>
				{showSemesterField && (
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
								notFoundContent={
									loadingSemesters ? 'Loading...' : 'No semester available'
								}
								onChange={(value) => {
									// Explicitly set the form field value
									form.setFieldValue('semesterId', value);
									// Only revalidate duration if it has value
									const currentDuration = form.getFieldValue('duration');
									if (currentDuration?.[0] && currentDuration?.[1]) {
										form.validateFields(['duration']);
									}
								}}
							>
								{semesters
									.filter((semester) => semester.status === 'Ongoing')
									.map((semester) => (
										<Select.Option key={semester.id} value={semester.id}>
											<div
												style={{
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
												}}
											>
												<span>{semester.name}</span>
												{SEMESTER_STATUS_TAGS[semester.status]}
											</div>
										</Select.Option>
									))}
							</Select>
						</Form.Item>
					</Col>
				)}
				<Col xs={24} md={getDurationFieldSpan()}>
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
								// Disable past dates for all cases
								return current && current < dayjs().startOf('day');
							}}
						/>
					</Form.Item>
				</Col>
			</Row>

			{/* Document Upload Section - Only show in create mode */}
			{onFilesChange && (
				<Row style={{ marginTop: 16 }}>
					<Col span={24}>
						<DocumentUploadSection
							files={currentFiles}
							onFilesChange={handleFilesChange}
							disabled={disabled}
						/>
					</Col>
				</Row>
			)}
		</Form>
	);
}
