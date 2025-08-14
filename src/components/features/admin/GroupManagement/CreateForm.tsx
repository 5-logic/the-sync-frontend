import React, { useCallback } from "react";
import { Form, InputNumber, Select, Space, Row, Col, Button, Card } from "antd";
import { Header } from "@/components/common/Header";
import { FormLabel } from "@/components/common/FormLabel";
import { SEMESTER_STATUS_TAGS } from "@/lib/constants/semester";

const { Option } = Select;

// Constants
const MIN_GROUPS = 1;
const MAX_GROUPS = 100; // From schema validation
const FORM_ID = "group-management-form";

export interface CreateFormValues {
	semesterId: string;
	numberOfGroups: number;
}

interface CreateFormProps {
	onGenerate: (values: CreateFormValues) => void;
	loading?: boolean;
	semesters?: Array<{
		id: string;
		name: string;
		code: string;
		status: string;
	}>;
}

const CreateForm: React.FC<CreateFormProps> = ({
	onGenerate,
	loading = false,
	semesters = [],
}) => {
	const [form] = Form.useForm<CreateFormValues>();

	const handleFinish = useCallback(
		(values: CreateFormValues) => {
			onGenerate(values);
			form.resetFields(["numberOfGroups"]);
		},
		[form, onGenerate],
	);

	const handleReset = useCallback(() => {
		form.resetFields();
	}, [form]);

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Header
				title="Group Management"
				description="Create and manage groups for capstone projects."
			/>

			<Card>
				<Form
					id={FORM_ID}
					form={form}
					layout="vertical"
					onFinish={handleFinish}
					requiredMark={false}
					aria-label="Group creation form"
				>
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item
								label={<FormLabel text="Semester" isRequired={true} />}
								name="semesterId"
								rules={[{ required: true, message: "Please select semester" }]}
							>
								<Select
									placeholder="Select semester"
									aria-label="Select semester"
									loading={loading}
									disabled={loading}
								>
									{semesters.map((semester) => (
										<Option key={semester.id} value={semester.id}>
											<Space>
												<span>{semester.name}</span>
												{
													SEMESTER_STATUS_TAGS[
														semester.status as keyof typeof SEMESTER_STATUS_TAGS
													]
												}
											</Space>
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>

						<Col xs={24} sm={12}>
							<Form.Item
								label={
									<FormLabel
										text="Number of Groups to Create"
										isRequired={true}
									/>
								}
								name="numberOfGroups"
								rules={[
									{ required: true, message: "Enter number of groups" },
									{
										type: "number",
										min: MIN_GROUPS,
										max: MAX_GROUPS,
										message: `Number must be between ${MIN_GROUPS} and ${MAX_GROUPS}`,
									},
								]}
							>
								<InputNumber
									min={MIN_GROUPS}
									max={MAX_GROUPS}
									style={{ width: "100%" }}
									placeholder="Enter number"
									aria-label="Number of groups to create"
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row justify="end" gutter={8}>
						<Col>
							<Button
								type="primary"
								htmlType="submit"
								loading={loading}
								disabled={loading}
							>
								Generate
							</Button>
						</Col>
						<Col>
							<Button
								htmlType="button"
								onClick={handleReset}
								disabled={loading}
							>
								Reset
							</Button>
						</Col>
					</Row>
				</Form>
			</Card>
		</Space>
	);
};

export default CreateForm;
