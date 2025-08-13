import React from "react";
import { Card, Form, InputNumber, Input, Button, Select } from "antd";

const { Option } = Select;

export interface BulkCreateFormValues {
	semester: string;
	numberOfGroups: number;
	maxMembers?: number;
	prefix?: string;
}

interface BulkCreateFormProps {
	onGenerate: (values: BulkCreateFormValues) => void;
}

const BulkCreateForm: React.FC<BulkCreateFormProps> = ({ onGenerate }) => {
	const [form] = Form.useForm<BulkCreateFormValues>();

	const handleFinish = (values: BulkCreateFormValues) => {
		onGenerate(values);
		form.resetFields(["numberOfGroups"]);
	};

	return (
		<Card title="Create Multiple Groups" bordered={false}>
			<Form form={form} layout="vertical" onFinish={handleFinish}>
				<Form.Item
					label="Semester"
					name="semester"
					rules={[{ required: true, message: "Please select semester" }]}
				>
					<Select placeholder="Select semester">
						<Option value="Fall 2025">Fall 2025</Option>
						<Option value="Summer 2025">Summer 2025</Option>
					</Select>
				</Form.Item>

				<Form.Item
					label="Number of Groups to Create"
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

				<Form.Item
					label="Max Members per Group"
					name="maxMembers"
					initialValue={5}
				>
					<InputNumber min={1} max={10} style={{ width: "100%" }} />
				</Form.Item>

				<Form.Item label="Group Name Prefix" name="prefix">
					<Input placeholder="e.g., Group" />
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit" block>
						Generate Groups
					</Button>
				</Form.Item>

				<Form.Item>
					<Button htmlType="button" block onClick={() => form.resetFields()}>
						Reset
					</Button>
				</Form.Item>
			</Form>
		</Card>
	);
};

export default BulkCreateForm;
