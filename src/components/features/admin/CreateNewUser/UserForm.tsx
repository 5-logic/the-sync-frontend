'use client';

import {
	Alert,
	Button,
	Col,
	Form,
	Input,
	Radio,
	Row,
	Select,
	Space,
	Tag,
} from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { SEMESTER_STATUS_TAGS } from '@/lib/constants/semester';
import { showNotification } from '@/lib/utils/notification';
import { LecturerCreate } from '@/schemas/lecturer';
import { StudentCreate } from '@/schemas/student';
import {
	useLecturerStore,
	useMajorStore,
	useSemesterStore,
	useStudentStore,
} from '@/store';

const { Option } = Select;

// Import status tags for consistency

type UserFormProps = {
	formType: 'student' | 'lecturer';
};

const UserForm = ({ formType }: UserFormProps) => {
	const [form] = Form.useForm();
	const router = useRouter();
	const isStudent = formType === 'student';
	// Use Student Store
	const {
		createStudent,
		creating: creatingStudent,
		clearError,
	} = useStudentStore();

	// Use Lecturer Store
	const {
		createLecturer,
		creating: creatingLecturer,
		clearError: clearLecturerError,
	} = useLecturerStore();

	// Combined loading state
	const creating = isStudent ? creatingStudent : creatingLecturer;

	// Use Major Store
	const {
		majors,
		loading: majorsLoading,
		fetchMajors,
		clearError: clearMajorError,
	} = useMajorStore();

	// Use Semester Store - Replace local semester state
	const {
		semesters,
		loading: semestersLoading,
		fetchSemesters,
		clearError: clearSemesterError,
	} = useSemesterStore();

	// Filter semesters for user creation (only Preparing and Picking status)
	const availableSemesters = semesters.filter(
		(semester) =>
			semester.status === 'Preparing' || semester.status === 'Picking',
	);

	// Check if there are any available semesters
	const hasAvailableSemesters = availableSemesters.length > 0;
	// Clear errors when component mounts or unmounts
	useEffect(() => {
		clearError();
		clearMajorError();
		clearSemesterError();
		if (!isStudent) {
			clearLecturerError();
		}
		return () => {
			clearError();
			clearMajorError();
			clearSemesterError();
			if (!isStudent) {
				clearLecturerError();
			}
		};
	}, [
		clearError,
		clearMajorError,
		clearSemesterError,
		clearLecturerError,
		isStudent,
	]);

	// Fetch data using stores
	useEffect(() => {
		fetchMajors();
		fetchSemesters(); // Use semester store
	}, [fetchMajors, fetchSemesters]);
	const handleSubmit = async (values: StudentCreate | LecturerCreate) => {
		if (isStudent) {
			// Additional validation for semester status
			const studentValues = values as StudentCreate;
			const selectedSemester = semesters.find(
				(s) => s.id === studentValues.semesterId,
			);
			if (
				selectedSemester &&
				!['Preparing', 'Picking'].includes(selectedSemester.status)
			) {
				showNotification.error(
					'Invalid Semester',
					'Students can only be created for semesters with Preparing or Picking status',
				);
				return;
			}
			await handleCreateStudent(studentValues);
		} else {
			await handleCreateLecturer(values as LecturerCreate);
		}
	};

	const handleCreateStudent = async (values: StudentCreate) => {
		// Clear any previous errors
		clearError();
		clearMajorError();
		clearSemesterError(); // Clear semester errors too

		const studentData: StudentCreate = {
			fullName: values.fullName.trim(),
			email: values.email.trim().toLowerCase(),
			studentId: values.studentId.trim().toUpperCase(),
			gender: values.gender,
			phoneNumber: values.phoneNumber.trim(),
			majorId: values.majorId,
			semesterId: values.semesterId,
		};

		// Use store method to create student
		const success = await createStudent(studentData);

		if (success) {
			// Success notification is handled in store
			form.resetFields();
			// Navigate back to student management
			router.push('/admin/students-management');
		}
		// Error notification is handled in store
	};
	const handleCreateLecturer = async (values: LecturerCreate) => {
		// Clear any previous errors
		clearLecturerError();
		clearMajorError();
		clearSemesterError();
		const lecturerData: LecturerCreate = {
			fullName: values.fullName.trim(),
			email: values.email.trim().toLowerCase(),
			gender: values.gender,
			phoneNumber: values.phoneNumber.trim(),
		};

		// Use store method to create lecturer
		const success = await createLecturer(lecturerData);

		if (success) {
			// Success notification is handled in store
			form.resetFields();
			// Navigate back to lecturer management
			router.push('/admin/lecturer-management');
		}
		// Error notification is handled in store
	};

	const handleCancel = () => {
		clearError();
		clearMajorError();
		clearSemesterError();
		if (!isStudent) {
			clearLecturerError();
		}
		form.resetFields();
		const targetPath = isStudent
			? '/admin/students-management'
			: '/admin/lecturer-management';
		router.push(targetPath);
	};

	return (
		<div>
			{/* Show warning when no available semesters */}
			{isStudent && !semestersLoading && !hasAvailableSemesters && (
				<Alert
					type="warning"
					showIcon
					message="No Available Semesters for Student Creation"
					description={
						<div>
							<p>
								Students can only be created for semesters with{' '}
								<strong>Preparing</strong> or <strong>Picking</strong> status.
							</p>
							<p>
								Currently, there are no semesters in these statuses available
								for student creation.
							</p>
						</div>
					}
					style={{ marginBottom: 24 }}
				/>
			)}

			{/* Show info about allowed statuses */}
			{isStudent && hasAvailableSemesters && (
				<Alert
					type="info"
					showIcon
					message="Student Creation Policy"
					description={
						<div>
							Student accounts can only be created for semesters with
							<Tag color="orange" style={{ margin: '0 4px' }}>
								Preparing
							</Tag>
							or
							<Tag color="purple" style={{ margin: '0 4px' }}>
								Picking
							</Tag>
							status.
						</div>
					}
					style={{ marginBottom: 24 }}
				/>
			)}

			<Form
				form={form}
				layout="vertical"
				onFinish={handleSubmit}
				requiredMark={false}
				style={{
					borderRadius: 8,
				}}
			>
				{/* Semester and Major - Two columns */}
				{isStudent && (
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item
								name="semesterId"
								label={FormLabel({
									text: 'Semester',
									isRequired: true,
									isBold: true,
								})}
								rules={[
									{ required: true, message: 'Please select a semester' },
								]}
							>
								<Select
									placeholder={
										hasAvailableSemesters
											? 'Select semester (Preparing or Picking status only)'
											: 'No available semesters for student creation'
									}
									loading={semestersLoading} // Use loading from semester store
									disabled={creating ?? !hasAvailableSemesters}
									notFoundContent={
										!semestersLoading && !hasAvailableSemesters
											? 'No semesters with Preparing or Picking status found'
											: undefined
									}
								>
									{availableSemesters.map((semester) => (
										<Option key={semester.id} value={semester.id}>
											<Space>
												<span>{semester.name}</span>
												{SEMESTER_STATUS_TAGS[semester.status]}
											</Space>
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item
								name="majorId"
								label={FormLabel({
									text: 'Major',
									isRequired: true,
									isBold: true,
								})}
								rules={[{ required: true, message: 'Please select a major' }]}
							>
								<Select
									placeholder="Select major"
									loading={majorsLoading} // Use loading from major store
									disabled={creating}
								>
									{majors.map((major) => (
										<Option key={major.id} value={major.id}>
											{major.name}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>
				)}
				{/* Full Name - Full width */}
				<Row>
					<Col span={24}>
						<Form.Item
							name="fullName"
							label={FormLabel({
								text: 'Full Name',
								isRequired: true,
								isBold: true,
							})}
							rules={[
								{ required: true, message: 'Please enter full name' },
								{ min: 2, message: 'Full name must be at least 2 characters' },
								{
									max: 100,
									message: 'Full name must be less than 100 characters',
								},
							]}
						>
							<Input placeholder="Enter full name" disabled={creating} />
						</Form.Item>
					</Col>
				</Row>
				{/* Email - Full width */}
				<Row>
					<Col span={24}>
						<Form.Item
							name="email"
							label={FormLabel({
								text: 'Email Address',
								isRequired: true,
								isBold: true,
							})}
							rules={[
								{ required: true, message: 'Please enter email address' },
								{ type: 'email', message: 'Enter a valid email address' },
							]}
						>
							<Input placeholder="Enter email address" disabled={creating} />
						</Form.Item>
					</Col>
				</Row>
				{/* Phone Number - Full width */}
				<Row>
					<Col span={24}>
						<Form.Item
							name="phoneNumber"
							label={FormLabel({
								text: 'Phone Number',
								isRequired: true,
								isBold: true,
							})}
							rules={[
								{ required: true, message: 'Please enter phone number' },
								{
									pattern:
										/^(?:\+84|0084|84|0)(?:3[2-9]|5[2689]|7[06-9]|8[1-5]|9[0-4|6-9])\d{7}$/,
									message: 'Please enter a valid Vietnamese phone number',
								},
							]}
						>
							<Input placeholder="Enter phone number" disabled={creating} />
						</Form.Item>
					</Col>
				</Row>
				{/* Student ID and Gender - Two columns */}
				<Row gutter={16}>
					{isStudent && (
						<Col xs={24} sm={12}>
							<Form.Item
								name="studentId"
								label={FormLabel({
									text: 'Student ID',
									isRequired: true,
									isBold: true,
								})}
								rules={[
									{ required: true, message: 'Please enter Student ID' },
									{
										pattern: /^[A-Za-z]{2}\d{6}$/,
										message:
											'Student ID must be 2 letters followed by 6 digits, e.g. QE123456',
									},
								]}
							>
								<Input placeholder="Enter Student ID" disabled={creating} />
							</Form.Item>
						</Col>
					)}
					<Col xs={24} sm={isStudent ? 12 : 24}>
						<Form.Item
							name="gender"
							label={FormLabel({
								text: 'Gender',
								isRequired: true,
								isBold: true,
							})}
							rules={[{ required: true, message: 'Please select gender' }]}
						>
							<Radio.Group disabled={creating}>
								<Radio value="Male">Male</Radio>
								<Radio value="Female">Female</Radio>
							</Radio.Group>
						</Form.Item>
					</Col>
				</Row>
				{/* Submit buttons */}
				<Form.Item>
					<Space style={{ width: '100%', justifyContent: 'flex-end' }}>
						<Button
							htmlType="button"
							onClick={handleCancel}
							disabled={creating}
						>
							Cancel
						</Button>
						<Button
							type="primary"
							htmlType="submit"
							loading={creating}
							disabled={isStudent && !hasAvailableSemesters}
						>
							{isStudent ? 'Create Student' : 'Create Lecturer'}
						</Button>
					</Space>
				</Form.Item>
			</Form>
		</div>
	);
};

export default UserForm;
