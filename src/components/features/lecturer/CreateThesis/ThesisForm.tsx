'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import { useEffect, useState } from 'react';

import ThesisDuplicateList from '@/components/features/lecturer/CreateThesis/ThesisDuplicateList';
import SupportingDocumentField from '@/components/features/lecturer/CreateThesis/ThesisFileUpload';

const { TextArea } = Input;
const { Option } = Select;

type Props = Readonly<{
	mode: 'create' | 'edit';
	initialValues?: Record<string, unknown>;
	onSubmit: (values: Record<string, unknown>) => void;
}>;

interface UploadedFile {
	name: string;
	size: number;
}

export default function ThesisForm({ mode, initialValues, onSubmit }: Props) {
	const [form] = Form.useForm();
	const [showDuplicateList, setShowDuplicateList] = useState(false);
	const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

	useEffect(() => {
		if (
			mode === 'edit' &&
			Array.isArray(initialValues?.supportingDocument) &&
			initialValues.supportingDocument.length > 0
		) {
			const file = initialValues.supportingDocument[0];
			setUploadedFile({
				name: file.name,
				size: file.size,
			});
		}
	}, [mode, initialValues]);

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
				<SupportingDocumentField
					mode={mode}
					initialFile={uploadedFile ?? undefined}
					onFileChange={(file) => {
						setUploadedFile(file);
						form.setFieldValue('supportingDocument', file ? [file] : []);
					}}
				/>
			</div>

			<Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
				<Col>
					<Button
						icon={<SearchOutlined />}
						type="primary"
						onClick={() => setShowDuplicateList(true)}
					>
						Duplicate Thesis Detection
					</Button>
				</Col>

				<Col>
					<Button type="primary" htmlType="submit">
						{mode === 'create' ? 'Submit Registration' : 'Resubmit Thesis'}
					</Button>
				</Col>
			</Row>

			{showDuplicateList && <ThesisDuplicateList />}
		</Form>
	);
}
