import {
	CloudUploadOutlined,
	DownloadOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select, Upload, message } from 'antd';

import ThesisDuplicateList from '@/components/features/lecturer/CreateThesis/ThesisDuplicateList';

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
				rules={[
					{ required: true, message: 'Please enter the Vietnamese title' },
				]}
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
				rules={[{ required: true, message: 'Please enter the Abbreviation' }]}
			>
				<Input placeholder="Enter your thesis title abbreviation" />
			</Form.Item>

			<Form.Item
				name="field"
				label="Field / Domain"
				rules={[{ required: false }]}
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
				rules={[{ required: true, message: 'Please describe your thesis' }]}
			>
				<TextArea placeholder="Describe your thesis" maxLength={500} rows={4} />
			</Form.Item>

			<Form.Item
				name="skills"
				label="Required Skills"
				rules={[{ required: false }]}
			>
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
							Supporting Documents <span style={{ color: 'red' }}>*</span>
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
					getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
					rules={[
						{
							required: true,
							message: 'Please upload your supporting document',
						},
					]}
				>
					<Upload.Dragger {...uploadProps}>
						<p className="ant-upload-drag-icon">
							<CloudUploadOutlined />
						</p>
						<p>Click or drag file to upload</p>
						<p style={{ color: '#999' }}>
							Support for PDF, DOC, DOCX (Max: 10MB)
						</p>
					</Upload.Dragger>
				</Form.Item>{' '}
			</div>

			<Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
				<Col>
					<Button icon={<SearchOutlined />} type="primary">
						Duplicate Thesis Detection
					</Button>
				</Col>
				<Col>
					<Button type="primary" htmlType="submit">
						Submit Registration
					</Button>
				</Col>
			</Row>

			<ThesisDuplicateList />
		</Form>
	);
}
