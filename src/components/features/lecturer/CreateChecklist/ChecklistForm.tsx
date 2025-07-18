'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Row, Space, Switch, Table } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ChecklistCommonHeader from '@/components/features/lecturer/CreateChecklist/ChecklistCommonHeader';
import ChecklistDeleteButton from '@/components/features/lecturer/CreateChecklist/ChecklistDeleteButton';
import ChecklistDragger from '@/components/features/lecturer/CreateChecklist/ChecklistDragger';
import { showNotification } from '@/lib/utils/notification';
import { useChecklistStore } from '@/store';
import { useMilestoneStore } from '@/store/useMilestoneStore';

type Mode = 'import' | 'manual';

interface UnifiedChecklistFormProps {
	readonly mode: Mode;
}

export default function UnifiedChecklistForm({
	mode,
}: UnifiedChecklistFormProps) {
	const router = useRouter();
	const [form] = Form.useForm();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [checklistName, setChecklistName] = useState('');
	const [checklistDescription, setChecklistDescription] = useState('');
	const [showErrors, setShowErrors] = useState(false);
	const [selectedSemester, setSelectedSemester] = useState<string>('');
	const [selectedMilestone, setSelectedMilestone] = useState<string>('');
	const [isCreating, setIsCreating] = useState(false);

	const { createChecklist, createChecklistItems } = useChecklistStore();
	const { milestones, fetchMilestones } = useMilestoneStore();

	// Fetch milestones on component mount
	useEffect(() => {
		fetchMilestones();
	}, [fetchMilestones]);

	// Transform milestones for the dropdown
	const availableMilestones = milestones.map((milestone) => ({
		label: milestone.name,
		value: milestone.id,
	}));

	// Mock semesters for now (you can replace with real API later)
	const availableSemesters = [
		{ label: 'Spring 2024', value: 'spring-2024' },
		{ label: 'Summer 2024', value: 'summer-2024' },
		{ label: 'Fall 2024', value: 'fall-2024' },
		{ label: 'Spring 2025', value: 'spring-2025' },
	];

	const handleCancel = () => {
		form.resetFields();
		setFileList([]);
		setShowErrors(false);
		showNotification.info('Checklist action cancelled.');
	};

	const handleSaveAll = async () => {
		setShowErrors(true);
		setIsCreating(true);

		try {
			const values = await form.validateFields();

			// Validation checks
			if (!selectedMilestone) {
				showNotification.warning(
					'Missing Milestone',
					'Please select a milestone before saving.',
				);
				setIsCreating(false);
				return;
			}

			if (!checklistName.trim() || !checklistDescription.trim()) {
				showNotification.warning(
					'Missing Checklist Info',
					'Please provide checklist name and description.',
				);
				setIsCreating(false);
				return;
			}

			if (!values.items || values.items.length === 0) {
				showNotification.warning(
					'No items added',
					'Please add at least one checklist item before saving.',
				);
				setIsCreating(false);
				return;
			}

			// Step 1: Create the checklist
			const createdChecklist = await createChecklist({
				name: checklistName,
				description: checklistDescription,
				milestoneId: selectedMilestone,
			});

			if (!createdChecklist) {
				showNotification.error('Failed to create checklist');
				setIsCreating(false);
				return;
			}

			// Step 2: Create checklist items
			const checklistItems = values.items.map(
				(item: {
					name: string;
					description?: string;
					isRequired?: boolean;
				}) => ({
					name: item.name,
					description: item.description || '',
					isRequired: item.isRequired || false,
				}),
			);

			try {
				await createChecklistItems(createdChecklist.id, checklistItems);
				showNotification.success(
					`Checklist "${checklistName}" created successfully with ${checklistItems.length} items!`,
				);
			} catch (itemError) {
				console.error('Failed to create checklist items:', itemError);
				showNotification.warning(
					'Checklist created but failed to add some items. You can add them later in the edit page.',
				);
			}

			// Reset form
			form.resetFields();
			setChecklistName('');
			setChecklistDescription('');
			setSelectedSemester('');
			setSelectedMilestone('');
			setShowErrors(false);

			// Navigate to checklist management
			router.push('/lecturer/checklist-management');
		} catch (err) {
			console.error('Checklist creation failed', err);
			showNotification.error('Failed to create checklist');
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<ChecklistCommonHeader
				semester={selectedSemester}
				milestone={selectedMilestone}
				checklistName={checklistName}
				checklistDescription={checklistDescription}
				onNameChange={setChecklistName}
				onDescriptionChange={setChecklistDescription}
				onSemesterChange={setSelectedSemester}
				onMilestoneChange={setSelectedMilestone}
				availableSemesters={availableSemesters}
				availableMilestones={availableMilestones}
				showErrors={showErrors}
				loading={isCreating}
			/>

			<Card title="Checklist Items">
				{mode === 'import' && (
					<ChecklistDragger
						fileList={fileList}
						setFileList={setFileList}
						setChecklistItems={(items) =>
							form.setFieldsValue({
								items: items.map((item) => ({
									name: item.name,
									description: item.description,
									isRequired: item.isRequired,
								})),
							})
						}
					/>
				)}

				<Form form={form} name="checklist-form" layout="vertical">
					<Form.List name="items">
						{(fields, { add, remove }) => {
							const hasItems = fields.length > 0;

							return (
								<>
									{(mode === 'manual' || hasItems) && (
										<>
											<Table
												dataSource={fields}
												rowKey={(record) => record.key}
												pagination={false}
												locale={{ emptyText: 'No checklist items added.' }}
												columns={[
													{
														title: 'Item Name',
														dataIndex: 'name',
														key: 'name',
														render: (_, field) => (
															<Form.Item
																name={[field.name, 'name']}
																style={{ marginBottom: 0 }}
																rules={[
																	{ required: true, message: 'Required' },
																]}
																validateStatus={
																	showErrors &&
																	!form.getFieldValue([
																		'items',
																		field.name,
																		'name',
																	])
																		? 'error'
																		: ''
																}
															>
																<Input placeholder="Enter item name" />
															</Form.Item>
														),
													},
													{
														title: 'Description',
														dataIndex: 'description',
														key: 'description',
														render: (_, field) => (
															<Form.Item
																name={[field.name, 'description']}
																style={{ marginBottom: 0 }}
																rules={[
																	{ required: true, message: 'Required' },
																]}
																validateStatus={
																	showErrors &&
																	!form.getFieldValue([
																		'items',
																		field.name,
																		'description',
																	])
																		? 'error'
																		: ''
																}
															>
																<Input placeholder="Enter description" />
															</Form.Item>
														),
													},
													{
														title: 'Required',
														dataIndex: 'isRequired',
														key: 'isRequired',
														align: 'center' as const,
														width: 120,
														render: (_, field) => (
															<Form.Item
																name={[field.name, 'isRequired']}
																style={{ marginBottom: 0 }}
																valuePropName="checked"
															>
																<Switch
																	checkedChildren="Mandatory"
																	unCheckedChildren="Optional"
																/>
															</Form.Item>
														),
													},
													{
														title: 'Action',
														key: 'action',
														width: 80,
														align: 'center' as const,
														render: (_, field) => (
															<div
																style={{
																	display: 'flex',
																	justifyContent: 'center',
																}}
															>
																<Form.Item noStyle>
																	<ChecklistDeleteButton
																		onDelete={() => remove(field.name)}
																	/>
																</Form.Item>
															</div>
														),
													},
												]}
											/>

											<Row
												justify={mode === 'manual' ? 'space-between' : 'end'}
												style={{ marginTop: 16 }}
											>
												{mode === 'manual' && (
													<Button
														icon={<PlusOutlined />}
														onClick={() => add()}
														disabled={isCreating}
													>
														Add New Item
													</Button>
												)}

												<Space>
													<Button onClick={handleCancel} disabled={isCreating}>
														Cancel
													</Button>
													<Button
														type="primary"
														onClick={handleSaveAll}
														loading={isCreating}
													>
														{mode === 'manual'
															? 'Save All'
															: 'Import All Checklist'}
													</Button>
												</Space>
											</Row>
										</>
									)}
								</>
							);
						}}
					</Form.List>
				</Form>
			</Card>
		</Space>
	);
}
