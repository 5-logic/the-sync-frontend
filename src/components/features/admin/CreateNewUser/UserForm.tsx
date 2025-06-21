'use client';

import {
	Button,
	Col,
	Form,
	Input,
	Radio,
	Row,
	Select,
	Space,
	Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import majorService from '@/lib/services/majors.service';
import semesterService from '@/lib/services/semesters.service';
import { Major } from '@/schemas/major';
import { Semester } from '@/schemas/semester';

const { Option } = Select;
const { Text } = Typography;

type UserFormProps = {
	formType: 'student' | 'lecturer';
	onSubmit: (values: Record<string, unknown>) => void;
};

const Label = ({ text }: { text: string }) => (
	<Text strong>
		{text} <Text type="danger">*</Text>
	</Text>
);

const UserForm = ({ formType, onSubmit }: UserFormProps) => {
	const [form] = Form.useForm();
	const isStudent = formType === 'student';

	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [semestersLoading, setSemestersLoading] = useState(false);
	const [majors, setMajors] = useState<Major[]>([]);
	const [majorsLoading, setMajorsLoading] = useState(false);

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

	return (
		<Form
			form={form}
			layout="vertical"
			onFinish={onSubmit}
			requiredMark="optional"
			style={{
				borderRadius: 8,
			}}
		>
			{/* Semester and Major - Two columns */}
			<Row gutter={16}>
				<Col xs={24} sm={12}>
					<Form.Item
						name="semester"
						label={<Label text="Semester" />}
						rules={[{ required: true, message: 'Please select a semester' }]}
					>
						<Select placeholder="Select semester" loading={semestersLoading}>
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
						name="major"
						label={<Label text="Major" />}
						rules={[{ required: true, message: 'Please select a major' }]}
					>
						<Select placeholder="Select major" loading={majorsLoading}>
							{majors.map((major) => (
								<Option key={major.id} value={major.id}>
									{major.name}
								</Option>
							))}
						</Select>
					</Form.Item>
				</Col>
			</Row>

			<Row gutter={16}>
				{isStudent && (
					<Col xs={24} sm={12}>
						<Form.Item
							name="studentId"
							label={<Label text="Student ID" />}
							rules={[{ required: true, message: 'Please enter Student ID' }]}
						>
							<Input placeholder="Enter Student ID" />
						</Form.Item>
					</Col>
				)}
				<Col xs={24} sm={12}>
					<Form.Item
						name="gender"
						label={<Label text="Gender" />}
						rules={[{ required: true, message: 'Please select gender' }]}
					>
						<Radio.Group>
							<Radio value="male">Male</Radio>
							<Radio value="female">Female</Radio>
						</Radio.Group>
					</Form.Item>
				</Col>
			</Row>

			{/* Full Name - Full width */}
			<Row>
				<Col span={24}>
					<Form.Item
						name="fullName"
						label={<Label text="Full Name" />}
						rules={[{ required: true, message: 'Please enter full name' }]}
					>
						<Input placeholder="Enter full name" />
					</Form.Item>
				</Col>
			</Row>

			{/* Email - Full width */}
			<Row>
				<Col span={24}>
					<Form.Item
						name="email"
						label={<Label text="Email Address" />}
						rules={[
							{ required: true, message: 'Please enter email address' },
							{ type: 'email', message: 'Enter a valid email address' },
						]}
					>
						<Input placeholder="Enter email address" />
					</Form.Item>
				</Col>
			</Row>

			{/* Phone Number - Full width */}
			<Row>
				<Col span={24}>
					<Form.Item
						name="phoneNumber"
						label={<Label text="Phone Number" />}
						rules={[
							{ required: true, message: 'Please enter phone number' },
							{
								pattern: /^(0|\+84)(\d{9})$/,
								message: 'Please enter a valid Vietnamese phone number',
							},
						]}
					>
						<Input placeholder="Enter phone number" />
					</Form.Item>
				</Col>
			</Row>

			{/* Submit buttons */}
			<Form.Item>
				<Space style={{ width: '100%', justifyContent: 'flex-end' }}>
					<Button htmlType="button">Cancel</Button>
					<Button type="primary" htmlType="submit">
						{isStudent ? 'Create Student' : 'Create Lecturer'}
					</Button>
				</Space>
			</Form.Item>
		</Form>
	);
};

export default UserForm;
