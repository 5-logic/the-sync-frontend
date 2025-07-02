import { Col, Form, Input, Row, Select, TreeSelect } from 'antd';

import { FormLabel } from '@/components/common/FormLabel';
import mockSkills from '@/data/skill';
import mockSkillSets from '@/data/skillSet';
import { mockTheses } from '@/data/thesis';

// Constants for better maintainability
const VALIDATION_RULES = {
	GROUP_NAME: {
		MIN_LENGTH: 3,
		MAX_LENGTH: 50,
	},
	TREE_SELECT: {
		MAX_HEIGHT: 400,
	},
} as const;

const FORM_STYLES = {
	requiredLabel: {
		fontWeight: 600,
	},
	requiredMark: {
		color: '#ff4d4f',
		marginLeft: 4,
	},
	treeSelectDropdown: {
		maxHeight: VALIDATION_RULES.TREE_SELECT.MAX_HEIGHT,
		overflow: 'auto',
	},
} as const;

// Pre-computed project areas to avoid recalculation
const projectAreas = Array.from(new Set(mockTheses.map((t) => t.domain))).map(
	(domain) => ({
		value: domain,
		label: domain,
	}),
);

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

const responsibilityOptions = [
	{ value: 'Researcher', label: 'Researcher' },
	{ value: 'Developer', label: 'Developer' },
];

/**
 * Form fields component for group creation
 * Includes group name, project area, skills, and responsibility selection
 *
 * @returns React component with form fields for group creation
 */
export default function GroupFormFields() {
	const getGroupNameRules = () => [
		{ required: true, message: 'Please enter group name' },
		{
			min: VALIDATION_RULES.GROUP_NAME.MIN_LENGTH,
			message: `Group name must be at least ${VALIDATION_RULES.GROUP_NAME.MIN_LENGTH} characters`,
		},
		{
			max: VALIDATION_RULES.GROUP_NAME.MAX_LENGTH,
			message: `Group name must be less than ${VALIDATION_RULES.GROUP_NAME.MAX_LENGTH} characters`,
		},
	];

	return (
		<Row gutter={[16, 16]}>
			<Col xs={24} md={12}>
				<Form.Item
					name="name"
					label={
						<span style={FORM_STYLES.requiredLabel}>
							Group Name
							<span style={FORM_STYLES.requiredMark}>*</span>
						</span>
					}
					rules={getGroupNameRules()}
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
						dropdownStyle={FORM_STYLES.treeSelectDropdown}
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
