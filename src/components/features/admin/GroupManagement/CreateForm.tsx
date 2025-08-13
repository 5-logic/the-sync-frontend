import React, { useCallback } from "react";
import { Form, InputNumber, Select, Space, Row, Col, Button, Card } from "antd";
import { Header } from "@/components/common/Header";
import { FormLabel } from "@/components/common/FormLabel";

const { Option } = Select;

// Constants
const MIN_GROUPS = 1;
const FORM_ID = "group-management-form";

export interface CreateFormValues {
	semester: string;
	numberOfGroups: number;
}

interface CreateFormProps {
	onGenerate: (values: CreateFormValues) => void;
}

const CreateForm: React.FC<CreateFormProps> = ({ onGenerate }) => {
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
								name="semester"
								rules={[{ required: true, message: "Please select semester" }]}
							>
								<Select
									placeholder="Select semester"
									aria-label="Select semester"
								>
									<Option value="Fall 2025">Fall 2025</Option>
									<Option value="Summer 2025">Summer 2025</Option>
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
								rules={[{ required: true, message: "Enter number of groups" }]}
							>
								<InputNumber
									min={MIN_GROUPS}
									style={{ width: "100%" }}
									placeholder="Enter number"
									aria-label="Number of groups to create"
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row justify="end" gutter={8}>
						<Col>
							<Button type="primary" htmlType="submit">
								Generate
							</Button>
						</Col>
						<Col>
							<Button htmlType="button" onClick={handleReset}>
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
