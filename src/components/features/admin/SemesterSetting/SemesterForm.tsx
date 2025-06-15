'use client';

import {
	Button,
	Card,
	Col,
	Form,
	Input,
	Row,
	Select,
	Space,
	Typography,
} from 'antd';
import type { FormInstance } from 'antd/es/form';

const { Option } = Select;
const { Title } = Typography;

const SemesterForm = ({ form }: { form: FormInstance }) => {
	const generateYearOptions = () => {
		const currentYear = new Date().getFullYear();
		const years = [];
		for (let i = 0; i <= 20; i++) {
			years.push(currentYear + i);
		}
		return years;
	};

	const yearOptions = generateYearOptions();

	return (
		<Card>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Title level={4} style={{ marginBottom: 0 }}>
					Add New Semester
				</Title>

				<Form form={form} layout="vertical">
					<Row gutter={16}>
						<Col xs={24} md={12}>
							<Form.Item
								name="season"
								label="Season"
								rules={[
									{ required: true, message: 'Season of semester is required' },
								]}
								required
							>
								<Select placeholder="Select the season of semester">
									<Option value="Spring">Spring</Option>
									<Option value="Summer">Summer</Option>
									<Option value="Fall">Fall</Option>
								</Select>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								name="year"
								label="Year"
								rules={[
									{ required: true, message: 'Year for semester is required' },
								]}
								required
							>
								<Select placeholder="Select the year for semester">
									{yearOptions.map((year) => (
										<Option key={year} value={year.toString()}>
											{year}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Space direction="vertical" size="small" style={{ width: '100%' }}>
						<Title level={5} style={{ marginBottom: 8 }}>
							Semester Policy
						</Title>
						<Form.Item name="maxGroup" label="Max Group">
							<Input
								placeholder="Enter maximum number of groups"
								type="number"
							/>
						</Form.Item>
					</Space>

					<Row justify="end">
						<Space>
							<Button onClick={() => form.resetFields()}>Clear Form</Button>
							<Button type="primary" htmlType="submit">
								Create Semester
							</Button>
						</Space>
					</Row>
				</Form>
			</Space>
		</Card>
	);
};

export default SemesterForm;
