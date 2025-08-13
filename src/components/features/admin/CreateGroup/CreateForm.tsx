import React from "react";
import {
	Form,
	InputNumber,
	Input,
	Button,
	Select,
	Space,
	Row,
	Col,
} from "antd";
import { Header } from "@/components/common/Header";
import { FormLabel } from "@/components/common/FormLabel";

const { Option } = Select;

export interface CreateFormValues {
	semester: string;
	numberOfGroups: number;
	maxMembers?: number;
	prefix?: string;
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
			<Form form={form} layout="vertical" onFinish={handleFinish}>
				<Row gutter={16}>
					<Col xs={24} sm={12}>
						<Form.Item
							label={<FormLabel text="Semester" isRequired />}
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
							label={<FormLabel text="Number of Groups to Create" isRequired />}
							name="numberOfGroups"
							rules={[{ required: true, message: "Enter number of groups" }]}
						>
							<InputNumber
								min={1}
								max={50}
								style={{ width: "100%" }}
								placeholder="Enter number (1-50)"
							/>
						</Form.Item>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col xs={24} sm={12}>
						<Form.Item
							label={<FormLabel text="Max Members per Group" />}
							name="maxMembers"
							initialValue={5}
						>
							<InputNumber min={1} max={10} style={{ width: "100%" }} />
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							label={<FormLabel text="Group Name Prefix" />}
							name="prefix"
						>
							<Input placeholder="e.g., Group" />
						</Form.Item>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col xs={24} sm={12}>
						<Form.Item>
							<Button type="primary" htmlType="submit" block>
								Generate Groups
							</Button>
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item>
							<Button
								htmlType="button"
								block
								onClick={() => form.resetFields()}
							>
								Reset
							</Button>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Space>
	);
};

export default CreateForm;
