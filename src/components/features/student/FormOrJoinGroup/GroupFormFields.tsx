import { Col, Form, Input, Row, Select, TreeSelect } from 'antd';

import { FormLabel } from '@/components/common/FormLabel';
import mockSkills from '@/data/skill';
import mockSkillSets from '@/data/skillSet';
import { mockTheses } from '@/data/thesis';

const projectAreas = Array.from(new Set(mockTheses.map((t) => t.domain))).map(
	(domain) => ({
		value: domain,
		label: domain,
	}),
);

const buildSkillTreeData = () =>
	mockSkillSets.map((set) => ({
		value: set.id,
		title: set.name,
		selectable: false,
		children: mockSkills
			.filter((sk) => sk.skillSetId === set.id)
			.map((sk) => ({
				value: sk.id,
				title: sk.name,
			})),
	}));

const skillTreeData = buildSkillTreeData();

const responsibilityOptions = [
	{ value: 'Researcher', label: 'Researcher' },
	{ value: 'Developer', label: 'Developer' },
];

export default function GroupFormFields() {
	return (
		<Row gutter={[16, 16]}>
			<Col xs={24} md={12}>
				<Form.Item
					name="name"
					label={
						<span style={{ fontWeight: 600 }}>
							Group Name
							<span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
						</span>
					}
					rules={[
						{ required: true, message: 'Please enter group name' },
						{ min: 3, message: 'Group name must be at least 3 characters' },
						{
							max: 50,
							message: 'Group name must be less than 50 characters',
						},
					]}
				>
					<Input placeholder="Enter group name" />
				</Form.Item>
			</Col>
			<Col xs={24} md={12}>
				<Form.Item
					name="area"
					label={<FormLabel text="Project Direction or Area" isBold />}
				>
					<Select
						options={projectAreas}
						placeholder="Select project area"
						allowClear
					/>
				</Form.Item>
			</Col>
			<Col xs={24} md={12}>
				<Form.Item
					name="skills"
					label={<FormLabel text="Required Skills" isBold />}
				>
					<TreeSelect
						treeData={skillTreeData}
						placeholder="Select skills"
						showSearch
						multiple
						allowClear
						treeCheckable={false}
						showCheckedStrategy={TreeSelect.SHOW_CHILD}
						style={{ width: '100%' }}
						dropdownStyle={{
							maxHeight: 400,
							overflow: 'auto',
						}}
					/>
				</Form.Item>
			</Col>
			<Col xs={24} md={12}>
				<Form.Item
					name="responsibility"
					label={<FormLabel text="Expected Responsibility" isBold />}
				>
					<Select
						options={responsibilityOptions}
						placeholder="Select responsibility"
						allowClear
					/>
				</Form.Item>
			</Col>
		</Row>
	);
}
