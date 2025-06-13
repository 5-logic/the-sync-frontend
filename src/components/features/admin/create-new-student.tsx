'use client';

import { Button, Form, Input, Radio, Select, message } from 'antd';
import { useState } from 'react';

const { Option } = Select;

// ---------------- Header ----------------
const PageHeader = () => (
	<div className="mb-8 pl-2 text-left">
		<h1 className="text-3xl font-bold">Create New Student</h1>
		<p className="text-gray-500">Add new students to the capstone ecosystem</p>
	</div>
);

// ---------------- Tabs ----------------
const TabNavigation = ({
	activeTab,
	setActiveTab,
}: {
	activeTab: string;
	setActiveTab: (key: string) => void;
}) => {
	const tabs = [
		{ key: 'manual', label: 'Manual Input' },
		{ key: 'excel', label: 'Import from Excel' },
	];

	return (
		<div className="mb-6 border-b border-gray-200 pl-2 text-left">
			<nav className="flex space-x-8">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						onClick={() => setActiveTab(tab.key)}
						className={`pb-2 font-medium transition-colors duration-200 ${
							activeTab === tab.key
								? 'text-blue-600 border-b-2 border-blue-600'
								: 'text-gray-500 hover:text-blue-600'
						}`}
					>
						{tab.label}
					</button>
				))}
			</nav>
		</div>
	);
};

// ---------------- Form ----------------
const StudentForm = () => {
	const [form] = Form.useForm();

	const handleSubmit = (values: unknown) => {
		console.log('Form values:', values);
		message.success('Student created successfully!');
	};

	return (
		<Form
			form={form}
			layout="vertical"
			onFinish={handleSubmit}
			requiredMark={false}
			className="bg-white p-8 rounded-lg shadow space-y-6"
		>
			<Form.Item
				name="semester"
				label={
					<span>
						Semester <span className="text-red-500">*</span>
					</span>
				}
				rules={[{ required: true, message: 'Please select a semester' }]}
			>
				<Select placeholder="Select semester">
					<Option value="Spring 2025">Spring 2025</Option>
					<Option value="Fall 2025">Fall 2025</Option>
				</Select>
			</Form.Item>

			<Form.Item
				name="fullName"
				label={
					<span>
						Full Name <span className="text-red-500">*</span>
					</span>
				}
				rules={[{ required: true, message: 'Please enter full name' }]}
			>
				<Input placeholder="Enter full name" />
			</Form.Item>

			<Form.Item
				name="email"
				label={
					<span>
						Email Address <span className="text-red-500">*</span>
					</span>
				}
				rules={[
					{ required: true, message: 'Please enter email address' },
					{ type: 'email', message: 'Enter a valid email address' },
				]}
			>
				<Input placeholder="Enter email address" />
			</Form.Item>

			<Form.Item
				name="studentId"
				label={
					<span>
						Student ID <span className="text-red-500">*</span>
					</span>
				}
				rules={[{ required: true, message: 'Please enter Student ID' }]}
			>
				<Input placeholder="Enter Student ID" />
			</Form.Item>

			<Form.Item
				name="gender"
				label={
					<span>
						Gender <span className="text-red-500">*</span>
					</span>
				}
				rules={[{ required: true, message: 'Please select gender' }]}
			>
				<Radio.Group>
					<Radio value="Male">Male</Radio>
					<Radio value="Female">Female</Radio>
				</Radio.Group>
			</Form.Item>

			<Form.Item>
				<div className="flex justify-end gap-4">
					<Button htmlType="button" className="border border-gray-300">
						Cancel
					</Button>
					<Button
						type="primary"
						htmlType="submit"
						className="bg-blue-600 hover:bg-blue-700"
					>
						Create User
					</Button>
				</div>
			</Form.Item>
		</Form>
	);
};

// ---------------- Main Page ----------------
export default function CreateNewStudent() {
	const [activeTab, setActiveTab] = useState('manual');

	return (
		<div className="max-w-2xl">
			<PageHeader />
			<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
			{activeTab === 'manual' ? (
				<StudentForm />
			) : (
				<div className="bg-white p-6 rounded-lg shadow">
					<p className="text-gray-600">
						Excel import functionality coming soon...
					</p>
				</div>
			)}
		</div>
	);
}
