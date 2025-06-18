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
import type { ColumnsType } from 'antd/es/table';
import type { RcFile } from 'antd/es/upload';
import { useState } from 'react';

const { Dragger } = Upload;

type ExcelImportFormProps<T> = {
	title?: string;
	note: string;
	fields: {
		title: string;
		key: keyof T;
		type: 'text' | 'select';
		options?: { label: string; value: string }[];
	}[];
	mockData: T[];
	onImport: (data: T[]) => void;
};

export default function ExcelImportForm<T extends { id: string }>({
	// title = 'Import Users',
	note,
	fields,
	mockData,
	onImport,
}: ExcelImportFormProps<T>) {
	const [form] = Form.useForm();
	const [fileList, setFileList] = useState<RcFile[]>([]);
	const [data, setData] = useState<T[]>([]);

	const handleUpload = () => {
		setData(mockData); // replace with actual Excel parsing logic
		message.success(`${mockData.length} users data imported successfully`);
		return false;
	};

	const handleFieldChange = (id: string, key: keyof T, value: unknown) => {
		setData((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
		);
	};

	const handleDelete = (id: string) => {
		setData((prev) => prev.filter((item) => item.id !== id));
	};

	const columns: ColumnsType<T> = [
		...fields.map((field) => ({
			title: field.title,
			dataIndex: field.key as string,
			render: (_: unknown, record: T) =>
				field.type === 'text' ? (
					<Input
						value={record[field.key] as string}
						onChange={(e) =>
							handleFieldChange(record.id, field.key, e.target.value)
						}
					/>
				) : (
					<Select
						value={record[field.key] as string}
						onChange={(val) => handleFieldChange(record.id, field.key, val)}
						style={{ width: 120 }}
					>
						{field.options?.map((opt) => (
							<Select.Option key={opt.value} value={opt.value}>
								{opt.label}
							</Select.Option>
						))}
					</Select>
				),
		})),
		{
			title: 'Actions',
			render: (_: unknown, record: T) => (
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
					gutter={[16, 16]}
					wrap={false}
				>
					<Col flex="auto">
						<Typography.Text type="secondary" style={{ display: 'block' }}>
							{note}
						</Typography.Text>
					</Col>
					<Col>
						<Button icon={<DownloadOutlined />} type="default">
							Download Template
						</Button>
					</Col>
				</Row>
			</div>

			<Dragger
				name="file"
				beforeUpload={handleUpload}
				fileList={fileList}
				onRemove={() => {
					setFileList([]);
					setData([]);
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

			{data.length > 0 && (
				<Space direction="vertical" style={{ width: '100%' }} size="middle">
					<Alert
						type="success"
						showIcon
						message={
							<Typography.Text strong>
								{data.length} users data imported successfully
							</Typography.Text>
						}
						style={{ borderColor: '#bbf7d0', color: '#15803d' }}
					/>

					<Table
						dataSource={data}
						columns={columns}
						pagination={false}
						bordered
						rowKey="id"
					/>

					<Row justify="end" gutter={8}>
						<Col>
							<Button onClick={() => setData([])}>Cancel</Button>
						</Col>
						<Col>
							<Button type="primary" onClick={() => onImport(data)}>
								Import All Users
							</Button>
						</Col>
					</Row>
				</Space>
			)}
		</Space>
	);
}
