'use client';

import { Button, Col, Form, Input, Row, Select, TreeSelect } from 'antd';
import { useEffect, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import SupportingDocumentField from '@/components/features/lecturer/CreateThesis/ThesisFileUpload';
import { getSortedDomains } from '@/lib/constants/domains';
import { StorageService } from '@/lib/services/storage.service';
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
	thesis?: {
		status?: string;
		semesterId?: string;
	} | null;
}>;

interface UploadedFile {
	name: string;
	size: number;
	url?: string;
}

interface FileChangeState {
	action: 'none' | 'delete' | 'replace';
	newFile?: File;
	originalFileUrl?: string; // Store original file URL to delete later
}

export default function ThesisForm({
	mode,
	initialValues,
	initialFile,
	onSubmit,
	loading = false,
	thesis = null,
}: Props) {
	const [form] = Form.useForm();
	const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
	const [hasFileChanged, setHasFileChanged] = useState(false);
	const [hasFormChanged, setHasFormChanged] = useState(false);
	const [fileChangeState, setFileChangeState] = useState<FileChangeState>({
		action: 'none',
		originalFileUrl: initialFile?.url,
	});

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

	// Get current semester (the one that thesis belongs to)
	const currentSemester = thesis?.semesterId
		? semesters.find((s) => s.id === thesis.semesterId)
		: null;

	// Check if editing is allowed
	const isEditAllowed = () => {
		if (mode === 'create') {
			// For create mode, need preparing semester
			return !!preparingSemester;
		}

		if (mode === 'edit') {
			// For edit mode, check specific conditions
			if (!currentSemester) return false;

			// Don't allow if thesis status is pending
			if (thesis?.status === 'Pending') return false;

			// Allow if semester status is Preparing, Picking, or Ongoing with ScopeAdjustable
			if (
				currentSemester.status === 'Preparing' ||
				currentSemester.status === 'Picking'
			) {
				return true;
			}

			if (
				currentSemester.status === 'Ongoing' &&
				currentSemester.ongoingPhase === 'ScopeAdjustable'
			) {
				return true;
			}

			return false;
		}

		return false;
	};

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

	// Initialize form change state after initial values are set
	useEffect(() => {
		if (mode === 'edit' && initialValues) {
			// Reset change state when initial values are loaded
			setHasFormChanged(false);
			setHasFileChanged(false);
		}
	}, [mode, initialValues]);

	// Function to check if form values have changed
	const checkFormChanges = () => {
		if (mode === 'create') {
			setHasFormChanged(true);
			return;
		}

		// Don't check changes if initial values haven't been set yet
		if (!initialValues) {
			return;
		}

		const currentValues = form.getFieldsValue();

		// Compare current values with initial values
		const fieldsToCompare = [
			'englishName',
			'vietnameseName',
			'abbreviation',
			'description',
			'domain',
			'skills',
		];
		const hasChanges = fieldsToCompare.some((field) => {
			const currentValue = currentValues[field];
			const initialValue = initialValues?.[field];

			// Handle array comparison for skills
			if (field === 'skills') {
				const currentSkills = Array.isArray(currentValue)
					? currentValue.toSorted((a: string, b: string) => a.localeCompare(b))
					: [];
				const initialSkills = Array.isArray(initialValue)
					? initialValue.toSorted((a: string, b: string) => a.localeCompare(b))
					: [];
				return JSON.stringify(currentSkills) !== JSON.stringify(initialSkills);
			}

			// Handle other fields
			return currentValue !== initialValue;
		});

		setHasFormChanged(hasChanges || hasFileChanged);
	};

	// Handle file change from upload component
	const handleFileChange = (file: UploadedFile | null) => {
		setUploadedFile(file);
		setHasFileChanged(true); // Mark as changed when user uploads/deletes file
		checkFormChanges(); // Check for overall changes
	};

	// Function to get only changed fields
	const getChangedFields = (values: Record<string, unknown>) => {
		if (mode === 'create') {
			// For create mode, return all values
			const selectedSkills = (values.skills as string[]) ?? [];
			const semesterId = preparingSemester?.id;

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { supportingDocument, skills, ...restValues } = values;
			return {
				...restValues,
				skillIds: selectedSkills,
				semesterId,
				supportingDocument: uploadedFile?.url ?? '',
			};
		}

		// For edit mode, only include changed fields
		const changedFields: Record<string, unknown> = {};
		const currentValues = form.getFieldsValue();

		// Check each field for changes
		const fieldsToCheck = [
			'englishName',
			'vietnameseName',
			'abbreviation',
			'description',
			'domain',
		];
		fieldsToCheck.forEach((field) => {
			const currentValue = currentValues[field];
			const initialValue = initialValues?.[field];

			// Special handling for domain field: treat empty string and undefined as equivalent
			if (field === 'domain') {
				const normalizedCurrent =
					currentValue === undefined ? '' : currentValue;
				const normalizedInitial =
					initialValue === undefined || initialValue === '' ? '' : initialValue;
				if (normalizedCurrent !== normalizedInitial) {
					changedFields[field] = normalizedCurrent;
				}
			} else {
				// Regular comparison for other fields
				if (currentValue !== initialValue) {
					changedFields[field] = currentValue;
				}
			}
		});

		// Handle skills separately
		const currentSkills = Array.isArray(currentValues.skills)
			? currentValues.skills.toSorted((a: string, b: string) =>
					a.localeCompare(b),
				)
			: [];
		const initialSkills = Array.isArray(initialValues?.skills)
			? initialValues.skills.toSorted((a: string, b: string) =>
					a.localeCompare(b),
				)
			: [];
		if (JSON.stringify(currentSkills) !== JSON.stringify(initialSkills)) {
			// Always send skillIds even if it's an empty array (when user clears all skills)
			changedFields.skillIds = currentSkills;
		}

		// Note: supportingDocument will be handled in handleFormSubmit for edit mode
		// to properly handle file upload/delete operations

		return changedFields;
	};

	const handleFormSubmit = async (values: Record<string, unknown>) => {
		let formData = getChangedFields(values);

		// Handle file operations for edit mode only
		if (
			mode === 'edit' &&
			hasFileChanged &&
			fileChangeState.action !== 'none'
		) {
			try {
				if (fileChangeState.action === 'delete') {
					// Delete the original file
					if (fileChangeState.originalFileUrl) {
						await StorageService.deleteFile(fileChangeState.originalFileUrl);
					}
					formData = { ...formData, supportingDocument: '' };
				} else if (
					fileChangeState.action === 'replace' &&
					fileChangeState.newFile
				) {
					// Upload new file
					const newFileUrl = await StorageService.uploadFile(
						fileChangeState.newFile,
						'support-doc',
					);

					// Delete old file if exists
					if (fileChangeState.originalFileUrl) {
						await StorageService.deleteFile(fileChangeState.originalFileUrl);
					}

					formData = { ...formData, supportingDocument: newFileUrl };
				}
			} catch (error) {
				console.error('Error handling file operations:', error);
				// Continue with form submission even if file operations fail
				// The error notification is already shown by StorageService
			}
		}

		onSubmit(formData);
	};

	// Helper function to get button text based on mode and loading state
	const getButtonText = () => {
		if (semestersLoading) {
			return 'Loading semesters...';
		}
		if (!isEditAllowed()) {
			if (mode === 'create') {
				return 'No preparing semester found';
			} else {
				return 'Editing not allowed';
			}
		}
		if (loading) {
			return mode === 'create' ? 'Creating...' : 'Updating...';
		}
		if (mode === 'edit' && !hasFormChanged) {
			return 'No changes to update';
		}
		return mode === 'create' ? 'Create Thesis' : 'Update Thesis';
	};

	return (
		<Form
			form={form}
			layout="vertical"
			requiredMark={false}
			style={{ width: '100%' }}
			initialValues={{
				...initialValues,
				// Convert empty string to undefined for domain field to show placeholder
				domain:
					initialValues?.domain === '' ? undefined : initialValues?.domain,
				// Set proper initial value for supportingDocument field to prevent auto-reset
				supportingDocument: initialFile ? [initialFile] : [],
			}}
			onFinish={handleFormSubmit}
			onValuesChange={checkFormChanges} // Detect changes when form values change
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
					allowClear
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
					maxLength={2000}
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
					onFileChangeStateUpdate={setFileChangeState}
				/>
			</div>

			<Row justify="end" align="middle">
				<Col>
					<Button
						type="primary"
						htmlType="submit"
						size="large"
						loading={loading || semestersLoading}
						disabled={
							loading ||
							semestersLoading ||
							!isEditAllowed() ||
							(mode === 'edit' && !hasFormChanged)
						}
					>
						{getButtonText()}
					</Button>
				</Col>
			</Row>
		</Form>
	);
}
