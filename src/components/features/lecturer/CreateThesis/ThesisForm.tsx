'use client';

import {
	CloudUploadOutlined,
	DownloadOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select, Upload, message } from 'antd';
import { useState } from 'react';

import ThesisDuplicateList from '@/components/features/lecturer/CreateThesis/ThesisDuplicateList';

const { TextArea } = Input;
const { Option } = Select;

type Props = Readonly<{
	mode: 'create' | 'edit';
	initialValues?: Record<string, unknown>;
	onSubmit: (values: Record<string, unknown>) => void;
}>;

export default function ThesisForm({ mode, initialValues, onSubmit }: Props) {
	const [form] = Form.useForm();
	const [showDuplicateList, setShowDuplicateList] = useState(false);

	const uploadProps = {
		beforeUpload: (file: File) => {
			const isAllowed =
				file.type === 'application/pdf' ||
				file.type.includes('word') ||
				file.name.endsWith('.docx');
			if (!isAllowed) {
				message.error('Only PDF, DOC, DOCX files are allowed!');
			}
			return isAllowed || Upload.LIST_IGNORE;
		},
		maxCount: 1,
	};

	return (
		<Form
			form={form}
			layout="vertical"
			requiredMark="optional"
			style={{ width: '100%' }}
			initialValues={initialValues}
			onFinish={onSubmit}
		>
			<Form.Item
				name="titleEn"
				label={
					<>
						Thesis Title (English name) <span style={{ color: 'red' }}>*</span>
					</>
				}
				rules={[{ required: true }]}
			>
				<Input placeholder="Enter your thesis title" />
			</Form.Item>

			<Form.Item
				name="titleVi"
				label={
					<>
						Thesis Title (Vietnamese name){' '}
						<span style={{ color: 'red' }}>*</span>
					</>
				}
				rules={[{ required: true }]}
			>
				<Input placeholder="Enter your thesis title" />
			</Form.Item>

			<Form.Item
				name="abbreviation"
				label={
					<>
						Abbreviation <span style={{ color: 'red' }}>*</span>
					</>
				}
				rules={[{ required: true }]}
			>
				<Input placeholder="Enter abbreviation" />
			</Form.Item>

			<Form.Item name="field" label="Field / Domain">
				<Select placeholder="Select field of study">
					<Option value="Computer Science">Computer Science</Option>
					<Option value="Software Engineering">Software Engineering</Option>
				</Select>
			</Form.Item>

			<Form.Item
				name="description"
				label={
					<>
						Thesis Description <span style={{ color: 'red' }}>*</span>
					</>
				}
				rules={[{ required: true }]}
			>
				<TextArea maxLength={500} rows={4} placeholder="Describe your thesis" />
			</Form.Item>

			<Form.Item name="skills" label="Required Skills">
				<Select mode="tags" placeholder="Add skills">
					<Option value="Python">Python</Option>
					<Option value="Machine Learning">Machine Learning</Option>
					<Option value="Database">Database</Option>
				</Select>
			</Form.Item>

			<div style={{ marginBottom: 24 }}>
				<Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
					<Col>
						<span style={{ fontWeight: 500 }}>
							Supporting Documents
							{mode === 'create' && <span style={{ color: 'red' }}> *</span>}
						</span>
					</Col>
					<Col>
						<Button icon={<DownloadOutlined />} type="default" size="small">
							Download Template
						</Button>
					</Col>
				</Row>

				<Form.Item
					name="supportingDocument"
					valuePropName="fileList"
					getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
					rules={
						mode === 'create'
							? [{ required: true, message: 'Please upload your document' }]
							: []
					}
				>
					<Upload.Dragger {...uploadProps}>
						<p className="ant-upload-drag-icon">
							<CloudUploadOutlined />
						</p>
						<p>Click or drag file to upload</p>
						<p style={{ color: '#999' }}>Support PDF, DOC, DOCX (Max: 10MB)</p>
					</Upload.Dragger>
				</Form.Item>
			</div>

			<Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
				{mode === 'create' && (
					<Col>
						<Button
							icon={<SearchOutlined />}
							type="primary"
							onClick={() => setShowDuplicateList(true)}
						>
							Duplicate Thesis Detection
						</Button>
					</Col>
				)}

				<Col>
					<Button type="primary" htmlType="submit">
						{mode === 'create' ? 'Submit Registration' : 'Resubmit Thesis'}
					</Button>
				</Col>
			</Row>

			{mode === 'create' && showDuplicateList && <ThesisDuplicateList />}
		</Form>
	);
}
