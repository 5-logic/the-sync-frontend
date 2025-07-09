import { Col, Form, Input, Row, Select, TreeSelect } from 'antd';
import { memo, useEffect, useMemo } from 'react';

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

function GroupFormFields() {
	// Use separate, stable selectors to prevent re-renders
	const skillSets = useSkillSetStore((state) => state.skillSets);
	const skillsLoading = useSkillSetStore((state) => state.loading);
	const fetchSkillSets = useSkillSetStore((state) => state.fetchSkillSets);

	const responsibilities = useResponsibilityStore(
		(state) => state.responsibilities,
	);
	const responsibilitiesLoading = useResponsibilityStore(
		(state) => state.loading,
	);
	const fetchResponsibilities = useResponsibilityStore(
		(state) => state.fetchResponsibilities,
	);

	// Fetch data on component mount
	useEffect(() => {
		fetchSkillSets();
		fetchResponsibilities();
		// ESLint disabled: We want this to run only once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run once on mount

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
				})) ?? [],
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

	// Memoize group name rules to prevent re-creation on every render
	const getGroupNameRules = useMemo(
		() => [
			{ required: true, message: 'Please enter group name' },
			{
				min: VALIDATION_RULES.GROUP_NAME.MIN_LENGTH,
				message: `Group name must be at least ${VALIDATION_RULES.GROUP_NAME.MIN_LENGTH} characters`,
			},
			{
				max: VALIDATION_RULES.GROUP_NAME.MAX_LENGTH,
				message: `Group name must be less than ${VALIDATION_RULES.GROUP_NAME.MAX_LENGTH} characters`,
			},
		],
		[],
	);

	return (
		<Row gutter={[16, 16]}>
			<Col xs={24} md={12}>
				<Form.Item
					name="name"
					label={<FormLabel text="Group Name" isBold isRequired />}
					rules={getGroupNameRules}
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
						treeCheckable={true}
						showCheckedStrategy={TreeSelect.SHOW_CHILD}
						style={{ width: '100%' }}
						loading={skillsLoading}
						dropdownStyle={{
							maxHeight: VALIDATION_RULES.TREE_SELECT.MAX_HEIGHT,
							overflow: 'auto',
						}}
						treeNodeFilterProp="title"
						filterTreeNode={(input, treeNode) => {
							const title = String(treeNode?.title ?? '');
							return title.toLowerCase().includes(input.toLowerCase());
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
							String(option?.label ?? '')
								.toLowerCase()
								.includes(input.toLowerCase())
						}
					/>
				</Form.Item>
			</Col>
		</Row>
	);
}

export default memo(GroupFormFields);
