import { Col, Form, Input, Row, Select, TreeSelect } from 'antd';
import { useEffect, useMemo } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { THESIS_DOMAINS } from '@/lib/constants/domains';
import { useResponsibilityStore, useSkillSetStore } from '@/store';

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

export default function GroupFormFields() {
	// Fetch data from stores
	const {
		skillSets,
		loading: skillsLoading,
		fetchSkillSets,
	} = useSkillSetStore();
	const {
		responsibilities,
		loading: responsibilitiesLoading,
		fetchResponsibilities,
	} = useResponsibilityStore();

	// Fetch data on component mount
	useEffect(() => {
		fetchSkillSets();
		fetchResponsibilities();
	}, [fetchSkillSets, fetchResponsibilities]);

	// Project areas from constants
	const projectAreas = useMemo(
		() =>
			THESIS_DOMAINS.map((domain) => ({
				value: domain,
				label: domain,
			})),
		[],
	);

	// Build skill tree data from API
	const skillTreeData = useMemo(() => {
		if (!skillSets || skillSets.length === 0) return [];

		return skillSets.map((set) => ({
			value: set.id,
			title: set.name,
			selectable: false,
			children:
				set.skills?.map((skill) => ({
					value: skill.id,
					title: skill.name,
				})) || [],
		}));
	}, [skillSets]);

	// Build responsibility options from API
	const responsibilityOptions = useMemo(() => {
		if (!responsibilities || responsibilities.length === 0) return [];

		return responsibilities.map((responsibility) => ({
			value: responsibility.id,
			label: responsibility.name,
		}));
	}, [responsibilities]);
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
					label={<FormLabel text="Group Name" isBold isRequired />}
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
						loading={skillsLoading}
						dropdownStyle={{
							maxHeight: VALIDATION_RULES.TREE_SELECT.MAX_HEIGHT,
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
						mode="multiple"
						options={responsibilityOptions}
						placeholder="Select responsibilities"
						allowClear
						showSearch
						loading={responsibilitiesLoading}
						filterOption={(input, option) =>
							(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
						}
					/>
				</Form.Item>
			</Col>
		</Row>
	);
}
