'use client';

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	Form,
	Input,
	Radio,
	Row,
	Select,
	Slider,
	Space,
	TreeSelect,
	Typography,
} from 'antd';
import React from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import mockSkills from '@/data/skill';
import mockSkillSets from '@/data/skillSet';
import { mockStudents } from '@/data/student';

const { Title } = Typography;

const majorOptions = [
	{ value: 'SE', label: 'Software Engineering' },
	{ value: 'AI', label: 'Artificial Intelligence' },
];

const responsibilityOptions = [
	{ value: 'Researcher', label: 'Researcher' },
	{ value: 'Developer', label: 'Developer' },
];

const levelTooltips = [
	'Beginner',
	'Intermediate',
	'Proficient',
	'Advanced',
	'Expert',
];

const buildSkillTreeData = () =>
	mockSkillSets.map((set) => ({
		value: set.id,
		title: set.name,
		selectable: false,
		children: mockSkills
			.filter((sk) => sk.skillSetId === set.id)
			.map((sk) => ({
				value: sk.id,
				title: sk.name,
			})),
	}));

const skillTreeData = buildSkillTreeData();

const StudentAccountForm: React.FC = () => {
	const [form] = Form.useForm();

	const student = mockStudents[0];

	const handleFinish = (values: Record<string, unknown>) => {
		console.log('Profile values:', values);
	};

	return (
		<Form
			requiredMark={false}
			form={form}
			layout="vertical"
			onFinish={handleFinish}
			initialValues={{
				fullName: student.fullName,
				email: student.email,
				studentId: student.studentId,
				major: student.majorId,
				phoneNumber: student.phoneNumber,
				gender: student.gender,
				responsibility: ['Researcher'],
			}}
		>
			<Title level={5} style={{ marginBottom: 24 }}>
				Personal Information
			</Title>
			<Row gutter={16}>
				<Col xs={24} md={12}>
					<Form.Item
						name="studentId"
						label={<FormLabel text="Student ID" isBold />}
						rules={[
							{ required: true, message: 'Please enter your student ID' },
						]}
					>
						<Input disabled placeholder="SE150123" />
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						name="email"
						label={<FormLabel text="Email" isBold />}
						rules={[
							{
								required: true,
								type: 'email',
								message: 'Please enter a valid email',
							},
						]}
					>
						<Input disabled placeholder="john.smith@fpt.edu.vn" />
					</Form.Item>
				</Col>
			</Row>
			<Row gutter={16}>
				<Col xs={24} md={12}>
					<Form.Item
						name="fullName"
						label={<FormLabel text="Full Name" isBold />}
						rules={[{ required: true, message: 'Please enter your full name' }]}
					>
						<Input placeholder="John Smith" />
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						name="major"
						label={<FormLabel text="Major" isBold />}
						rules={[{ required: true, message: 'Please select your major' }]}
					>
						<Select options={majorOptions} placeholder="Select major" />
					</Form.Item>
				</Col>
			</Row>
			<Row gutter={16}>
				<Col xs={24} md={12}>
					<Form.Item
						name="phoneNumber"
						label={<FormLabel text="Phone Number" isBold />}
						rules={[
							{ required: true, message: 'Please enter your phone number' },
						]}
					>
						<Input placeholder="Enter phone number" />
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						name="gender"
						label={<FormLabel text="Gender" isBold />}
						rules={[{ required: true, message: 'Please select gender' }]}
					>
						<Radio.Group>
							<Radio value="Male">Male</Radio>
							<Radio value="Female">Female</Radio>
						</Radio.Group>
					</Form.Item>
				</Col>
			</Row>
			<Form.Item
				name="responsibility"
				label={<FormLabel text="Responsibility" isBold />}
			>
				<Select
					mode="multiple"
					options={responsibilityOptions}
					placeholder="Select responsibility"
				/>
			</Form.Item>

			<Form.Item
				label={<FormLabel text="Skills" isBold />}
				required
				style={{ marginBottom: 0 }}
			>
				<Form.List name="skills" key="skills">
					{(fields, { add, remove }) => (
						<>
							{fields.map(({ key, name, ...restField }) => (
								<Row
									key={key}
									gutter={[8, 0]}
									align="top"
									style={{
										marginBottom: 0,
										minHeight: 40,
										flexWrap: 'wrap',
									}}
								>
									<Col xs={24} md={24} style={{ marginBottom: 8 }}>
										<Form.Item
											{...restField}
											name={[name, 'skillId']}
											rules={[{ required: true, message: 'Select skill' }]}
											style={{ marginBottom: 0, width: '100%' }}
										>
											<TreeSelect
												showSearch
												style={{ width: '100%' }}
												placeholder="Select skill"
												treeData={skillTreeData}
												treeDefaultExpandAll={false}
												allowClear
												filterTreeNode={(input, treeNode) =>
													(treeNode.title as string)
														.toLowerCase()
														.includes(input.toLowerCase())
												}
												dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
											/>
										</Form.Item>
									</Col>
									<Col xs={24} md={24} style={{ marginBottom: 8 }}>
										<Row align="middle" gutter={8}>
											<Col flex="auto">
												<Form.Item
													{...restField}
													name={[name, 'level']}
													rules={[{ required: true, message: 'Select level' }]}
													style={{ marginBottom: 0, width: '100%' }}
												>
													<Slider
														min={1}
														max={5}
														step={1}
														tooltip={{
															formatter: (value) =>
																value
																	? levelTooltips[(value as number) - 1]
																	: '',
														}}
													/>
												</Form.Item>
											</Col>
											<Col flex="none">
												<Button
													type="text"
													icon={<MinusCircleOutlined />}
													onClick={() => remove(name)}
													danger
													aria-label="Remove skill"
												/>
											</Col>
										</Row>
									</Col>
								</Row>
							))}
							<Form.Item style={{ marginBottom: 0 }}>
								<Button
									type="dashed"
									onClick={() => add()}
									icon={<PlusOutlined />}
									block
								>
									Add Skill
								</Button>
							</Form.Item>
						</>
					)}
				</Form.List>
			</Form.Item>

			<Form.Item>
				<Row justify="end" style={{ marginTop: 24 }}>
					<Space>
						<Button htmlType="button">Cancel</Button>
						<Button type="primary" htmlType="submit">
							Save Changes
						</Button>
					</Space>
				</Row>
			</Form.Item>
		</Form>
	);
};

export default StudentAccountForm;
