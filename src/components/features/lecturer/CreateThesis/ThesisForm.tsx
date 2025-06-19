// import { useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Space, Upload, message } from 'antd';

import ThesisSimilarList from '@/components/features/lecturer/CreateThesis/ThesisSimilarList';

const { TextArea } = Input;
const { Option } = Select;

export default function ThesisForm() {
	const [form] = Form.useForm();

	const handleSubmit = (values: unknown) => {
		console.log('Form values:', values);
	};

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
			onFinish={handleSubmit}
			requiredMark="optional"
			style={{ width: '100%' }}
		>
			<Form.Item
				name="titleEn"
				label={
					<span>
						Thesis Title (English name) <span style={{ color: 'red' }}>*</span>
					</span>
				}
				rules={[{ required: true, message: 'Please enter the English title' }]}
			>
				<Input placeholder="Enter your thesis title" />
			</Form.Item>

			<Form.Item
				name="titleVi"
				label={
					<span>
						Thesis Title (Vietnamese name){' '}
						<span style={{ color: 'red' }}>*</span>
					</span>
				}
				rules={[{ required: true }]}
			>
				<Input placeholder="Enter your thesis title" />
			</Form.Item>

			<Form.Item
				name="abbreviation"
				label={
					<span>
						Abbreviation <span style={{ color: 'red' }}>*</span>
					</span>
				}
				rules={[{ required: true }]}
			>
				<Input placeholder="Enter your thesis title abbreviation" />
			</Form.Item>

			<Form.Item
				name="field"
				label={
					<span>
						Field / Domain <span style={{ color: 'red' }}>*</span>
					</span>
				}
				rules={[{ required: true }]}
			>
				<Select placeholder="Select field of study">
					<Option value="Computer Science">Computer Science</Option>
					<Option value="Software Engineering">Software Engineering</Option>
				</Select>
			</Form.Item>

			<Form.Item
				name="description"
				label={
					<span>
						Thesis Description <span style={{ color: 'red' }}>*</span>
					</span>
				}
				rules={[{ required: true }]}
			>
				<TextArea placeholder="Describe your thesis" maxLength={500} rows={4} />
			</Form.Item>

			<Form.Item
				name="skills"
				label="Required Skills"
				rules={[{ required: true }]}
			>
				<Select mode="tags" placeholder="Add skills">
					<Option value="Python">Python</Option>
					<Option value="Machine Learning">Machine Learning</Option>
					<Option value="Database">Database</Option>
				</Select>
			</Form.Item>

			{/* Upload Section Inline */}
			<div style={{ marginBottom: 24 }}>
				<div style={{ marginBottom: 8, fontWeight: 500 }}>
					Supporting Documents <span style={{ color: 'red' }}>*</span>
				</div>
				<Upload.Dragger {...uploadProps}>
					<p>Click or drag file to upload</p>
					<p style={{ color: '#999' }}>
						Support for PDF, DOC, DOCX (Max: 10MB)
					</p>
				</Upload.Dragger>
				<Button
					icon={<DownloadOutlined />}
					type="link"
					style={{ marginTop: 8 }}
				>
					Download Template
				</Button>
			</div>

			<Space style={{ marginTop: 16 }} wrap>
				<Button type="primary" htmlType="submit">
					Submit Registration
				</Button>
				<Button type="default">Duplicate Thesis Detection</Button>
			</Space>

			<ThesisSimilarList />
		</Form>
	);
}
