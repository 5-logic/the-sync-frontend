import React from "react";
import { Form, InputNumber, Select, Space, Row, Col, Button, Card } from "antd";
import { Header } from "@/components/common/Header";
import { FormLabel } from "@/components/common/FormLabel";

const { Option } = Select;

export interface CreateFormValues {
	semester: string;
	numberOfGroups: number;
}

interface CreateFormProps {
	onGenerate: (values: CreateFormValues) => void;
}

const CreateForm: React.FC<CreateFormProps> = ({ onGenerate }) => {
	const [form] = Form.useForm<CreateFormValues>();

	const handleFinish = (values: CreateFormValues) => {
		onGenerate(values);
		form.resetFields(["numberOfGroups"]);
	};

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Header
				title="Admin Create Group"
				description="Create and manage groups for capstone projects."
			/>

			<Card>
				<Form
					id="CreateForm"
					form={form}
					layout="vertical"
					onFinish={handleFinish}
					requiredMark={false}
				>
					<Row gutter={16}>
						<Col xs={24} sm={12}>
							<Form.Item
								label={<FormLabel text="Semester" isRequired={true} />}
								name="semester"
								rules={[{ required: true, message: "Please select semester" }]}
							>
								<Select placeholder="Select semester">
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
									min={1}
									style={{ width: "100%" }}
									placeholder="Enter number"
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
							<Button htmlType="button" onClick={() => form.resetFields()}>
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
