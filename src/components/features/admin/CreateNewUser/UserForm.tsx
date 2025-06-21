'use client';

import { Button, Col, Form, Input, Radio, Row, Select, Space } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import majorService from '@/lib/services/majors.service';
import semesterService from '@/lib/services/semesters.service';
import { showNotification } from '@/lib/utils/notification';
import { Major } from '@/schemas/major';
import { Semester } from '@/schemas/semester';
import { StudentCreate } from '@/schemas/student';
import { useStudentStore } from '@/store/useStudentStore';

const { Option } = Select;

type UserFormProps = {
	formType: 'student' | 'lecturer';
	onSubmit?: (values: Record<string, unknown>) => void;
};

const UserForm = ({ formType }: UserFormProps) => {
	const [form] = Form.useForm();
	const router = useRouter();
	const isStudent = formType === 'student';

	// Use Student Store
	const { createStudent, creating, clearError } = useStudentStore();

	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [semestersLoading, setSemestersLoading] = useState(false);
	const [majors, setMajors] = useState<Major[]>([]);
	const [majorsLoading, setMajorsLoading] = useState(false);

	// Clear error when component mounts or unmounts
	useEffect(() => {
		clearError();
		return () => clearError();
	}, [clearError]);

	// Fetch semesters
	useEffect(() => {
		const fetchSemesters = async () => {
			try {
				setSemestersLoading(true);
				const response = await semesterService.findAll();

				if (response.success) {
					setSemesters(response.data);
				} else {
					console.error('Failed to fetch semesters:', response.error);
				}
			} catch (error) {
				console.error('Error fetching semesters:', error);
			} finally {
				setSemestersLoading(false);
			}
		};

		fetchSemesters();
	}, []);

	// Fetch majors
	useEffect(() => {
		const fetchMajors = async () => {
			try {
				setMajorsLoading(true);
				const response = await majorService.findAll();

				if (response.success) {
					setMajors(response.data);
				} else {
					console.error('Failed to fetch majors:', response.error);
				}
			} catch (error) {
				console.error('Error fetching majors:', error);
			} finally {
				setMajorsLoading(false);
			}
		};

		fetchMajors();
	}, []);

	const handleSubmit = async (values: StudentCreate) => {
		if (isStudent) {
			await handleCreateStudent(values);
		} else {
			showNotification.success(
				'Success',
				'Lecturer creation not implemented yet',
			);
		}
	};

	const handleCreateStudent = async (values: StudentCreate) => {
		// Clear any previous errors
		clearError();

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

	const handleCancel = () => {
		clearError();
		form.resetFields();
		router.push('/admin/students-management');
	};

	return (
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
							rules={[{ required: true, message: 'Please select a semester' }]}
						>
							<Select
								placeholder="Select semester"
								loading={semestersLoading}
								disabled={creating} // Use creating from store
							>
								{semesters.map((semester) => (
									<Option key={semester.id} value={semester.id}>
										{semester.name}
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
								loading={majorsLoading}
								disabled={creating} // Use creating from store
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
				<Col xs={24} sm={12}>
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
					<Button htmlType="button" onClick={handleCancel} disabled={creating}>
						Cancel
					</Button>
					<Button
						type="primary"
						htmlType="submit"
						loading={creating} // Use creating from store
					>
						{isStudent ? 'Create Student' : 'Create Lecturer'}
					</Button>
				</Space>
			</Form.Item>
		</Form>
	);
};

export default UserForm;
