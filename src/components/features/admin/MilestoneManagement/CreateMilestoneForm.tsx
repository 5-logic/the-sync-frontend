'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

import { FormLabel } from '@/components/common/FormLabel';
import { Milestone, MilestoneCreate } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';

const { RangePicker } = DatePicker;

type Props = Readonly<{
	semesters: Semester[];
	loadingSemesters: boolean;
	creating: boolean;
	existingMilestones: Milestone[];
	onSubmit: (data: MilestoneCreate) => Promise<void>;
}>;

export default function CreateMilestoneForm({
	semesters,
	loadingSemesters,
	creating,
	existingMilestones,
	onSubmit,
}: Props) {
	const [form] = Form.useForm();

	// Validation function to check date overlap
	const checkDateOverlap = (
		startDate: Dayjs,
		endDate: Dayjs,
		semesterId: string,
	): boolean => {
		const sameSemesterMilestones = existingMilestones.filter(
			(milestone) => milestone.semesterId === semesterId,
		);

		return sameSemesterMilestones.some((milestone) => {
			const existingStart = dayjs(milestone.startDate);
			const existingEnd = dayjs(milestone.endDate);

			// Check if dates overlap
			return (
				(startDate.isBefore(existingEnd) && endDate.isAfter(existingStart)) ||
				startDate.isSame(existingStart) ||
				endDate.isSame(existingEnd)
			);
		});
	};
	// Custom validator for date range
	const validateDateRange = (_: unknown, value: [Dayjs, Dayjs] | undefined) => {
		if (!value || !value[0] || !value[1]) {
			return Promise.reject('Please select duration');
		}

		const [startDate, endDate] = value;
		const selectedSemesterId = form.getFieldValue('semesterId');

		// Check if start date is in the past
		if (startDate.isBefore(dayjs(), 'day')) {
			return Promise.reject('Start date cannot be in the past');
		}

		// Check if end date is before start date
		if (endDate.isBefore(startDate)) {
			return Promise.reject('End date must be after start date');
		}

		// Check for overlap with existing milestones in the same semester
		if (
			selectedSemesterId &&
			checkDateOverlap(startDate, endDate, selectedSemesterId)
		) {
			return Promise.reject(
				'Date range overlaps with existing milestone in this semester',
			);
		}

		return Promise.resolve();
	};

	// Handle form submission
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			// Convert date range to individual dates
			const [startDate, endDate] = values.duration || [];

			const milestoneData: MilestoneCreate = {
				name: values.milestoneName,
				startDate: startDate?.toDate(),
				endDate: endDate?.toDate(),
				semesterId: values.semesterId,
			};

			await onSubmit(milestoneData);
			form.resetFields();
		} catch (error) {
			console.error('Form validation failed:', error);
		}
	};

	return (
		<Form form={form} layout="vertical" requiredMark={false}>
			<Row gutter={16}>
				<Col xs={24} md={8}>
					<Form.Item
						label={<FormLabel text="Milestone Name" isRequired />}
						name="milestoneName"
						rules={[{ required: true, message: 'Please enter milestone name' }]}
					>
						<Input placeholder="Enter milestone name" />
					</Form.Item>
				</Col>{' '}
				<Col xs={24} md={8}>
					<Form.Item
						label={<FormLabel text="Semester" isRequired />}
						name="semesterId"
						rules={[{ required: true, message: 'Please select semester' }]}
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
								label: `${semester.name} (${semester.code})`,
							}))}
						/>
					</Form.Item>
				</Col>
				<Col xs={24} md={8}>
					<Form.Item
						label={<FormLabel text="Duration" isRequired />}
						name="duration"
						rules={[
							{ required: true, message: 'Please select duration' },
							{ validator: validateDateRange },
						]}
					>
						<RangePicker
							className="w-full"
							disabledDate={(current) =>
								current && current < dayjs().startOf('day')
							}
						/>
					</Form.Item>
				</Col>
			</Row>

			<Row justify="end">
				<Button
					type="primary"
					icon={<PlusOutlined />}
					loading={creating}
					onClick={handleSubmit}
				>
					Create New Milestone
				</Button>
			</Row>
		</Form>
	);
}
