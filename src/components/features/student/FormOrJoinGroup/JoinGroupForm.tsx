import { Button, Col, Form, Row, Select, TreeSelect } from 'antd';
import { useCallback } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import mockSkills from '@/data/skill';
import mockSkillSets from '@/data/skillSet';

const responsibilityOptions = [
	{ value: 'Researcher', label: 'Researcher' },
	{ value: 'Developer', label: 'Developer' },
];

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

export default function JoinGroupForm() {
	const handleFinish = useCallback((values: Record<string, unknown>) => {
		console.log('Suggest group values:', values);
	}, []);

	return (
		<Form layout="vertical" requiredMark={false} onFinish={handleFinish}>
			<Row gutter={[16, 16]}>
				<Col xs={24} md={12}>
					<Form.Item
						name="skills"
						label={<FormLabel text="Skills" isBold />}
						required
						style={{ marginBottom: 0 }}
						rules={[
							{
								required: true,
								message: 'Please select at least one skill',
							},
						]}
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
						label={<FormLabel text="Responsibility" isBold />}
						style={{ marginBottom: 0 }}
					>
						<Select
							mode="multiple"
							options={responsibilityOptions}
							placeholder="Select responsibility"
							style={{ width: '100%' }}
						/>
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col>
					<Button
						type="primary"
						htmlType="submit"
						style={{
							marginTop: 16,
							minWidth: 120,
							fontSize: 14,
							height: 40,
							padding: '0 16px',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						Suggest Groups
					</Button>
				</Col>
			</Row>
		</Form>
	);
}
