import { Button, Col, Form, Row, Select, TreeSelect } from 'antd';
import { useCallback } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import mockSkills from '@/data/skill';
import mockSkillSets from '@/data/skillSet';

// Constants for better maintainability
const FORM_CONFIG = {
	TREE_SELECT_MAX_HEIGHT: 400,
	BUTTON_HEIGHT: 40,
	BUTTON_MIN_WIDTH: 120,
	BUTTON_FONT_SIZE: 14,
} as const;

const BUTTON_STYLES = {
	marginTop: 16,
	minWidth: FORM_CONFIG.BUTTON_MIN_WIDTH,
	fontSize: FORM_CONFIG.BUTTON_FONT_SIZE,
	height: FORM_CONFIG.BUTTON_HEIGHT,
	padding: '0 16px',
	whiteSpace: 'nowrap' as const,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
} as const;

const responsibilityOptions = [
	{ value: 'Researcher', label: 'Researcher' },
	{ value: 'Developer', label: 'Developer' },
];

/**
 * Builds skill tree data structure for TreeSelect component
 * @returns Array of skill sets with their associated skills
 */
const buildSkillTreeData = () =>
	mockSkillSets.map((set) => ({
		value: set.id,
		title: set.name,
		selectable: false,
		children: mockSkills
			.filter((skill) => skill.skillSetId === set.id)
			.map((skill) => ({
				value: skill.id,
				title: skill.name,
			})),
	}));

// Pre-computed skill tree data to avoid recalculation
const skillTreeData = buildSkillTreeData();

interface FormValues {
	readonly skills: string[];
	readonly responsibility?: string[];
}

/**
 * Form component for joining a group based on skills and responsibilities
 * Allows students to specify their skills and get group suggestions
 *
 * @returns React form component for group joining
 */
export default function JoinGroupForm() {
	const handleFinish = useCallback((values: FormValues) => {
		// TODO: Implement actual group suggestion logic
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
								maxHeight: FORM_CONFIG.TREE_SELECT_MAX_HEIGHT,
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
					<Button type="primary" htmlType="submit" style={BUTTON_STYLES}>
						Suggest Groups
					</Button>
				</Col>
			</Row>
		</Form>
	);
}
