'use client';

import { PlusOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Empty,
	Form,
	Input,
	Row,
	Space,
	Switch,
	Table,
} from 'antd';
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
	const [checklistName, setChecklistName] = useState('');
	const [checklistDescription, setChecklistDescription] = useState('');
	const [showErrors, setShowErrors] = useState(false);
	const [selectedMilestone, setSelectedMilestone] = useState<string>('');
	const [isCreating, setIsCreating] = useState(false);

	const { createChecklist, createChecklistItems } = useChecklistStore();
	const {
		milestones,
		fetchMilestones,
		loading: milestonesLoading,
	} = useMilestoneStore();

	// Fetch milestones on component mount
	useEffect(() => {
		fetchMilestones();
	}, [fetchMilestones]);

	// Transform milestones for the dropdown
	const availableMilestones = milestones.map((milestone) => ({
		label: milestone.name,
		value: milestone.id,
	}));

	// Don't show full skeleton for just milestone loading - let the component render with loading state

	const handleBack = () => {
		form.resetFields();
		setShowErrors(false);
		router.push('/lecturer/checklist-management');
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

			if (!checklistName.trim()) {
				showNotification.warning(
					'Missing Checklist Info',
					'Please provide checklist name.',
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
				description: checklistDescription.trim() || '',
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
				milestone={selectedMilestone}
				checklistName={checklistName}
				checklistDescription={checklistDescription}
				onNameChange={setChecklistName}
				onDescriptionChange={setChecklistDescription}
				onMilestoneChange={setSelectedMilestone}
				availableMilestones={availableMilestones}
				showErrors={showErrors}
				loading={isCreating}
				milestonesLoading={milestonesLoading}
			/>

			<Card title="Checklist Items">
				{mode === 'import' && (
					<ChecklistDragger
						setChecklistItems={(items) =>
							form.setFieldsValue({
								items: items.map((item) => ({
									name: item.name,
									description: item.description,
									isRequired: item.isRequired,
								})),
							})
						}
						loading={isCreating}
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
												locale={{
													emptyText: (
														<Empty
															image={Empty.PRESENTED_IMAGE_SIMPLE}
															description="No checklist items added yet"
														/>
													),
												}}
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
														title: 'Priority',
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
														type="primary"
														icon={<PlusOutlined />}
														onClick={() => add()}
														disabled={isCreating}
													>
														Add New Item
													</Button>
												)}

												{mode === 'import' && hasItems && (
													<Space>
														<Button onClick={handleBack} disabled={isCreating}>
															Back
														</Button>
														<Button
															type="primary"
															onClick={handleSaveAll}
															loading={isCreating}
														>
															Import All Checklist
														</Button>
													</Space>
												)}
											</Row>
										</>
									)}
								</>
							);
						}}
					</Form.List>
				</Form>
			</Card>

			{mode === 'manual' && (
				<Row justify="end">
					<Space>
						<Button onClick={handleBack} disabled={isCreating}>
							Back
						</Button>
						<Button type="primary" onClick={handleSaveAll} loading={isCreating}>
							Save All
						</Button>
					</Space>
				</Row>
			)}
		</Space>
	);
}
