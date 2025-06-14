'use client';

import { Button, Form, Input, Select } from 'antd';
import type { FormInstance } from 'antd/es/form';

const { Option } = Select;

const SemesterForm = ({ form }: { form: FormInstance }) => (
	<div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
		<h2 className="text-lg font-semibold mb-4">Add New Semester</h2>
		<Form form={form} layout="vertical">
			{/* Row 1: Season & Year */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.Item
					name="season"
					label={
						<span>
							Season <span className="text-red-500">*</span>
						</span>
					}
					rules={[{ required: true, message: 'Season is required' }]}
					required={false}
				>
					<Select placeholder="Select the season of semester">
						<Option value="Spring">Spring</Option>
						<Option value="Summer">Summer</Option>
						<Option value="Fall">Fall</Option>
					</Select>
				</Form.Item>

				<Form.Item
					name="year"
					label={
						<span>
							Year <span className="text-red-500">*</span>
						</span>
					}
					rules={[{ required: true, message: 'Year is required' }]}
					required={false}
				>
					<Select placeholder="Select the year for semester">
						<Option value="2025">2025</Option>
						<Option value="2026">2026</Option>
						<Option value="2027">2027</Option>
					</Select>
				</Form.Item>
			</div>

			{/* Row 2: Max Group */}
			<div className="mt-4">
				<h3 className="text-base font-medium mb-2">Semester Policy</h3>
				<Form.Item name="maxGroup" label="Max Group">
					<Input placeholder="Enter maximum number of groups" type="number" />
				</Form.Item>
			</div>

			{/* Action buttons */}
			<div className="flex justify-end space-x-2">
				<Button onClick={() => form.resetFields()}>Clear Form</Button>
				<Button type="primary" htmlType="submit">
					Save Semester
				</Button>
			</div>
		</Form>
	</div>
);

export default SemesterForm;
