'use client';

import {
	CloudUploadOutlined,
	DeleteOutlined,
	DownloadOutlined,
} from '@ant-design/icons';
import {
	Alert,
	Button,
	Col,
	Form,
	Input,
	Row,
	Select,
	Space,
	Table,
	Tooltip,
	Typography,
	Upload,
	message,
} from 'antd';
import type { RcFile } from 'antd/es/upload';
import { useState } from 'react';

import { mockStudents } from '@/data/student';
import { Student } from '@/schemas/student';

const { Dragger } = Upload;
export default function StudentExcelImport() {
	const [form] = Form.useForm();
	const [fileList, setFileList] = useState<RcFile[]>([]);
	const [students, setStudents] = useState<typeof mockStudents>([]);

	// data import từ excel có thể edit
	const handleFieldChange = (
		id: string,
		field: keyof Student,
		value: string,
	) => {
		setStudents((prev) =>
			prev.map((student) =>
				student.id === id ? { ...student, [field]: value } : student,
			),
		);
	};

	const handleUpload = () => {
		setStudents(mockStudents);
		message.success('2 users data imported successfully');
		return false;
	};

	const handleDelete = (id: string) => {
		setStudents((prev) => prev.filter((s) => s.id !== id));
	};

	const columns = [
		{
			title: 'Full Name',
			dataIndex: 'fullName',
			render: (_: unknown, record: Student) => (
				<Input
					value={record.fullName}
					onChange={(e) =>
						handleFieldChange(record.id, 'fullName', e.target.value)
					}
				/>
			),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			render: (_: unknown, record: Student) => (
				<Input
					value={record.email}
					onChange={(e) =>
						handleFieldChange(record.id, 'email', e.target.value)
					}
				/>
			),
		},
		{
			title: 'Student ID',
			dataIndex: 'studentId',
			render: (_: unknown, record: Student) => (
				<Input
					value={record.studentId}
					onChange={(e) =>
						handleFieldChange(record.id, 'studentId', e.target.value)
					}
				/>
			),
		},
		{
			title: 'Gender',
			dataIndex: 'gender',
			render: (_: unknown, record: Student) => (
				<Select
					value={record.gender}
					style={{ width: 120 }}
					onChange={(value) => handleFieldChange(record.id, 'gender', value)}
				>
					<Select.Option value="Male">Male</Select.Option>
					<Select.Option value="Female">Female</Select.Option>
				</Select>
			),
		},
		{
			title: 'Actions',
			render: (_: unknown, record: Student) => (
				<Tooltip title="Delete">
					<Button
						icon={<DeleteOutlined />}
						danger
						type="text"
						onClick={() => handleDelete(record.id)}
					/>
				</Tooltip>
			),
		},
	];

	return (
		<Space direction="vertical" size="middle" style={{ width: '100%' }}>
			{/* Select Semester */}
			<Form form={form} layout="vertical">
				<Form.Item
					name="semester"
					rules={[{ required: false, message: 'Please select a semester' }]}
					label={
						<span style={{ fontWeight: 'bold' }}>
							Semester <span style={{ color: 'red' }}>*</span>
						</span>
					}
				>
					<Select placeholder="Select semester">
						<Select.Option value="summer2023">Fall 2023</Select.Option>
						<Select.Option value="spring2024">Spring 2024</Select.Option>
						<Select.Option value="fall2024">Fall 2024</Select.Option>
					</Select>
				</Form.Item>
			</Form>

			{/* Note + Download Template */}
			<div
				style={{
					border: '1px solid #f0f0f0',
					borderRadius: 8,
					padding: 10,
					background: '#fafafa',
				}}
			>
				<Row
					align="middle"
					justify="space-between"
					gutter={[16, 16]} // dùng 16 cả 2 chiều để spacing đều đẹp hơn
					wrap={false} // tránh wrap khi màn hình hẹp
				>
					<Col flex="auto">
						<Typography.Text type="secondary" style={{ display: 'block' }}>
							Please fill the template with correct user info including Name,
							Email, Student ID, and Gender (Male/Female)
						</Typography.Text>
					</Col>
					<Col>
						<Button icon={<DownloadOutlined />} type="default">
							Download Template
						</Button>
					</Col>
				</Row>
			</div>

			{/* Upload Drag Area */}
			<Dragger
				name="file"
				beforeUpload={handleUpload}
				fileList={fileList}
				onRemove={() => {
					setFileList([]);
					setStudents([]);
				}}
				maxCount={1}
				accept=".xlsx"
			>
				<p className="ant-upload-drag-icon">
					<CloudUploadOutlined />
				</p>
				<p className="ant-upload-text">
					Drag and drop Excel file here, or click to browse
				</p>
				<p className="ant-upload-hint">Supports .xlsx files up to 5MB</p>
			</Dragger>

			{/* Table + Success Message */}
			{students.length > 0 && (
				<Space direction="vertical" style={{ width: '100%' }} size="middle">
					<Alert
						type="success"
						showIcon
						message={
							<Typography.Text strong>
								{students.length} users data imported successfully
							</Typography.Text>
						}
						style={{ borderColor: '#bbf7d0', color: '#15803d' }}
					/>

					<Table
						dataSource={students}
						columns={columns}
						pagination={false}
						bordered
						rowKey="id"
					/>

					<Row justify="end" gutter={8}>
						<Col>
							<Button>Cancel</Button>
						</Col>
						<Col>
							<Button type="primary">Import All Users</Button>
						</Col>
					</Row>
				</Space>
			)}
		</Space>
	);
}
