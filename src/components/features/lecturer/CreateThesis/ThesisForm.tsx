'use client';

import { Button, Col, Form, Input, Row, Select, TreeSelect } from 'antd';
import { useEffect, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import SupportingDocumentField from '@/components/features/lecturer/CreateThesis/ThesisFileUpload';
import { getSortedDomains } from '@/lib/constants/domains';
import { useSkillSetStore } from '@/store';
import { useSemesterStore } from '@/store/useSemesterStore';

type Props = Readonly<{
	mode: 'create' | 'edit';
	initialValues?: Record<string, unknown>;
	initialFile?: {
		name: string;
		size: number;
		url?: string;
	} | null;
	onSubmit: (values: Record<string, unknown>) => void;
	loading?: boolean;
}>;

interface UploadedFile {
	name: string;
	size: number;
	url?: string;
}

export default function ThesisForm({
	mode,
	initialValues,
	initialFile,
	onSubmit,
	loading = false,
}: Props) {
	const [form] = Form.useForm();
	const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
	const [hasFileChanged, setHasFileChanged] = useState(false);

	// Get sorted domain options
	const domainOptions = getSortedDomains();

	// Skill sets store
	const {
		skillSets,
		loading: skillSetsLoading,
		fetchSkillSets,
	} = useSkillSetStore();

	// Semester store
	const {
		semesters,
		fetchSemesters,
		loading: semestersLoading,
	} = useSemesterStore();

	// Build tree data for TreeSelect
	const skillTreeData = skillSets.map((skillSet) => ({
		value: skillSet.id,
		title: skillSet.name,
		selectable: false, // Skill set categories are not selectable
		children: skillSet.skills.map((skill) => ({
			value: skill.id,
			title: skill.name,
		})),
	}));

	// Fetch skill sets on component mount
	useEffect(() => {
		fetchSkillSets();
		fetchSemesters(); // Fetch semesters to get the preparing semester
	}, [fetchSkillSets, fetchSemesters]);

	// Find the preparing semester
	const preparingSemester = semesters.find(
		(semester) =>
			semester.status === 'Preparing' || semester.status === 'Picking',
	);

	useEffect(() => {
		// Initialize uploaded file from initialFile prop (for edit mode)
		if (initialFile) {
			setUploadedFile(initialFile);
			setHasFileChanged(false); // Reset flag for initial file
		} else if (
			mode === 'edit' &&
			Array.isArray(initialValues?.supportingDocument) &&
			initialValues.supportingDocument.length > 0
		) {
			const file = initialValues.supportingDocument[0];
			setUploadedFile({
				name: file.name,
				size: file.size,
				url: file.url,
			});
			setHasFileChanged(false); // Reset flag for initial file
		}
	}, [mode, initialValues, initialFile]);

	// Handle file change from upload component
	const handleFileChange = (file: UploadedFile | null) => {
		setUploadedFile(file);
		setHasFileChanged(true); // Mark as changed when user uploads/deletes file
	};

	const handleFormSubmit = (values: Record<string, unknown>) => {
		// Convert selected skills to string array
		const selectedSkills = (values.skills as string[]) ?? [];

		// Get the preparing semester ID
		const semesterId = preparingSemester?.id;
		if (!semesterId) {
			console.error(
				'No preparing semester found. Available semesters:',
				semesters,
			);
			// You might want to show a user-friendly error message here
			return;
		}

		// Prepare the final form data to match backend DTO
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { supportingDocument, skills, ...restValues } = values;
		const formData: Record<string, unknown> = {
			...restValues,
			skillIds: selectedSkills, // Pass skills as skillIds array for API
			semesterId, // Add semesterId from preparing semester
		};

		// Only include supportingDocument if file changed (for edit mode) or always for create mode
		if (mode === 'create' || hasFileChanged) {
			formData.supportingDocument = uploadedFile?.url ?? '';
		}

		onSubmit(formData);
	};

	// Helper function to get button text based on mode and loading state
	const getButtonText = () => {
		if (semestersLoading) {
			return 'Loading semesters...';
		}
		if (!preparingSemester) {
			return 'No preparing semester found';
		}
		if (loading) {
			return mode === 'create' ? 'Creating...' : 'Updating...';
		}
		return mode === 'create' ? 'Create Thesis' : 'Update Thesis';
	};

	return (
		<Form
			form={form}
			layout="vertical"
			requiredMark={false}
			style={{ width: '100%' }}
			initialValues={initialValues}
			onFinish={handleFormSubmit}
		>
			<Form.Item
				name="englishName"
				label={
					<FormLabel text="Thesis Title (English name)" isRequired isBold />
				}
				rules={[{ required: true, message: 'Please enter your English title' }]}
			>
				<Input placeholder="Enter your English title" />
			</Form.Item>

			<Form.Item
				name="vietnameseName"
				label={
					<FormLabel text="Thesis Title (Vietnamese name)" isRequired isBold />
				}
				rules={[
					{ required: true, message: 'Please enter your Vietnamese title' },
				]}
			>
				<Input placeholder="Enter your Vietnamese title" />
			</Form.Item>

			<Form.Item
				name="abbreviation"
				label={<FormLabel text="Abbreviation" isRequired isBold />}
				rules={[{ required: true, message: 'Please enter an abbreviation' }]}
			>
				<Input placeholder="Enter abbreviation" />
			</Form.Item>

			<Form.Item
				name="domain"
				label={<FormLabel text="Field / Domain" isBold />}
			>
				<Select
					showSearch
					placeholder="Select field of study"
					filterOption={(input, option) =>
						(option?.value as string)
							?.toLowerCase()
							.includes(input.toLowerCase())
					}
				>
					{domainOptions.map((domain: string) => (
						<Select.Option key={domain} value={domain}>
							{domain}
						</Select.Option>
					))}
				</Select>
			</Form.Item>

			<Form.Item
				name="description"
				label={<FormLabel text="Thesis Description" isRequired isBold />}
				rules={[{ required: true, message: 'Please describe your thesis' }]}
			>
				<Input.TextArea
					placeholder="Describe your thesis..."
					rows={4}
					showCount
					maxLength={1000}
				/>
			</Form.Item>

			<Form.Item
				name="skills"
				label={<FormLabel text="Required Skills" isBold />}
			>
				<TreeSelect
					showSearch
					multiple
					style={{ width: '100%' }}
					placeholder="Select required skills"
					treeData={skillTreeData}
					treeDefaultExpandAll={false}
					allowClear
					loading={skillSetsLoading}
					filterTreeNode={(input, treeNode) =>
						(treeNode.title as string)
							.toLowerCase()
							.includes(input.toLowerCase())
					}
					dropdownStyle={{
						maxHeight: 400,
						overflow: 'auto',
					}}
					treeCheckable={true}
					showCheckedStrategy={TreeSelect.SHOW_CHILD}
				/>
			</Form.Item>

			<div style={{ marginBottom: 24 }}>
				<SupportingDocumentField
					mode={mode}
					initialFile={initialFile ?? undefined}
					onFileChange={(file) => {
						handleFileChange(file);
						// Set form field for validation purposes, but we'll use the URL in submit
						form.setFieldValue('supportingDocument', file ? [file] : []);
					}}
				/>
			</div>

			<Row justify="end" align="middle">
				<Col>
					<Button
						type="primary"
						htmlType="submit"
						size="large"
						loading={loading || semestersLoading}
						disabled={loading || semestersLoading || !preparingSemester}
					>
						{getButtonText()}
					</Button>
				</Col>
			</Row>
		</Form>
	);
}
